import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export type AnalyticsData = {
  totalScripts: number;
  avgViralScore: number;
  improvementRate: number;
  bestScript: { title: string; score: number };
  predictions: Array<Record<string, any>>;
  nichePerformance: Array<{ niche: string; count: number; avgScore: number; bestScore: number }>;
  topScripts: Array<Record<string, any>>;
  timeSeriesData: Array<Record<string, any>>;
};

const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: AnalyticsData, filename: string) => {
  const headers = [
    'Date', 'Title', 'Niche', 'Viral Score', 'Engagement', 'Shareability',
    'Hook Strength', 'Emotional Impact', 'Trend Alignment'
  ];
  
  const rows = data.predictions.map(p => [
    format(new Date(p.created_at), 'yyyy-MM-dd'),
    p.title || 'Untitled',
    p.niche || 'N/A',
    p.viral_score || 0,
    p.engagement_score || 0,
    p.shareability_score || 0,
    p.hook_strength || 0,
    p.emotional_impact || 0,
    p.trend_alignment || 0
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: AnalyticsData, filename: string) => {
  const jsonContent = JSON.stringify({
    exportedAt: new Date().toISOString(),
    summary: {
      totalScripts: data.totalScripts,
      avgViralScore: data.avgViralScore,
      improvementRate: data.improvementRate,
      bestScript: data.bestScript
    },
    predictions: data.predictions,
    nichePerformance: data.nichePerformance,
    topScripts: data.topScripts
  }, null, 2);
  
  downloadFile(jsonContent, filename, 'application/json');
};

export const exportToPDF = async (
  data: AnalyticsData,
  chartElements: HTMLElement[],
  filename: string
) => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  doc.setFontSize(24);
  doc.text('Script Analytics Report', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, yPosition);
  yPosition += 20;
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Summary Metrics', 20, yPosition);
  yPosition += 10;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Total Scripts', data.totalScripts.toString()],
      ['Average Viral Score', `${data.avgViralScore.toFixed(1)}/100`],
      ['Improvement Rate', `${data.improvementRate > 0 ? '+' : ''}${data.improvementRate.toFixed(1)}%`],
      ['Best Performance', `${data.bestScript.title} (${data.bestScript.score})`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 20;
  
  if (chartElements.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Performance Charts', 20, 20);
    
    let chartY = 30;
    for (const chartElement of chartElements) {
      try {
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (chartY + imgHeight > 270) {
          doc.addPage();
          chartY = 20;
        }
        
        doc.addImage(imgData, 'PNG', 20, chartY, imgWidth, imgHeight);
        chartY += imgHeight + 10;
      } catch (error) {
        console.error('Error rendering chart:', error);
      }
    }
  }
  
  if (data.topScripts.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Top Performing Scripts', 20, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Title', 'Niche', 'Score', 'Date']],
      body: data.topScripts.slice(0, 10).map(s => [
        s.title?.substring(0, 40) || 'Untitled',
        s.niche || 'N/A',
        s.viral_score?.toString() || '0',
        format(new Date(s.created_at), 'PP')
      ]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });
  }
  
  if (data.nichePerformance.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Niche Performance Analysis', 20, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Niche', 'Scripts', 'Avg Score', 'Best Score']],
      body: data.nichePerformance.map(n => [
        n.niche,
        n.count.toString(),
        n.avgScore.toFixed(1),
        n.bestScore.toString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
  }
  
  doc.save(filename);
};

export const exportToExcel = (data: AnalyticsData, filename: string) => {
  const wb = XLSX.utils.book_new();
  
  const overviewData = [
    ['Metric', 'Value'],
    ['Generated', format(new Date(), 'PPP')],
    ['Total Scripts', data.totalScripts],
    ['Average Viral Score', data.avgViralScore.toFixed(1)],
    ['Improvement Rate', `${data.improvementRate > 0 ? '+' : ''}${data.improvementRate.toFixed(1)}%`],
    ['Best Script', data.bestScript.title],
    ['Best Score', data.bestScript.score]
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');
  
  const predictionsData = data.predictions.map(p => ({
    Date: format(new Date(p.created_at), 'yyyy-MM-dd'),
    Title: p.title || 'Untitled',
    Niche: p.niche || 'N/A',
    'Viral Score': p.viral_score || 0,
    'Engagement': p.engagement_score || 0,
    'Shareability': p.shareability_score || 0,
    'Hook Strength': p.hook_strength || 0,
    'Emotional Impact': p.emotional_impact || 0,
    'Trend Alignment': p.trend_alignment || 0
  }));
  const wsPredictions = XLSX.utils.json_to_sheet(predictionsData);
  XLSX.utils.book_append_sheet(wb, wsPredictions, 'All Predictions');
  
  const nicheData = data.nichePerformance.map(n => ({
    Niche: n.niche,
    'Script Count': n.count,
    'Average Score': n.avgScore.toFixed(1),
    'Best Score': n.bestScore
  }));
  const wsNiche = XLSX.utils.json_to_sheet(nicheData);
  XLSX.utils.book_append_sheet(wb, wsNiche, 'Niche Performance');
  
  const topScriptsData = data.topScripts.map(s => ({
    Title: s.title || 'Untitled',
    Niche: s.niche || 'N/A',
    'Viral Score': s.viral_score || 0,
    Date: format(new Date(s.created_at), 'yyyy-MM-dd')
  }));
  const wsTopScripts = XLSX.utils.json_to_sheet(topScriptsData);
  XLSX.utils.book_append_sheet(wb, wsTopScripts, 'Top Scripts');
  
  XLSX.writeFile(wb, filename);
};

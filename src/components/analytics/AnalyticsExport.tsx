import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Prediction } from "@/lib/analyticsCalculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface AnalyticsExportProps {
  predictions: Prediction[];
  timeRange: string;
}

export const AnalyticsExport = ({ predictions, timeRange }: AnalyticsExportProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const generateFilename = (extension: string) => {
    const date = format(new Date(), 'yyyy-MM-dd');
    return `analytics-export-${timeRange}-${date}.${extension}`;
  };

  const exportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Title', 'Niche', 'Viral Score', 'Engagement', 'Shareability',
        'Hook Strength', 'Emotional Impact', 'Pacing', 'Dialogue', 
        'Quotability', 'Relatability', 'Created At'
      ];
      
      const rows = predictions.map(p => [
        p.title,
        p.niche || 'N/A',
        p.viral_score,
        p.engagement_score,
        p.shareability_score,
        p.hook_strength,
        p.emotional_impact,
        p.pacing_quality,
        p.dialogue_quality,
        p.quotability,
        p.relatability,
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => 
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, generateFilename('csv'));
      
      toast({
        title: "Export Complete",
        description: `Exported ${predictions.length} records to CSV`,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportJSON = () => {
    setIsExporting(true);
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        timeRange,
        totalRecords: predictions.length,
        data: predictions.map(p => ({
          title: p.title,
          niche: p.niche,
          scores: {
            viral: p.viral_score,
            engagement: p.engagement_score,
            shareability: p.shareability_score,
            hookStrength: p.hook_strength,
            emotionalImpact: p.emotional_impact,
            pacing: p.pacing_quality,
            dialogue: p.dialogue_quality,
            quotability: p.quotability,
            relatability: p.relatability
          },
          createdAt: p.created_at
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      downloadBlob(blob, generateFilename('json'));
      
      toast({
        title: "Export Complete",
        description: `Exported ${predictions.length} records to JSON`,
      });
    } catch (error) {
      console.error('JSON export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export JSON file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Analytics Report', 14, 22);
      
      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 30);
      doc.text(`Time Range: ${timeRange}`, 14, 36);
      doc.text(`Total Records: ${predictions.length}`, 14, 42);

      // Summary stats
      const avgScore = predictions.length > 0 
        ? Math.round(predictions.reduce((sum, p) => sum + p.viral_score, 0) / predictions.length)
        : 0;
      const highScorers = predictions.filter(p => p.viral_score >= 80).length;
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Summary', 14, 54);
      doc.setFontSize(10);
      doc.text(`Average Viral Score: ${avgScore}`, 14, 62);
      doc.text(`High Performers (80+): ${highScorers}`, 14, 68);

      // Table
      autoTable(doc, {
        startY: 76,
        head: [['Title', 'Niche', 'Viral', 'Engagement', 'Hook', 'Date']],
        body: predictions.slice(0, 50).map(p => [
          p.title.substring(0, 30),
          p.niche || 'N/A',
          p.viral_score,
          p.engagement_score,
          p.hook_strength,
          format(new Date(p.created_at), 'MM/dd/yy')
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 53, 69] },
      });

      doc.save(generateFilename('pdf'));
      
      toast({
        title: "Export Complete",
        description: `Exported analytics report to PDF`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = () => {
    setIsExporting(true);
    try {
      const worksheetData = predictions.map(p => ({
        'Title': p.title,
        'Niche': p.niche || 'N/A',
        'Viral Score': p.viral_score,
        'Engagement': p.engagement_score,
        'Shareability': p.shareability_score,
        'Hook Strength': p.hook_strength,
        'Emotional Impact': p.emotional_impact,
        'Pacing Quality': p.pacing_quality,
        'Dialogue Quality': p.dialogue_quality,
        'Quotability': p.quotability,
        'Relatability': p.relatability,
        'Created At': format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
      
      XLSX.writeFile(workbook, generateFilename('xlsx'));
      
      toast({
        title: "Export Complete",
        description: `Exported ${predictions.length} records to Excel`,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || predictions.length === 0}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

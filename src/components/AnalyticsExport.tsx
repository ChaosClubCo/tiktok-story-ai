import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON, exportToPDF, exportToExcel, AnalyticsData } from '@/lib/exportUtils';
import { format } from 'date-fns';

interface AnalyticsExportProps {
  data: AnalyticsData;
  chartRefs: React.RefObject<HTMLDivElement>[];
}

export const AnalyticsExport = ({ data, chartRefs }: AnalyticsExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    setIsExporting(true);
    setExportingFormat(format);
    
    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const filename = `analytics-report-${timestamp}`;

      switch (format) {
        case 'csv':
          exportToCSV(data, `${filename}.csv`);
          toast.success('CSV report exported successfully');
          break;
          
        case 'json':
          exportToJSON(data, `${filename}.json`);
          toast.success('JSON report exported successfully');
          break;
          
        case 'pdf':
          const chartElements = chartRefs
            .map(ref => ref.current)
            .filter((el): el is HTMLElement => el !== null);
          await exportToPDF(data, chartElements, `${filename}.pdf`);
          toast.success('PDF report exported successfully');
          break;
          
        case 'excel':
          exportToExcel(data, `${filename}.xlsx`);
          toast.success('Excel report exported successfully');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting {exportingFormat?.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <File className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

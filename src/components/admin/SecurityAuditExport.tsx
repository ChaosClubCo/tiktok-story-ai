import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, Shield, Users, Key, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { format as formatDate, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'csv' | 'pdf';

interface ExportOptions {
  securityAlerts: boolean;
  loginActivity: boolean;
  rateLimits: boolean;
  adminAuditLog: boolean;
}

export const SecurityAuditExport = () => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [dateRange, setDateRange] = useState('last30days');
  const [options, setOptions] = useState<ExportOptions>({
    securityAlerts: true, loginActivity: true, rateLimits: true, adminAuditLog: true,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const getDateRange = () => {
    const end = new Date();
    const days = dateRange === 'last7days' ? 7 : dateRange === 'last90days' ? 90 : 30;
    return { start: subDays(end, days), end };
  };

  const fetchData = async () => {
    const { start, end } = getDateRange();
    const data: any = { securityAlerts: [], loginActivity: [], rateLimits: [], adminAuditLog: [] };
    setProgress(10);

    if (options.securityAlerts) {
      const { data: alerts } = await supabase.from('security_alerts').select('*')
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      data.securityAlerts = alerts || [];
    }
    setProgress(30);

    if (options.loginActivity) {
      const { data: activity } = await supabase.from('login_activity').select('*')
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      data.loginActivity = activity || [];
    }
    setProgress(50);

    if (options.rateLimits) {
      const { data: limits } = await supabase.from('login_rate_limits').select('*')
        .gte('last_attempt_at', start.toISOString());
      data.rateLimits = limits || [];
    }
    setProgress(70);

    if (options.adminAuditLog) {
      const { data: auditLog } = await supabase.from('admin_audit_log').select('*')
        .gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
      data.adminAuditLog = auditLog || [];
    }
    setProgress(90);
    return data;
  };

  const handleExport = async () => {
    if (!Object.values(options).some(Boolean)) {
      toast.error('Select at least one data type'); return;
    }
    setExporting(true); setProgress(0);

    try {
      const data = await fetchData();
      const { start, end } = getDateRange();
      const filename = `security-audit-${formatDate(start, 'yyyyMMdd')}-${formatDate(end, 'yyyyMMdd')}`;

      if (exportFormat === 'csv') {
        let csv = `Security Audit Report\nGenerated: ${new Date().toISOString()}\nPeriod: ${formatDate(start, 'yyyy-MM-dd')} to ${formatDate(end, 'yyyy-MM-dd')}\n\n`;
        if (data.securityAlerts.length) {
          csv += `--- SECURITY ALERTS ---\nType,User,IP,Created\n`;
          data.securityAlerts.forEach((a: any) => csv += `"${a.alert_type}","${a.user_id}","${a.ip_address}","${a.created_at}"\n`);
        }
        if (data.loginActivity.length) {
          csv += `\n--- LOGIN ACTIVITY ---\nUser,Success,IP,Browser,Created\n`;
          data.loginActivity.forEach((a: any) => csv += `"${a.user_id}","${a.success}","${a.ip_address}","${a.browser}","${a.created_at}"\n`);
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`; link.click();
      } else {
        const doc = new jsPDF();
        doc.setFontSize(20); doc.text('Security Audit Report', 14, 20);
        doc.setFontSize(10); doc.text(`Period: ${formatDate(start, 'MMM dd')} - ${formatDate(end, 'MMM dd, yyyy')}`, 14, 30);
        
        let y = 40;
        const summary = [['Security Alerts', data.securityAlerts.length], ['Login Events', data.loginActivity.length],
          ['Rate Limits', data.rateLimits.length], ['Admin Actions', data.adminAuditLog.length]];
        autoTable(doc, { startY: y, head: [['Metric', 'Count']], body: summary, theme: 'striped' });
        doc.save(`${filename}.pdf`);
      }
      setProgress(100);
      toast.success('Report exported successfully!');
    } catch (e: any) {
      toast.error('Export failed', { description: e.message });
    } finally {
      setExporting(false); setProgress(0);
    }
  };

  const toggleOption = (key: keyof ExportOptions) => setOptions(p => ({ ...p, [key]: !p[key] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Security Audit Export</CardTitle>
        <CardDescription>Download security logs as PDF or CSV reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Export Format</Label>
          <div className="flex gap-2">
            <Button variant={exportFormat === 'pdf' ? 'default' : 'outline'} onClick={() => setExportFormat('pdf')} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />PDF
            </Button>
            <Button variant={exportFormat === 'csv' ? 'default' : 'outline'} onClick={() => setExportFormat('csv')} className="flex-1">
              <FileSpreadsheet className="mr-2 h-4 w-4" />CSV
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Include in Report</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'securityAlerts', icon: AlertTriangle, label: 'Security Alerts', color: 'text-red-500' },
              { key: 'loginActivity', icon: Users, label: 'Login Activity', color: 'text-green-500' },
              { key: 'rateLimits', icon: Clock, label: 'Rate Limits', color: 'text-yellow-500' },
              { key: 'adminAuditLog', icon: Shield, label: 'Admin Audit Log', color: 'text-purple-500' },
            ].map(({ key, icon: Icon, label, color }) => (
              <div key={key} className={cn("flex items-center gap-3 rounded-lg border p-3 cursor-pointer",
                options[key as keyof ExportOptions] ? "border-primary bg-primary/5" : "hover:bg-muted/50")}
                onClick={() => toggleOption(key as keyof ExportOptions)}>
                <Checkbox checked={options[key as keyof ExportOptions]} />
                <Icon className={cn("h-4 w-4", color)} /><span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {exporting && <Progress value={progress} />}

        <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg">
          {exporting ? <><Clock className="mr-2 h-4 w-4 animate-spin" />Generating...</> :
            <><Download className="mr-2 h-4 w-4" />Export {exportFormat.toUpperCase()}</>}
        </Button>
      </CardContent>
    </Card>
  );
};

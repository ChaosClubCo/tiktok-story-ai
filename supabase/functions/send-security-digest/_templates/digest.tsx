import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SecurityMetric {
  label: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

interface AlertSummary {
  type: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface DigestEmailProps {
  digestType: 'daily' | 'weekly';
  period: string;
  siteUrl: string;
  brandName?: string;
  brandColor?: string;
  logoUrl?: string;
  metrics: SecurityMetric[];
  alerts: AlertSummary[];
  topIPs?: { ip: string; attempts: number }[];
  recommendations?: string[];
  generatedAt: string;
}

export const SecurityDigestEmail = ({
  digestType = 'daily',
  period = 'Last 24 hours',
  siteUrl,
  brandName = 'MiniDrama',
  brandColor = '#8b5cf6',
  logoUrl,
  metrics = [],
  alerts = [],
  topIPs = [],
  recommendations = [],
  generatedAt,
}: DigestEmailProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>
        {brandName} Security {digestType === 'daily' ? 'Daily' : 'Weekly'} Digest - {period}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} style={logo} />
            ) : (
              <Text style={{ ...brandTitle, color: brandColor }}>🛡️ {brandName}</Text>
            )}
            <Heading style={h1}>
              Security {digestType === 'daily' ? 'Daily' : 'Weekly'} Digest
            </Heading>
            <Text style={periodText}>{period}</Text>
          </Section>

          {/* Metrics Overview */}
          <Section style={metricsSection}>
            <Heading style={h2}>📊 Security Overview</Heading>
            <div style={metricsGrid}>
              {metrics.map((metric, index) => (
                <Section key={index} style={metricCard}>
                  <Text style={metricValue}>{metric.value}</Text>
                  <Text style={metricLabel}>{metric.label}</Text>
                  {metric.change && (
                    <Text style={{ ...metricChange, color: getChangeColor(metric.changeType) }}>
                      {metric.change}
                    </Text>
                  )}
                </Section>
              ))}
            </div>
          </Section>

          {/* Alert Summary */}
          {alerts.length > 0 && (
            <Section style={alertsSection}>
              <Heading style={h2}>⚠️ Alert Summary</Heading>
              <table style={alertsTable}>
                <thead>
                  <tr>
                    <th style={tableHeader}>Alert Type</th>
                    <th style={tableHeader}>Count</th>
                    <th style={tableHeader}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, index) => (
                    <tr key={index}>
                      <td style={tableCell}>{alert.type}</td>
                      <td style={{ ...tableCell, textAlign: 'center' }}>{alert.count}</td>
                      <td style={{ ...tableCell, textAlign: 'center' }}>
                        <span style={{
                          ...severityBadge,
                          backgroundColor: getSeverityColor(alert.severity),
                        }}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Top IPs */}
          {topIPs.length > 0 && (
            <Section style={ipSection}>
              <Heading style={h2}>🔍 Top Suspicious IPs</Heading>
              <table style={alertsTable}>
                <thead>
                  <tr>
                    <th style={tableHeader}>IP Address</th>
                    <th style={tableHeader}>Failed Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {topIPs.map((ip, index) => (
                    <tr key={index}>
                      <td style={tableCell}><code style={codeStyle}>{ip.ip}</code></td>
                      <td style={{ ...tableCell, textAlign: 'center' }}>{ip.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Section style={recommendationsSection}>
              <Heading style={h2}>💡 Recommendations</Heading>
              <ul style={recommendationsList}>
                {recommendations.map((rec, index) => (
                  <li key={index} style={recommendationItem}>{rec}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={`${siteUrl}/admin/security`} style={{ ...button, backgroundColor: brandColor }}>
              View Full Security Dashboard
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security digest from {brandName}.
            </Text>
            <Text style={footerText}>
              Generated at {generatedAt}
            </Text>
            <Text style={footerLinks}>
              <Link href={`${siteUrl}/admin/security`} style={link}>Security Dashboard</Link>
              {' | '}
              <Link href={`${siteUrl}/settings`} style={link}>Manage Preferences</Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SecurityDigestEmail

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  padding: '40px 20px',
  margin: '0 auto',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  width: '48px',
  height: '48px',
  margin: '0 auto 16px',
}

const brandTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
}

const h2 = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
}

const periodText = {
  color: '#a3a3a3',
  fontSize: '14px',
  margin: '0',
}

const metricsSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const metricsGrid = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '16px',
}

const metricCard = {
  flex: '1 1 120px',
  backgroundColor: '#262626',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
}

const metricValue = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const metricLabel = {
  color: '#a3a3a3',
  fontSize: '12px',
  margin: '0',
  textTransform: 'uppercase' as const,
}

const metricChange = {
  fontSize: '12px',
  margin: '4px 0 0',
}

const alertsSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const alertsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tableHeader = {
  color: '#a3a3a3',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
  padding: '8px 12px',
  borderBottom: '1px solid #374151',
}

const tableCell = {
  color: '#e5e5e5',
  fontSize: '14px',
  padding: '12px',
  borderBottom: '1px solid #262626',
}

const severityBadge = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '10px',
  fontWeight: 'bold',
}

const ipSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const codeStyle = {
  backgroundColor: '#262626',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '13px',
}

const recommendationsSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
}

const recommendationsList = {
  margin: '0',
  paddingLeft: '20px',
}

const recommendationItem = {
  color: '#e5e5e5',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 28px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#262626',
  margin: '32px 0',
}

const footer = {
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '8px 0',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '16px 0',
}

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
}

const copyright = {
  color: '#525252',
  fontSize: '11px',
  margin: '24px 0 0',
}

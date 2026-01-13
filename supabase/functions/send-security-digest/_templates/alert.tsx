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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SecurityAlertEmailProps {
  alertType: 'critical_breach' | 'suspicious_activity' | 'rate_limit' | 'failed_auth' | 'new_device' | 'api_abuse';
  siteUrl: string;
  brandName?: string;
  brandColor?: string;
  details: {
    title: string;
    description: string;
    timestamp: string;
    ipAddress?: string;
    location?: string;
    userAgent?: string;
    affectedUser?: string;
    additionalInfo?: Record<string, string>;
  };
  actionRequired: boolean;
  recommendations?: string[];
}

export const SecurityAlertEmail = ({
  alertType,
  siteUrl,
  brandName = 'MiniDrama',
  brandColor = '#8b5cf6',
  details,
  actionRequired = false,
  recommendations = [],
}: SecurityAlertEmailProps) => {
  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'critical_breach':
        return { icon: '🚨', color: '#ef4444', label: 'CRITICAL SECURITY ALERT' };
      case 'suspicious_activity':
        return { icon: '⚠️', color: '#f97316', label: 'Suspicious Activity Detected' };
      case 'rate_limit':
        return { icon: '🛡️', color: '#eab308', label: 'Rate Limit Triggered' };
      case 'failed_auth':
        return { icon: '🔒', color: '#f97316', label: 'Multiple Failed Login Attempts' };
      case 'new_device':
        return { icon: '📱', color: '#3b82f6', label: 'New Device Login' };
      case 'api_abuse':
        return { icon: '🔧', color: '#ef4444', label: 'API Abuse Detected' };
      default:
        return { icon: '🔔', color: '#6b7280', label: 'Security Notice' };
    }
  };

  const config = getAlertConfig(alertType);

  return (
    <Html>
      <Head />
      <Preview>
        {config.icon} {brandName}: {config.label}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Alert Banner */}
          <Section style={{ ...alertBanner, backgroundColor: config.color }}>
            <Text style={alertIcon}>{config.icon}</Text>
            <Text style={alertLabel}>{config.label}</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Heading style={h1}>{details.title}</Heading>
            <Text style={description}>{details.description}</Text>

            {/* Event Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Event Details</Text>
              
              <table style={detailsTable}>
                <tbody>
                  <tr>
                    <td style={detailLabel}>Timestamp</td>
                    <td style={detailValue}>{details.timestamp}</td>
                  </tr>
                  {details.ipAddress && (
                    <tr>
                      <td style={detailLabel}>IP Address</td>
                      <td style={detailValue}>
                        <code style={codeStyle}>{details.ipAddress}</code>
                      </td>
                    </tr>
                  )}
                  {details.location && (
                    <tr>
                      <td style={detailLabel}>Location</td>
                      <td style={detailValue}>{details.location}</td>
                    </tr>
                  )}
                  {details.userAgent && (
                    <tr>
                      <td style={detailLabel}>User Agent</td>
                      <td style={detailValue}>
                        <code style={{ ...codeStyle, fontSize: '11px' }}>{details.userAgent}</code>
                      </td>
                    </tr>
                  )}
                  {details.affectedUser && (
                    <tr>
                      <td style={detailLabel}>Affected User</td>
                      <td style={detailValue}>{details.affectedUser}</td>
                    </tr>
                  )}
                  {details.additionalInfo && Object.entries(details.additionalInfo).map(([key, value]) => (
                    <tr key={key}>
                      <td style={detailLabel}>{key}</td>
                      <td style={detailValue}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Action Required Banner */}
            {actionRequired && (
              <Section style={actionRequiredBox}>
                <Text style={actionRequiredText}>
                  ⚡ Immediate Action Required
                </Text>
                <Text style={actionRequiredSubtext}>
                  Please review this security event and take appropriate action.
                </Text>
              </Section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Section style={recommendationsBox}>
                <Text style={recommendationsTitle}>💡 Recommended Actions</Text>
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
                View Security Dashboard
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security alert from {brandName}.
            </Text>
            <Text style={footerText}>
              If you did not expect this alert, please contact your administrator immediately.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${siteUrl}/admin/security`} style={link}>Security Dashboard</Link>
              {' | '}
              <Link href={`${siteUrl}/settings`} style={link}>Alert Settings</Link>
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

export default SecurityAlertEmail

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  margin: '0 auto',
  maxWidth: '600px',
}

const alertBanner = {
  textAlign: 'center' as const,
  padding: '20px',
  borderRadius: '12px 12px 0 0',
}

const alertIcon = {
  fontSize: '36px',
  margin: '0 0 8px',
}

const alertLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0',
}

const contentSection = {
  backgroundColor: '#1a1a1a',
  padding: '32px 24px',
  borderRadius: '0 0 12px 12px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
}

const description = {
  color: '#d4d4d4',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const detailsBox = {
  backgroundColor: '#262626',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const detailsTitle = {
  color: '#a3a3a3',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
  letterSpacing: '0.5px',
}

const detailsTable = {
  width: '100%',
}

const detailLabel = {
  color: '#a3a3a3',
  fontSize: '13px',
  padding: '8px 16px 8px 0',
  verticalAlign: 'top' as const,
  whiteSpace: 'nowrap' as const,
}

const detailValue = {
  color: '#e5e5e5',
  fontSize: '13px',
  padding: '8px 0',
  wordBreak: 'break-all' as const,
}

const codeStyle = {
  backgroundColor: '#374151',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
}

const actionRequiredBox = {
  backgroundColor: '#7f1d1d',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const actionRequiredText = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 4px',
}

const actionRequiredSubtext = {
  color: '#fca5a5',
  fontSize: '14px',
  margin: '0',
}

const recommendationsBox = {
  backgroundColor: '#262626',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const recommendationsTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const recommendationsList = {
  margin: '0',
  paddingLeft: '20px',
}

const recommendationItem = {
  color: '#d4d4d4',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '4px',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginTop: '24px',
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
  margin: '24px 20px',
}

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px 40px',
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

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

interface NotificationEmailProps {
  userName?: string
  siteUrl: string
  notificationType: 'script_complete' | 'series_published' | 'prediction_ready' | 'weekly_digest'
  title: string
  message: string
  ctaText?: string
  ctaUrl?: string
}

export const NotificationEmail = ({
  userName = 'Creator',
  siteUrl,
  notificationType,
  title,
  message,
  ctaText = 'View Details',
  ctaUrl,
}: NotificationEmailProps) => {
  const icons: Record<string, string> = {
    script_complete: '📝',
    series_published: '🎬',
    prediction_ready: '📊',
    weekly_digest: '📈',
  }

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {icons[notificationType] || '🔔'} {title}
          </Heading>
          
          <Text style={text}>
            Hey {userName},
          </Text>
          
          <Section style={messageSection}>
            <Text style={messageText}>{message}</Text>
          </Section>
          
          {ctaUrl && (
            <Link href={ctaUrl} style={button}>
              {ctaText}
            </Link>
          )}
          
          <Hr style={hr} />
          
          <Text style={footerText}>
            <Link href={`${siteUrl}/settings`} style={link}>
              Manage notification preferences
            </Link>
          </Text>
          
          <Text style={signature}>
            — The MiniDrama Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NotificationEmail

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  padding: '40px 20px',
  margin: '0 auto',
  maxWidth: '560px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const messageSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const messageText = {
  color: '#e5e5e5',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '14px 24px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '24px auto',
  maxWidth: '200px',
}

const hr = {
  borderColor: '#262626',
  margin: '32px 0',
}

const footerText = {
  color: '#737373',
  fontSize: '14px',
  textAlign: 'center' as const,
}

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
}

const signature = {
  color: '#a3a3a3',
  fontSize: '14px',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

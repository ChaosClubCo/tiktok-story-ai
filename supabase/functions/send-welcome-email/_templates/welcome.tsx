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

interface WelcomeEmailProps {
  userName?: string
  siteUrl: string
}

export const WelcomeEmail = ({
  userName = 'Creator',
  siteUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MiniDrama - Your content empire starts here!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to MiniDrama! 🎬</Heading>
        
        <Text style={text}>
          Hey {userName},
        </Text>
        
        <Text style={text}>
          We're thrilled to have you join MiniDrama! You're now part of a community of 
          creators who are revolutionizing short-form content with AI-powered scripts.
        </Text>
        
        <Section style={featureSection}>
          <Text style={featureTitle}>Here's what you can do:</Text>
          <Text style={featureItem}>✨ Generate viral scripts in seconds</Text>
          <Text style={featureItem}>📈 Predict content performance before posting</Text>
          <Text style={featureItem}>🎯 Create multi-episode series that hook viewers</Text>
          <Text style={featureItem}>🎨 Customize hooks and CTAs for maximum engagement</Text>
        </Section>
        
        <Link
          href={`${siteUrl}/dashboard`}
          style={button}
        >
          Start Creating Now
        </Link>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          Need help? Reply to this email or visit our{' '}
          <Link href={`${siteUrl}`} style={link}>
            support center
          </Link>
          .
        </Text>
        
        <Text style={signature}>
          Happy creating,<br />
          The MiniDrama Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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
  fontSize: '28px',
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

const featureSection = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const featureTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const featureItem = {
  color: '#a3a3a3',
  fontSize: '14px',
  margin: '8px 0',
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
  maxWidth: '240px',
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

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VerificationEmailProps {
  verificationUrl: string
  token?: string
}

export const VerificationEmail = ({
  verificationUrl,
  token,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to get started with MiniDrama</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify Your Email ✉️</Heading>
        
        <Text style={text}>
          Thanks for signing up for MiniDrama! Please verify your email address 
          to complete your registration and start creating viral content.
        </Text>
        
        <Link
          href={verificationUrl}
          style={button}
        >
          Verify Email Address
        </Link>
        
        {token && (
          <>
            <Text style={codeText}>
              Or use this verification code:
            </Text>
            <code style={code}>{token}</code>
          </>
        )}
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          If you didn't create an account with MiniDrama, you can safely ignore this email.
        </Text>
        
        <Text style={footerText}>
          This link will expire in 24 hours.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

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
  textAlign: 'center' as const,
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

const codeText = {
  color: '#a3a3a3',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0 12px',
}

const code = {
  display: 'block',
  padding: '16px',
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  border: '1px solid #262626',
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '4px',
  margin: '0 auto',
  maxWidth: '280px',
}

const hr = {
  borderColor: '#262626',
  margin: '32px 0',
}

const footerText = {
  color: '#737373',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '8px 0',
}

/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join SpeakAble HK</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://shuhmvmdkjspgawygqyf.supabase.co/storage/v1/object/public/email-assets/logo.png"
          width="48"
          height="48"
          alt="SpeakAble HK"
          style={logo}
        />
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>SpeakAble HK</strong>
          </Link>
          — an AI-powered Cantonese pronunciation platform. Click below to accept and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Source Sans 3', 'Segoe UI', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { marginBottom: '24px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'Space Grotesk', 'Segoe UI', Arial, sans-serif",
  color: '#111827',
  margin: '0 0 20px',
}
const text = {
  fontSize: '16px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const link = { color: '#3B82F6', textDecoration: 'underline' }
const button = {
  backgroundColor: '#3B82F6',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#9ca3af', margin: '32px 0 0', lineHeight: '1.5' }

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Test endpoint to verify email configuration
export async function GET(request: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    return NextResponse.json({
      configured: false,
      message: 'RESEND_API_KEY is not set in environment variables',
      instructions: [
        '1. Sign up for Resend at https://resend.com',
        '2. Get your API key from the dashboard',
        '3. Create a .env.local file in the website directory',
        '4. Add: RESEND_API_KEY=re_xxxxxxxxxxxxx',
        '5. Restart your development server'
      ]
    });
  }

  // Test sending an email
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['yashar.mansoori@chalmers.se'],
        subject: 'Test Email from Sustainability Atlas',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from the Sustainability Atlas contact form.</p>
          <p>If you receive this, the email service is working correctly!</p>
        `,
        text: 'This is a test email from the Sustainability Atlas contact form. If you receive this, the email service is working correctly!',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        configured: true,
        working: false,
        error: data,
        status: response.status,
        message: 'API key is set but email sending failed. Check the error details above.'
      });
    }

    return NextResponse.json({
      configured: true,
      working: true,
      emailId: data.id,
      message: 'Test email sent successfully! Check yashar.mansoori@chalmers.se inbox.'
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to send test email'
    });
  }
}

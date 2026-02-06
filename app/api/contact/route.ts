import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      // Fallback: log to console if Resend is not configured
      console.log('Contact form submission (Resend not configured):');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Message:', message);
      
      return NextResponse.json(
        { 
          message: 'Email service not configured. Please set RESEND_API_KEY in your environment variables. Message logged to console.',
          logged: true
        },
        { status: 200 }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Resend's default test domain
        to: ['yashar.mansoori@chalmers.se'],
        reply_to: email, // Allow replying directly to the user
        subject: `Contact Form: ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}
        `,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send email';
      if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your RESEND_API_KEY.';
      } else if (response.status === 422) {
        errorMessage = 'Invalid email configuration. Please verify your Resend setup.';
      }
      
      return NextResponse.json(
        { message: errorMessage, details: responseData },
        { status: response.status }
      );
    }

    console.log('Email sent successfully:', responseData);
    
    return NextResponse.json(
      { message: 'Message sent successfully', id: responseData.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}

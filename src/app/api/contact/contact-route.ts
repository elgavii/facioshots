import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'support@facioshots.com',
      to: 'support@facioshots.com',
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#FAF8F4;">
          <h2 style="font-family:Georgia,serif;font-weight:300;margin-bottom:24px;">New message — facioshots.com/contact</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin-top:16px;"><strong>Message:</strong></p>
          <p style="background:#F5F0E8;padding:16px;line-height:1.7;margin-top:8px;">${message.replace(/\n/g, '<br>')}</p>
          <p style="color:#8A8278;font-size:0.8rem;margin-top:24px;">Reply to this email to respond to ${name}.</p>
        </div>
      `,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}

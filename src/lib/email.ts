import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'headshots@facioshots.com'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://facioshots.com'

export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  plan: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your FACIOSHOTS headshots are being generated ✦',
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF8F4;color:#1A1814;">
        <h1 style="font-family:Georgia,serif;font-weight:300;font-size:2rem;margin-bottom:8px;">FACIOSHOTS</h1>
        <p style="color:#8A8278;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:32px;">AI Professional Headshots</p>
        <hr style="border:none;border-top:1px solid rgba(26,24,20,0.1);margin-bottom:32px;">
        <h2 style="font-family:Georgia,serif;font-weight:300;font-size:1.6rem;margin-bottom:16px;">Your order is confirmed</h2>
        <p style="color:#8A8278;line-height:1.7;margin-bottom:24px;">
          We've received your <strong style="color:#1A1814">${plan}</strong> order and your AI model is now training.
          This typically takes 8–20 minutes. We'll email you the moment your headshots are ready.
        </p>
        <div style="background:#F5F0E8;padding:24px;margin-bottom:24px;">
          <p style="font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;color:#8A8278;margin-bottom:8px;">Order ID</p>
          <p style="font-family:monospace;font-size:0.9rem;">${orderId}</p>
        </div>
        <p style="color:#8A8278;font-size:0.85rem;line-height:1.7;">
          You can check your progress anytime at:<br>
          <a href="${BASE_URL}/results/${orderId}" style="color:#C9A84C;">${BASE_URL}/results/${orderId}</a>
        </p>
        <hr style="border:none;border-top:1px solid rgba(26,24,20,0.1);margin:32px 0 24px;">
        <p style="color:#8A8278;font-size:0.75rem;">Questions? Reply to this email. We respond within 2 hours.</p>
      </div>
    `,
  })
}

export async function sendHeadshotsReady(
  email: string,
  orderId: string,
  imageUrls: string[]
) {
  const previewImages = imageUrls.slice(0, 4)

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '✦ Your FACIOSHOTS headshots are ready!',
    html: `
      <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF8F4;color:#1A1814;">
        <h1 style="font-family:Georgia,serif;font-weight:300;font-size:2rem;margin-bottom:8px;">FACIOSHOTS</h1>
        <p style="color:#8A8278;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:32px;">AI Professional Headshots</p>
        <hr style="border:none;border-top:1px solid rgba(26,24,20,0.1);margin-bottom:32px;">
        <h2 style="font-family:Georgia,serif;font-weight:300;font-size:1.6rem;margin-bottom:8px;">Your headshots are ready ✦</h2>
        <p style="color:#8A8278;line-height:1.7;margin-bottom:32px;">
          ${imageUrls.length} professional headshots have been generated and are waiting for you.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:32px;">
          ${previewImages.map(url => `<img src="${url}" style="width:100%;aspect-ratio:3/4;object-fit:cover;" alt="Your headshot preview">`).join('')}
        </div>
        <a href="${BASE_URL}/results/${orderId}"
           style="display:block;background:#1A1814;color:#FAF8F4;text-align:center;padding:16px 32px;text-decoration:none;font-size:0.82rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;">
          View &amp; Download All ${imageUrls.length} Photos
        </a>
        <p style="color:#8A8278;font-size:0.78rem;text-align:center;line-height:1.6;">
          Your photos are available for 30 days · 2048×2048px · Print ready
        </p>
        <hr style="border:none;border-top:1px solid rgba(26,24,20,0.1);margin:32px 0 24px;">
        <p style="color:#8A8278;font-size:0.75rem;">Loved your headshots? Share <a href="https://facioshots.com" style="color:#C9A84C;">facioshots.com</a> with a colleague.</p>
      </div>
    `,
  })
}

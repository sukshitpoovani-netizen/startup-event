import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!resend) {
    console.warn("Resend not configured. Email would have been sent to:", to);
    console.warn("Subject:", subject);
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const from = process.env.RESEND_FROM_EMAIL || "Startup Expo <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("Email send failed:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export function registrationConfirmationHtml(params: {
  participantName: string;
  eventName: string;
  ticketNumber: string;
  registrationId: string;
  ticketType: string;
  qrCodeUrl?: string;
  eventDate?: string;
  venue?: string;
  spocName?: string;
  spocEmail?: string;
  spocPhone?: string;
  ticketUrl: string;
}) {
  const {
    participantName,
    eventName,
    ticketNumber,
    registrationId,
    ticketType,
    qrCodeUrl,
    eventDate,
    venue,
    spocName,
    spocEmail,
    spocPhone,
    ticketUrl,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#0f172a;color:#fff;padding:24px 32px;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:22px;font-weight:700;">${eventName}</h1>
      <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Registration Confirmed</p>
    </div>
    
    <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi <strong>${participantName}</strong>,</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
        Your registration for <strong>${eventName}</strong> is confirmed. Please find your ticket details below.
      </p>

      <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#64748b;">Ticket Number</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${ticketNumber}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Registration ID</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${registrationId}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;">Ticket Type</td>
            <td style="padding:6px 0;text-align:right;font-weight:600;">${ticketType}</td>
          </tr>
          ${eventDate ? `<tr><td style="padding:6px 0;color:#64748b;">Date</td><td style="padding:6px 0;text-align:right;">${eventDate}</td></tr>` : ""}
          ${venue ? `<tr><td style="padding:6px 0;color:#64748b;">Venue</td><td style="padding:6px 0;text-align:right;">${venue}</td></tr>` : ""}
        </table>
      </div>

      ${
        qrCodeUrl
          ? `<div style="text-align:center;margin:24px 0;">
              <img src="${qrCodeUrl}" alt="QR Code" width="180" height="180" style="display:inline-block;border:1px solid #e2e8f0;border-radius:8px;" />
              <p style="margin:12px 0 0;font-size:13px;color:#64748b;">Show this QR code at the entrance</p>
            </div>`
          : ""
      }

      <div style="text-align:center;margin:28px 0;">
        <a href="${ticketUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          View Your Ticket
        </a>
      </div>

      ${
        spocName
          ? `<div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Your Point of Contact</p>
              <p style="margin:0;font-weight:600;">${spocName}</p>
              ${spocEmail ? `<p style="margin:4px 0 0;font-size:14px;"><a href="mailto:${spocEmail}" style="color:#0f172a;">${spocEmail}</a></p>` : ""}
              ${spocPhone ? `<p style="margin:4px 0 0;font-size:14px;">${spocPhone}</p>` : ""}
            </div>`
          : ""
      }

      <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
        If you have any questions, reply to this email or contact the organizing team.
      </p>
    </div>
  </div>
</body>
</html>
`;
}

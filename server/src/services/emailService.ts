import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

export interface EmailResult {
  success: boolean;
  provider: "resend" | "mock";
  id?: string;
  error?: string;
}

export function resolveResendApiKey(explicitKey?: string): string {
  if (explicitKey && typeof explicitKey === "string" && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }

  return (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.NEXT_PUBLIC_RESEND_API_KEY ||
    ""
  ).trim();
}

/**
 * Sends an OTP email using the Resend API (https://resend.com)
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  explicitApiKey?: string
): Promise<EmailResult> {
  const apiKey = resolveResendApiKey(explicitApiKey);
  const normalizedEmail = toEmail.trim().toLowerCase();

  const fromEmail = process.env.RESEND_FROM_EMAIL || "EchoChat <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[EMAIL MOCK] ========================================`);
    console.log(`[EMAIL MOCK] Recipient: ${normalizedEmail}`);
    console.log(`[EMAIL MOCK] Generated OTP: ${otp}`);
    console.log(`[EMAIL MOCK] (Set RESEND_API_KEY in Render environment to send real email)`);
    console.log(`[EMAIL MOCK] ========================================`);

    return {
      success: true,
      provider: "mock",
      error: "No RESEND_API_KEY found in environment",
    };
  }

  console.log(`[Resend] Sending OTP to ${normalizedEmail} via Resend API...`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05080d; color: #f4f7fb; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #0c1524; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; padding: 32px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #00e6a0; margin-bottom: 20px; }
          h2 { color: #f4f7fb; font-size: 20px; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .otp-card { background: #111e33; border: 1px solid #1c3254; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #00e6a0; margin: 0; font-family: monospace; }
          .warning { font-size: 12px; color: #ef4444; margin-top: 16px; }
          .footer { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ECHOCHAT</div>
          <h2>Verification Code</h2>
          <p>Please enter the following One-Time Password (OTP) to authenticate your EchoChat account:</p>
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code is valid for <strong>5 minutes</strong>.</p>
          <p class="warning">⚠️ Never share this OTP with anyone. EchoChat staff will never ask for your code.</p>
          <div class="footer">
            EchoChat • Secure Real-Time Communication Platform
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "EchoChat/1.0",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [normalizedEmail],
        subject: `Your EchoChat Verification Code: ${otp}`,
        html: htmlContent,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = json?.message || `HTTP ${res.status}`;
      console.error(`[Resend] Failed to deliver email (${res.status}):`, errorMsg);
      return {
        success: false,
        provider: "resend",
        error: errorMsg,
      };
    }

    console.log(`[Resend] Email sent successfully to ${normalizedEmail}! ID:`, json?.id);
    return {
      success: true,
      provider: "resend",
      id: json?.id,
    };
  } catch (err: any) {
    const errorMsg =
      err?.name === "AbortError"
        ? "Resend request timed out"
        : err?.message || "Resend error";
    console.error("[Resend] Error calling Resend API:", errorMsg);
    return {
      success: false,
      provider: "resend",
      error: errorMsg,
    };
  }
}

import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

export interface EmailResult {
  success: boolean;
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

export function resolveResendFromEmail(explicitFrom?: string): string {
  const candidate = (
    explicitFrom ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ||
    ""
  ).trim();

  // If empty or an unverified public domain (e.g., @gmail.com) is supplied,
  // use the verified onboarding domain provided by Resend
  const isPublicDomain =
    candidate.includes("@gmail.com") ||
    candidate.includes("@googlemail.com") ||
    candidate.includes("@yahoo.") ||
    candidate.includes("@outlook.") ||
    candidate.includes("@hotmail.") ||
    candidate.includes("@icloud.");

  if (!candidate || isPublicDomain) {
    return "EchoChat <onboarding@resend.dev>";
  }

  return candidate;
}

/**
 * Sends an OTP email using the Resend API (https://resend.com)
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  explicitApiKey?: string,
  explicitFromEmail?: string
): Promise<EmailResult> {
  const apiKey = resolveResendApiKey(explicitApiKey);
  const fromEmail = resolveResendFromEmail(explicitFromEmail);
  const normalizedEmail = toEmail.trim().toLowerCase();

  if (!apiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables",
    };
  }

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
      let rawError = json?.message || `HTTP ${res.status}`;
      if (typeof rawError === "string" && rawError.includes("can only send testing emails to your own email address")) {
        rawError = `${rawError} (Note: Resend free tier domain onboarding@resend.dev only allows sending to the email registered on your Resend account. Verify a custom domain at resend.com/domains to send to any recipient).`;
      }
      console.error(`[Resend] Delivery failed (${res.status}):`, rawError);
      return {
        success: false,
        error: rawError,
      };
    }

    console.log(`[Resend] Verification email dispatched to ${normalizedEmail}! ID:`, json?.id);
    return {
      success: true,
      id: json?.id,
    };
  } catch (err: any) {
    const errorMsg =
      err?.name === "AbortError"
        ? "Resend request timed out"
        : err?.message || "Resend communication error";
    console.error("[Resend] Network error:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

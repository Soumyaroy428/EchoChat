import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || body.phonenumber || body.mobile;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    // Read Resend and Gmail SMTP configuration from Vercel environment variables
    const resendKey = (
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      ""
    ).trim();

    const resendFrom = (
      process.env.RESEND_FROM_EMAIL ||
      process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ||
      ""
    ).trim();

    const smtpEmail = (
      process.env.SMTP_EMAIL ||
      process.env.GMAIL_USER ||
      process.env.SMTP_USER ||
      ""
    ).trim();

    const smtpPassword = (
      process.env.SMTP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD ||
      process.env.SMTP_PASS ||
      ""
    ).trim().replace(/\s+/g, "");

    // Determine target backend server URL
    const backendEnv =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      process.env.SERVER_URL ||
      "https://echochat-1-2ira.onrender.com";

    let backendBase = backendEnv.trim();
    if (backendBase.endsWith("/api/v1")) {
      backendBase = backendBase.replace(/\/api\/v1$/, "");
    } else if (backendBase.endsWith("/api")) {
      backendBase = backendBase.replace(/\/api$/, "");
    }
    if (backendBase.endsWith("/")) {
      backendBase = backendBase.slice(0, -1);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (resendKey) headers["x-resend-key"] = resendKey;
    if (resendFrom) headers["x-resend-from"] = resendFrom;
    if (smtpEmail) headers["x-smtp-email"] = smtpEmail;
    if (smtpPassword) headers["x-smtp-password"] = smtpPassword;

    const response = await fetch(`${backendBase}/api/auth/sendOtp`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        phonenumber: email.trim(),
        mobile: email.trim(),
        ...(resendKey ? { resendApiKey: resendKey } : {}),
        ...(resendFrom ? { resendFromEmail: resendFrom } : {}),
        ...(smtpEmail ? { smtpEmail } : {}),
        ...(smtpPassword ? { smtpPassword } : {}),
      }),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Vercel API Route] sendOtp proxy error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function getOtpHtml(otp: string): string {
  return `
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
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || body.phonenumber || body.mobile || "").toString().trim();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

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

    // 1. Call Render backend to generate OTP and save into MongoDB
    const backendRes = await fetch(`${backendBase}/api/auth/sendOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-dispatch": "true",
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        phonenumber: email,
        mobile: email,
      }),
      signal: AbortSignal.timeout(12000),
    });

    const backendData = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok || !backendData?.otp) {
      return NextResponse.json(
        { error: backendData?.error || "Failed to generate verification code" },
        { status: backendRes.status || 500 }
      );
    }

    const otp = String(backendData.otp);
    const targetEmail = (backendData.email || email).toLowerCase();

    // 2. Dispatch email directly from Vercel (where Port 465 is open!)
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

    const resendKey = (
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      ""
    ).trim();

    // A. Attempt Gmail SMTP from Vercel (Port 465 is OPEN on Vercel)
    if (smtpEmail && smtpPassword) {
      try {
        console.log(`[Vercel Serverless] Sending OTP to ${targetEmail} via Gmail SMTP (${smtpEmail})...`);

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: smtpEmail,
            pass: smtpPassword,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        });

        await transporter.sendMail({
          from: `EchoChat <${smtpEmail}>`,
          to: targetEmail,
          subject: `Your EchoChat Verification Code: ${otp}`,
          html: getOtpHtml(otp),
        });

        console.log(`[Vercel Serverless] Email sent successfully via Gmail SMTP to ${targetEmail}`);
        return NextResponse.json({
          message: "OTP sent successfully to your email",
          email: targetEmail,
          provider: "smtp",
        });
      } catch (smtpErr: any) {
        console.error("[Vercel Serverless SMTP Error]:", smtpErr?.message || smtpErr);
        if (!resendKey) {
          return NextResponse.json(
            { error: `Gmail SMTP failed: ${smtpErr?.message || "Verify your Google App Password"}` },
            { status: 400 }
          );
        }
      }
    }

    // B. Fall back to Resend API
    if (resendKey) {
      const fromEmail = (process.env.RESEND_FROM_EMAIL || "EchoChat <onboarding@resend.dev>").trim();
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
          "User-Agent": "EchoChat/1.0",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          subject: `Your EchoChat Verification Code: ${otp}`,
          html: getOtpHtml(otp),
        }),
      });

      const resendData = await resendRes.json().catch(() => ({}));

      if (!resendRes.ok) {
        return NextResponse.json(
          { error: resendData?.message || "Resend email delivery failed" },
          { status: resendRes.status }
        );
      }

      return NextResponse.json({
        message: "OTP sent successfully to your email",
        email: targetEmail,
        provider: "resend",
        id: resendData?.id,
      });
    }

    return NextResponse.json(
      { error: "No email provider configured. Please set SMTP_EMAIL and SMTP_PASSWORD in Vercel." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[Vercel API Route] sendOtp error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}

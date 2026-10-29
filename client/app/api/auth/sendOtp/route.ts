import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || body.phonenumber || body.mobile;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    // Read Resend API key from Vercel / server environment variables
    const resendKey = (
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      process.env.NEXT_PUBLIC_RESEND_API_KEY ||
      ""
    ).trim();

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

    console.log(
      `[Vercel API Route] Forwarding sendOtp for ${email} to ${backendBase}/api/auth/sendOtp (Key configured: ${Boolean(
        resendKey
      )})`
    );

    const response = await fetch(`${backendBase}/api/auth/sendOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(resendKey ? { "x-resend-key": resendKey } : {}),
      },
      body: JSON.stringify({
        email,
        phonenumber: email,
        mobile: email,
        ...(resendKey ? { resendApiKey: resendKey } : {}),
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

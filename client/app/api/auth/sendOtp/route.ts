import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawNumber = body.phonenumber || body.mobile;

    if (!rawNumber || typeof rawNumber !== "string") {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Read APITxT API key from Vercel environment variables
    const apitxtKey = (
      process.env.APITXT_API_KEY ||
      process.env.APITXT_KEY ||
      process.env.APITXT_AUTH_KEY ||
      process.env.API_TXT_KEY ||
      process.env.API_TXT_API_KEY ||
      process.env.NEXT_PUBLIC_APITXT_API_KEY ||
      process.env.NEXT_PUBLIC_APITXT_KEY ||
      process.env.NEXT_PUBLIC_APITXT_AUTH_KEY ||
      process.env.APITXT_TOKEN ||
      process.env.SMS_API_KEY ||
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
      `[Vercel API Route] Forwarding sendOtp for ${rawNumber} to ${backendBase}/api/auth/sendOtp (Key configured: ${Boolean(
        apitxtKey
      )})`
    );

    const response = await fetch(`${backendBase}/api/auth/sendOtp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apitxtKey ? { "x-apitxt-key": apitxtKey } : {}),
      },
      body: JSON.stringify({
        phonenumber: rawNumber,
        mobile: rawNumber,
        ...(apitxtKey ? { apitxtApiKey: apitxtKey } : {}),
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

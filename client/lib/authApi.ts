/**
 * Helper to dispatch Email OTP requests via Resend.
 * Uses the Vercel-hosted API route (/api/auth/sendOtp) which forwards
 * RESEND_API_KEY from environment variables to the backend server.
 */
export async function sendOtpRequest(emailOrIdentifier: string): Promise<any> {
  const normalized = emailOrIdentifier.trim();
  const resendKey = (
    process.env.NEXT_PUBLIC_RESEND_API_KEY ||
    process.env.NEXT_PUBLIC_RESEND_KEY ||
    ""
  ).trim();

  // 1. Try Vercel Next.js route first
  try {
    const res = await fetch("/api/auth/sendOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(resendKey ? { "x-resend-key": resendKey } : {}),
      },
      body: JSON.stringify({
        email: normalized,
        phonenumber: normalized,
        mobile: normalized,
        ...(resendKey ? { resendApiKey: resendKey } : {}),
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Local /api/auth/sendOtp call failed, attempting direct backend fallback...", err);
  }

  // 2. Direct backend fallback
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || "https://echochat-1-2ira.onrender.com")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/api\/?$/, "");

  const directRes = await fetch(`${backendBase}/api/auth/sendOtp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(resendKey ? { "x-resend-key": resendKey } : {}),
    },
    body: JSON.stringify({
      email: normalized,
      phonenumber: normalized,
      mobile: normalized,
      ...(resendKey ? { resendApiKey: resendKey } : {}),
    }),
  });

  const data = await directRes.json().catch(() => ({}));
  if (!directRes.ok) {
    throw new Error(data.error || "Failed to send OTP to your email");
  }
  return data;
}

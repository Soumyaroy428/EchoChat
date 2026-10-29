/**
 * Helper to dispatch OTP requests.
 * Prioritizes the Vercel-hosted API route (/api/auth/sendOtp) which has access
 * to Vercel environment variables like APITXT_API_KEY, with automatic fallback
 * to the direct backend URL.
 */
export async function sendOtpRequest(mobile: string): Promise<any> {
  const apitxtKey = (
    process.env.NEXT_PUBLIC_APITXT_API_KEY ||
    process.env.NEXT_PUBLIC_APITXT_KEY ||
    ""
  ).trim();

  // 1. Try Vercel Next.js route first
  try {
    const res = await fetch("/api/auth/sendOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apitxtKey ? { "x-apitxt-key": apitxtKey } : {}),
      },
      body: JSON.stringify({
        phonenumber: mobile,
        mobile,
        ...(apitxtKey ? { apitxtApiKey: apitxtKey } : {}),
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
      ...(apitxtKey ? { "x-apitxt-key": apitxtKey } : {}),
    },
    body: JSON.stringify({
      phonenumber: mobile,
      mobile,
      ...(apitxtKey ? { apitxtApiKey: apitxtKey } : {}),
    }),
  });

  const data = await directRes.json().catch(() => ({}));
  if (!directRes.ok) {
    throw new Error(data.error || "Failed to send OTP");
  }
  return data;
}

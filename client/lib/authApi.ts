/**
 * Helper to dispatch Email OTP requests via Gmail SMTP.
 * Calls the Vercel-hosted API route (/api/auth/sendOtp) which dispatches
 * the 6-digit verification code using Gmail SMTP over port 465.
 */
export async function sendOtpRequest(emailOrIdentifier: string): Promise<any> {
  const email = emailOrIdentifier.trim().toLowerCase();

  // 1. Try Vercel Next.js route first (dispatches via Gmail SMTP on Port 465)
  try {
    const res = await fetch("/api/auth/sendOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        phonenumber: email,
        mobile: email,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return data;
    } else if (data?.error) {
      throw new Error(data.error);
    }
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch")) {
      throw err;
    }
    console.warn("Local /api/auth/sendOtp call failed, attempting direct backend fallback...", err);
  }

  // 2. Direct backend fallback
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || "https://echochat-1-2ira.onrender.com")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "");

  const directRes = await fetch(`${backendBase}/api/auth/sendOtp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      phonenumber: email,
      mobile: email,
    }),
  });

  const data = await directRes.json().catch(() => ({}));
  if (!directRes.ok) {
    throw new Error(data.error || "Failed to send OTP to your email");
  }
  return data;
}

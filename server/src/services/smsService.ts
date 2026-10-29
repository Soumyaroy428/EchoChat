import dns from "node:dns";
import twilio, { RestException } from "twilio";

// Ensure IPv4 first for reliable outbound requests
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in case environment does not support
}

export interface SmsResult {
  success: boolean;
  provider: "apitxt" | "twilio" | "mock";
  messageId?: string;
  error?: string;
  data?: any;
}

/**
 * Format phone number for APITxT:
 * Country code included, but WITHOUT the leading '+' symbol or spaces.
 * E.g., for Indian number 9876543210 -> 919876543210
 */
export function formatMobileForApitxt(mobile: string, defaultCountryCode: string = "91"): string {
  if (!mobile) return "";
  let digits = String(mobile).replace(/\D/g, "");

  // If user entered local number with leading zero e.g. 09876543210
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // If standard 10-digit number without country code, prepend default country code (e.g. 91)
  if (digits.length === 10) {
    return `${defaultCountryCode}${digits}`;
  }

  return digits;
}

/**
 * Convert number to E.164 (with leading +) for Twilio
 */
export function toE164(number: string, defaultCountry = "+91"): string {
  if (!number) throw new Error("No phone number provided");
  const trimmed = String(number).trim().replace(/\s+/g, "");
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${defaultCountry}${digits}`;
  }
  return `+${digits}`;
}

/**
 * Sends OTP SMS using APITxT (https://apitxt.com/api/sendOTP)
 */
export async function sendApitxtOtp(
  mobile: string,
  otp: string,
  apiKey: string
): Promise<SmsResult> {
  const formattedMobile = formatMobileForApitxt(mobile);
  console.log(`[APITxT] Sending OTP to ${formattedMobile}...`);

  const params = new URLSearchParams({
    authkey: apiKey.trim(),
    mobile: formattedMobile,
    otp: otp,
    channel: "sms",
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://apitxt.com/api/sendOTP", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const rawText = await response.text();
    let json: any = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      // not json
    }

    if (
      !response.ok ||
      (json &&
        (json.status === "error" ||
          json.status === "AUTH_FAILED" ||
          json.status === "MISSING_AUTH"))
    ) {
      const errorMsg = json?.message || rawText || `HTTP ${response.status}`;
      console.error(`[APITxT] Failed to send OTP (${response.status}):`, errorMsg);
      return {
        success: false,
        provider: "apitxt",
        error: errorMsg,
        data: json || rawText,
      };
    }

    console.log(`[APITxT] OTP delivered successfully to ${formattedMobile}:`, json || rawText);
    return {
      success: true,
      provider: "apitxt",
      messageId: json?.data?.request_id,
      data: json || rawText,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const errorMsg =
      err?.name === "AbortError"
        ? "APITxT request timeout"
        : err?.message || "APITxT network error";
    console.error(`[APITxT] Request failed:`, errorMsg);
    return {
      success: false,
      provider: "apitxt",
      error: errorMsg,
    };
  }
}

/**
 * Resolves APITxT API key from multiple environment variables or explicit client argument
 */
export function resolveApitxtApiKey(explicitKey?: string): string {
  if (explicitKey && typeof explicitKey === "string" && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }

  const envKey =
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
    "";

  return envKey.trim();
}

/**
 * Primary dispatch function: APITxT -> Twilio (fallback) -> Mock (console log)
 */
export async function sendOtpSms(
  mobile: string,
  otp: string,
  explicitApiKey?: string
): Promise<SmsResult> {
  const apitxtKey = resolveApitxtApiKey(explicitApiKey);

  // 1. Try APITxT if API key is available
  if (apitxtKey) {
    const apitxtResult = await sendApitxtOtp(mobile, otp, apitxtKey);
    if (apitxtResult.success) {
      return apitxtResult;
    }
    console.warn(`[SMS] APITxT attempt failed: ${apitxtResult.error}. Checking for fallbacks...`);
  } else {
    console.log(`[SMS] No APITxT API key provided or found in environment.`);
  }

  // 2. Try Twilio if configured
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  ) {
    try {
      console.log(`[Twilio] Attempting to send OTP via Twilio...`);
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const e164Number = toE164(mobile, "+91");
      const message = await twilioClient.messages.create({
        body: `Hello from EchoChat! Your OTP is: ${otp}. It is valid for 5 minutes. Do not share this OTP with anyone.`,
        to: e164Number,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      console.log(`[Twilio] OTP sent successfully, SID: ${message.sid}`);
      return {
        success: true,
        provider: "twilio",
        messageId: message.sid,
      };
    } catch (err: any) {
      if (err instanceof RestException) {
        console.error(`[Twilio] Error ${err.code}: ${err.message}`);
      } else {
        console.error(`[Twilio] Error sending message:`, err);
      }
    }
  }

  // 3. Development / Mock fallback
  console.log(`[SMS MOCK] ========================================`);
  console.log(`[SMS MOCK] Mobile: ${mobile}`);
  console.log(`[SMS MOCK] Generated OTP: ${otp}`);
  console.log(`[SMS MOCK] (Set APITXT_API_KEY in environment to deliver via APITxT)`);
  console.log(`[SMS MOCK] ========================================`);

  return {
    success: true,
    provider: "mock",
    error: apitxtKey ? "APITxT failed, fallback to mock" : "No SMS provider configured",
  };
}


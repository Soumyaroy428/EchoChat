"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { sendOtpRequest } from "../../lib/authApi";
import { getApiBaseUrl } from "../../lib/utils";
import { Mail } from "lucide-react";

type Props = {
  recipient?: string;
  mobile?: string;
  onClose: () => void;
  onVerified: (token: string, user: any) => void;
};

export default function OtpModal({ recipient, mobile, onClose, onVerified }: Props) {
  const initialTarget = (recipient || mobile || "").trim();
  const [emailInput, setEmailInput] = useState(initialTarget.includes("@") ? initialTarget : "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSendingAgain, setIsSendingAgain] = useState(false);

  const activeEmail = emailInput.trim().toLowerCase();

  const handleVerify = async () => {
    if (!activeEmail || !activeEmail.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }
    if (!otp || otp.trim().length === 0) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/auth/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeEmail,
          phonenumber: initialTarget || activeEmail,
          otp: otp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");

      toast.success("OTP verified — Welcome to EchoChat!");
      onVerified(data.token, data.user);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAgain = async () => {
    if (!activeEmail || !activeEmail.includes("@")) {
      toast.error("Please enter a valid email address to receive the OTP");
      return;
    }
    setIsSendingAgain(true);
    try {
      await sendOtpRequest(activeEmail);
      toast.success(`OTP sent to ${activeEmail}`);
    } catch (err: any) {
      toast.error(err.message || "Could not send OTP");
    } finally {
      setIsSendingAgain(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141b26] rounded-2xl p-6 w-full max-w-md border border-[#223348] shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Verify Your Code</h3>
            <p className="text-xs text-gray-400">Security verification</p>
          </div>
        </div>

        {initialTarget.includes("@") ? (
          <p className="text-sm text-gray-300 mb-4">
            An OTP code was sent to <strong className="text-emerald-400">{initialTarget}</strong>. Please check your inbox or spam folder.
          </p>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">
              Please confirm your email address to receive your 6-digit verification code:
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full bg-[#0a111a] border border-[#223348] rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>
        )}

        <input
          type="text"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit OTP"
          className="w-full bg-[#0a111a] border border-[#223348] rounded-xl py-3 px-4 text-center tracking-[8px] font-mono text-xl text-white placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder-gray-500 mb-4 focus:outline-none focus:border-blue-500"
        />

        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium py-2.5 rounded-xl transition"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            onClick={handleSendAgain}
            disabled={isSendingAgain}
            className="flex-1 bg-[#1e2a3a] hover:bg-[#27374d] disabled:opacity-60 text-gray-200 font-medium py-2.5 rounded-xl transition"
          >
            {isSendingAgain ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  mobile: string;
  onClose: () => void;
  onVerified: (token: string, user: any) => void;
};

export default function OtpModal({ mobile, onClose, onVerified }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.trim().length === 0) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phonenumber: mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");

      toast.success("OTP verified — logged in");
      onVerified(data.token, data.user);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phonenumber: mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      toast.success("OTP resent");
    } catch (err: any) {
      toast.error(err.message || "Could not resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#1c1c1c] rounded-2xl p-6 w-full max-w-md border border-[#2a2a2a]">
        <h3 className="text-lg font-semibold text-white mb-2">Verify OTP</h3>
        <p className="text-sm text-gray-300 mb-4">An OTP was sent to {mobile}. Enter it below to continue.</p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg py-3 px-4 text-white placeholder-gray-400 mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-2 rounded-lg"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white py-2 rounded-lg"
          >
            {resendLoading ? "Resending..." : "Resend"}
          </button>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
        </div>
      </div>
    </div>
  );
}

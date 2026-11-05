"use client";

import { useState } from "react";
import { Lock, User, ArrowRight, ArrowLeft, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import OtpModal from "./OtpModal";
import { sendOtpRequest } from "../../lib/authApi";
import { getApiBaseUrl } from "../../lib/utils";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpRecipient, setOtpRecipient] = useState("");

  const handleOtpVerified = (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

      const payload = isLogin
        ? {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            name: formData.name.trim(),
            mobile: formData.mobile.trim(),
          };

      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isLogin ? "Login failed" : "Registration failed"));
      }

      // Both Login and Registration require Email OTP verification via Gmail SMTP
      const recipient = (data.email || formData.email).trim().toLowerCase();
      setOtpRecipient(recipient);
      setShowOtpModal(true);

      if (recipient && recipient.includes("@")) {
        try {
          await sendOtpRequest(recipient);
          toast.success(
            isLogin
              ? `Verification code sent to ${recipient}!`
              : `Account created! Verification code sent to ${recipient}!`
          );
        } catch (err: any) {
          console.error("Send OTP error", err);
          toast.error(err.message || "Failed to send verification email");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#08090a] flex items-center justify-center p-4 selection:bg-[#5e6ad2]/30 selection:text-white">
      <div className="w-full max-w-md">
        {/* Logo & Headline */}
        <div className="text-center mb-6">
          <div className="w-9 h-9 rounded-[6px] bg-gradient-to-br from-[#5e6ad2] to-[#717cf0] flex items-center justify-center shadow-[0_0_16px_rgba(94,106,210,0.35)] mx-auto mb-3">
            <Lock size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-[#f7f8f8]">EchoChat Account</h1>
          <p className="text-[#8a8f98] text-xs mt-1">
            {isLogin ? "Sign in to access your encrypted conversations" : "Create a developer-first messaging account"}
          </p>
        </div>

        {/* Linear Card */}
        <div className="bg-[#101114] rounded-[8px] p-6 sm:p-8 border border-[#1f2228] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <h2 className="text-lg font-semibold text-[#f7f8f8] mb-5 tracking-tight">
            {isLogin ? "Sign In" : "Register"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1.5">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#62666d]" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#0c0d0e] border border-[#1f2228] rounded-[6px] py-2.5 pl-10 pr-4 text-sm text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#62666d]" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#0c0d0e] border border-[#1f2228] rounded-[6px] py-2.5 pl-10 pr-4 text-sm text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1.5">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#62666d]" size={16} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+1234567890 (optional)"
                    className="w-full bg-[#0c0d0e] border border-[#1f2228] rounded-[6px] py-2.5 pl-10 pr-4 text-sm text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#8a8f98] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#62666d]" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#0c0d0e] border border-[#1f2228] rounded-[6px] py-2.5 pl-10 pr-4 text-sm text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5e6ad2] hover:bg-[#6875e8] active:bg-[#4f59b8] disabled:opacity-50 text-[#f7f8f8] py-2.5 rounded-[6px] text-sm font-medium transition-all shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_12px_rgba(94,106,210,0.25)] flex items-center justify-center gap-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e6ad2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090a]"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#1f2228] text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-xs text-[#8a8f98] hover:text-[#f7f8f8] transition-colors flex items-center justify-center gap-1.5 mx-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] rounded"
            >
              {isLogin ? (
                <>
                  <span>Don't have an account?</span>
                  <span className="text-[#5e6ad2] hover:underline font-medium">Register</span>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <span className="text-[#5e6ad2] hover:underline font-medium">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <OtpModal
          recipient={otpRecipient}
          onClose={() => setShowOtpModal(false)}
          onVerified={handleOtpVerified}
        />
      )}
    </div>
  );
}

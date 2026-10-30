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
    <div className="min-h-screen bg-[#05080d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="EchoChat Logo" className="w-48 h-14 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {isLogin ? "Welcome back! Login to continue" : "Create your EchoChat account"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#0b1420] rounded-2xl p-8 border border-[#1b2b3d] shadow-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">
            {isLogin ? "Sign In" : "Register"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#05090f] border border-[#1c2e42] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#05090f] border border-[#1c2e42] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+1234567890 (optional)"
                    className="w-full bg-[#05090f] border border-[#1c2e42] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#05090f] border border-[#1c2e42] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? (
                <>
                  <ArrowLeft size={16} />
                  Don't have an account? Register
                </>
              ) : (
                <>
                  <ArrowLeft size={16} />
                  Already have an account? Sign In
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

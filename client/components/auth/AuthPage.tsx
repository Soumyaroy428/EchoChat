"use client";

import { useState } from "react";
import { Phone, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import OtpModal from "./OtpModal";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");

  const handleOtpVerified = (token: string, user: any) => {
    // save token and user after successful OTP verification
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // reload to reflect authenticated state
    window.location.reload();
  };

  
//this is use for submit the auth data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call: Determine endpoint based on login/register mode
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      // API call: Send authentication request to backend server
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // API call: Parse response data
      const data = await response.json();

      // API call: Check for errors in response
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // For login: open OTP modal and send OTP. For register: keep original behavior.
      if (isLogin) {
        // open OTP modal and request OTP from server
        setOtpMobile(formData.mobile);
        setShowOtpModal(true);

        try {
          await fetch("http://localhost:5000/api/auth/sendOtp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phonenumber: formData.mobile }),
          });
          toast.success("OTP sent - please verify");
        } catch (err) {
          console.error("Send OTP error", err);
          toast.error("Failed to send OTP");
        }
      } else {
        // registration flow: save token and reload
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Registration successful!");
        window.location.reload();
      }
    } catch (err: any) {
      // Show error toast
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
    <div className="min-h-screen bg-[#080000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="EchoChat Logo" className="w-450 h-50 mx-auto mb-4" />
          <p className="text-gray-400">
            {isLogin ? "Welcome back! Login to continue" : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#1c1c1c] rounded-2xl p-8 border border-[#2a2a2a]">
          <h2 className="text-2xl font-semibold text-white mb-6">
            {isLogin ? "Login" : "Register"}
          </h2>


          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  {isLogin ? "Login" : "Register"}
                  <ArrowRight size={20} />
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
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? (
                <>
                  <ArrowLeft size={16} />
                  Don't have an account? Register
                </>
              ) : (
                <>
                  <ArrowLeft size={16} />
                  Already have an account? Login
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <OtpModal
          mobile={otpMobile}
          onClose={() => setShowOtpModal(false)}
          onVerified={handleOtpVerified}
        />
      )}

    </div>
  );
}

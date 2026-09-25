import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"send-otp" | "verify-otp" | "register">(
    "send-otp",
  );
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.sendOtp({ email, type: "register" });
      toast.success("OTP has been sent to your email!");
      setStep("verify-otp");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp, type: "register" });
      toast.success("OTP verified successfully!");
      setStep("register");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({ email, password });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verify-otp") {
      setStep("send-otp");
      return;
    }

    if (step === "register") {
      setStep("verify-otp");
      return;
    }

    navigate(-1);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f4f1] text-[#111315] p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tighter mb-2">
            Create an account
          </h1>
          <p className="text-sm text-black/60">
            {step === "send-otp" && "Join the Sportsphere community"}
            {step === "verify-otp" && `Enter the 6-digit OTP sent to ${email}`}
            {step === "register" && "Set a secure password for your account"}
          </p>
        </div>

        {step === "send-otp" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-black/80">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/15 bg-[#f5f4f1]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-[#111315] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === "verify-otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-black/80">
                OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-black/15 bg-[#f5f4f1]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition tracking-[0.5em] font-mono"
                  placeholder="------"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-[#111315] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-black/80">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,}$"
                  title="Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-black/15 bg-[#f5f4f1]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                  placeholder="Must be at least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-black/40 hover:text-black/60 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-[#111315] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="mt-8 text-center flex flex-col gap-3">
          {step !== "send-otp" && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-black/60 hover:text-black transition"
            >
              <ArrowLeft size={16} />
              Go back
            </button>
          )}

          <p className="text-sm text-black/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#111315] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

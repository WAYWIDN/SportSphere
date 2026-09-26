import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Mail,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<
    "send-otp" | "verify-otp" | "reset-password"
  >("send-otp");
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.sendOtp({ email, type: "forgot-password" });
      toast.success("OTP has been sent to your email!");
      setStep("verify-otp");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        "Failed to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp, type: "forgot-password" });
      toast.success("OTP verified successfully!");
      setStep("reset-password");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email, newPassword });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
        "Failed to reset password. Please try again.",
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

    if (step === "reset-password") {
      setStep("verify-otp");
      return;
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-border">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "send-otp" &&
              "Enter your email and we'll send you an OTP."}
            {step === "verify-otp" && `Enter the 6-digit OTP sent to ${email}`}
            {step === "reset-password" &&
              "Please enter your new secure password."}
          </p>
        </div>

        {step === "send-otp" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Sending..." : "Send OTP"} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === "verify-otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">
                OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <KeyRound size={18} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 transition tracking-[0.5em] font-mono"
                  placeholder="------"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify OTP"} <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === "reset-password" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,}$"
                  title="Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}{" "}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            {step === "send-otp" ? "Back to login" : "Go back"}
          </button>
        </div>
      </div>
    </div>
  );
}

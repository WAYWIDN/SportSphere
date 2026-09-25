import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "../api/auth.api";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.login({ email, password });
      await checkAuth();
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f4f1] text-[#111315] p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-black/5">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tighter mb-2">Welcome back</h1>
          <p className="text-sm text-black/60">Log in to your Sportsphere account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-black/80">Email</label>
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-black/80">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-black/60 hover:text-black transition">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-black/15 bg-[#f5f4f1]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                placeholder="••••••••"
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
            {loading ? "Logging in..." : "Log in"} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-black/60">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-[#111315] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

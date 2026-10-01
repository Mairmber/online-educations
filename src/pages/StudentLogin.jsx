import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { GraduationCap, LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await base44.auth.loginViaEmailPassword(form.email, form.password);
    window.location.href = "/student-portal";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Main Site
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Eduqasion</span>
        </div>
      </div>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Student Portal Login</h1>
              <p className="text-slate-400 text-sm mt-2">Enter your student credentials to access your portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-slate-300 text-sm">Email / Student ID</Label>
                <Input
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:ring-blue-500"
                  placeholder="student@eduqasion.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Password</Label>
                <div className="relative mt-1">
                  <Input
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 text-base font-semibold" disabled={loading}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</span>
                  : <span className="flex items-center gap-2"><LogIn className="w-4 h-4" /> Access Student Portal</span>}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link to="/forgot-password" className="text-blue-400 text-sm hover:underline block">Forgot your password?</Link>
              <p className="text-slate-500 text-sm">Not a student yet? <Link to="/register" className="text-blue-400 hover:underline">Register Free</Link></p>
              <p className="text-slate-500 text-sm">Instructor? <Link to="/login" className="text-blue-400 hover:underline">Login here</Link></p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">Protected by Eduqasion · 100% Free Education Platform</p>
        </div>
      </div>
    </div>
  );
}
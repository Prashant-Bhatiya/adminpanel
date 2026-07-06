import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Layers, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <Layers size={22} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-text">Welcome back</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in to Northgate Admin</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-panel">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2.5 focus-within:border-primary">
                <Mail size={16} className="text-text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2.5 focus-within:border-primary">
                <Lock size={16} className="text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-text-muted hover:text-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-5 rounded-xl bg-surface-alt px-3 py-2.5 text-center text-xs text-text-muted">
            Demo credentials — <span className="font-medium text-text">admin@example.com</span> /{" "}
            <span className="font-medium text-text">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

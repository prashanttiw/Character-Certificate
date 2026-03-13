import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    emailOrRollNo: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.emailOrRollNo.trim() || !form.password.trim()) {
      toast.error("Enter your email or roll number and password.");
      return;
    }

    setSubmitting(true);

    try {
      await login(form.emailOrRollNo, form.password);
      toast.success("Login successful. Your dashboard is ready.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign you in right now."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="auth-card">
      <CardHeader className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand-2)]/20 bg-[var(--brand-1)]/10 px-3 py-1 text-sm font-medium text-[var(--brand-2)]">
          <ShieldCheck className="size-4" />
          Live backend login
        </div>
        <CardTitle className="font-display text-4xl tracking-tight text-[var(--ink-1)]">
          Welcome back
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-[var(--ink-3)]">
          Sign in with your email or roll number to manage certificate requests,
          track status, and keep your student records moving.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Email or Roll Number</span>
            <div className="form-input-shell">
              <Mail className="form-icon" />
              <Input
                name="emailOrRollNo"
                value={form.emailOrRollNo}
                onChange={handleChange}
                placeholder="ROLL2025001 or testuser@example.com"
                className="auth-input"
              />
            </div>
          </label>

          <label className="form-field">
            <span className="form-label">Password</span>
            <div className="form-input-shell">
              <LockKeyhole className="form-icon" />
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="auth-input"
              />
            </div>
          </label>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-[var(--brand-1)] text-base font-semibold text-white shadow-[0_20px_50px_rgba(217,119,6,0.28)] transition hover:bg-[var(--brand-2)]"
          >
            {submitting ? "Signing in..." : "Open Dashboard"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
          <p>
            New student?{" "}
            <Link to="/register" className="auth-link">
              Create your account
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

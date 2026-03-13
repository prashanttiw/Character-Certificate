import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/services/auth";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!form.email.trim()) {
      toast.error("Enter the email linked to your student account.");
      return;
    }

    setSendingOtp(true);

    try {
      await authAPI.sendForgotPasswordOtp(form.email.trim());
      setOtpSent(true);
      toast.success("OTP sent. Use it below to choose a new password.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send password reset OTP."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (!form.email || !form.otp || !form.newPassword || !form.confirmPassword) {
      toast.error("Complete all fields to reset your password.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }

    setSubmitting(true);

    try {
      await authAPI.resetPassword(
        form.email.trim(),
        form.otp.trim(),
        form.newPassword
      );
      toast.success("Password updated. You can sign in now.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Password reset failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="auth-card">
      <CardHeader className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand-2)]/20 bg-[var(--brand-1)]/10 px-3 py-1 text-sm font-medium text-[var(--brand-2)]">
          <Shield className="size-4" />
          Secure password recovery
        </div>
        <CardTitle className="font-display text-4xl tracking-tight text-[var(--ink-1)]">
          Reset your password
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-[var(--ink-3)]">
          Request a password reset OTP, confirm it, and set a fresh password without
          leaving the portal flow.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleReset}>
          <label className="form-field">
            <span className="form-label">Email</span>
            <div className="form-input-shell">
              <Mail className="form-icon" />
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="auth-input"
              />
            </div>
          </label>

          <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/65 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="form-field flex-1">
                <span className="form-label">OTP</span>
                <div className="form-input-shell">
                  <Shield className="form-icon" />
                  <Input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="auth-input"
                  />
                </div>
              </label>

              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="h-12 rounded-2xl bg-[var(--brand-2)] px-6 text-white shadow-[0_20px_50px_rgba(120,53,15,0.18)] hover:bg-[var(--brand-2)]/92"
              >
                {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">New Password</span>
              <div className="form-input-shell">
                <KeyRound className="form-icon" />
                <Input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Create new password"
                  className="auth-input"
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Confirm Password</span>
              <div className="form-input-shell">
                <KeyRound className="form-icon" />
                <Input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  className="auth-input"
                />
              </div>
            </label>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl bg-[var(--brand-1)] text-base font-semibold text-white shadow-[0_20px_50px_rgba(217,119,6,0.28)] transition hover:bg-[var(--brand-2)]"
          >
            {submitting ? "Updating..." : "Reset Password"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--ink-3)]">
          Remembered it?{" "}
          <Link to="/login" className="auth-link">
            Return to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

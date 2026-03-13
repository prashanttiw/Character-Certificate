import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Mail, Phone, Send, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/services/auth";

const initialForm = {
  name: "",
  rollNo: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  otp: "",
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateBaseForm = () => {
    const { name, rollNo, email, mobile, password, confirmPassword } = form;

    if (!name || !rollNo || !email || !mobile || !password || !confirmPassword) {
      toast.error("Complete all registration fields before requesting OTP.");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Password and confirm password must match.");
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validateBaseForm()) return;

    setSendingOtp(true);

    try {
      await authAPI.sendRegistrationOtp({
        name: form.name.trim(),
        rollNo: form.rollNo.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });

      setOtpSent(true);
      toast.success("OTP sent. Check your email and complete verification.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send OTP right now."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!validateBaseForm()) return;
    if (!form.otp.trim()) {
      toast.error("Enter the OTP sent to your email.");
      return;
    }

    setVerifying(true);

    try {
      await authAPI.verifyRegistrationOtp(form.email.trim(), form.otp.trim());
      toast.success("Registration complete. Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "OTP verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="auth-card">
      <CardHeader className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand-2)]/20 bg-[var(--brand-1)]/10 px-3 py-1 text-sm font-medium text-[var(--brand-2)]">
          <Send className="size-4" />
          OTP registration flow
        </div>
        <CardTitle className="font-display text-4xl tracking-tight text-[var(--ink-1)]">
          Create your student account
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-[var(--ink-3)]">
          Fill in your academic details, request a verification code, and activate
          your portal account in one smooth pass.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">Full Name</span>
              <div className="form-input-shell">
                <UserRound className="form-icon" />
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Anjali Sharma"
                  className="auth-input"
                />
              </div>
            </label>

            <label className="form-field">
              <span className="form-label">Roll Number</span>
              <div className="form-input-shell">
                <UserRound className="form-icon" />
                <Input
                  name="rollNo"
                  value={form.rollNo}
                  onChange={handleChange}
                  placeholder="ROLL2025001"
                  className="auth-input"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <label className="form-field">
              <span className="form-label">Mobile Number</span>
              <div className="form-input-shell">
                <Phone className="form-icon" />
                <Input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="auth-input"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">Password</span>
              <div className="form-input-shell">
                <KeyRound className="form-icon" />
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
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
                  placeholder="Repeat your password"
                  className="auth-input"
                />
              </div>
            </label>
          </div>

          <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/65 p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="form-field flex-1">
                <span className="form-label">Verification OTP</span>
                <div className="form-input-shell">
                  <Mail className="form-icon" />
                  <Input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    className="auth-input"
                  />
                </div>
              </label>

              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="h-12 rounded-2xl bg-[var(--brand-2)] px-6 text-white shadow-[0_20px_50px_rgba(120,53,15,0.18)] hover:bg-[var(--brand-2)]/92 sm:mt-6"
              >
                {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={verifying}
            className="h-12 w-full rounded-2xl bg-[var(--brand-1)] text-base font-semibold text-white shadow-[0_20px_50px_rgba(217,119,6,0.28)] transition hover:bg-[var(--brand-2)]"
          >
            {verifying ? "Verifying..." : "Verify and Register"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--ink-3)]">
          Already registered?{" "}
          <Link to="/login" className="auth-link">
            Go to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

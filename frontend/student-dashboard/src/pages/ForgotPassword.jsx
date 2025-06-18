import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Send,
  RotateCw,
  KeyRound,
} from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = () => {
    if (!form.email) {
      toast.error("Email is required!");
      return;
    }
    toast.success("OTP sent to your email!");
    setOtpSent(true);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReset = () => {
    const { email, otp, newPassword, confirmPassword } = form;
    if (!email || !otp || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    toast.success("Password reset successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <Card className="w-[500px] bg-white border border-gray-200 shadow-lg rounded-xl">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-3xl font-bold text-center text-black">
            Forgot Password
          </h2>

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleInput}
              className="pl-10"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex-1 relative">
              <Button
                onClick={sendOtp}
                className="text-sm px-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm transition duration-200"
                disabled={timer > 0}
              >
                {timer > 0 ? (
                  <>
                    <RotateCw size={16} />
                    Resend in {timer}s
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          </div>

          {otpSent && (
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                placeholder="Enter OTP"
                name="otp"
                value={form.otp}
                onChange={handleInput}
                className="pl-10"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input
              placeholder="New Password"
              name="newPassword"
              type={showPass ? "text" : "password"}
              value={form.newPassword}
              onChange={handleInput}
              className="pl-10 pr-10"
            />
            <span
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <Input
              placeholder="Confirm Password"
              name="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleInput}
              className="pl-10 pr-10"
            />
            <span
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            >
              {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <Button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition duration-200"
          >
            <KeyRound size={18} />
            Reset Password
          </Button>

          <p className="text-sm text-center text-gray-600">
            Remember your password?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Go to Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

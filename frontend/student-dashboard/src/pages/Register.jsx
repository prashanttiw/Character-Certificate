import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Send,
  RotateCw,
  UserPlus,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const sendOtp = () => {
    if (!form.email) return toast.error("Email is required!");
    toast.success("OTP sent ✔️");
    setOtpSent(true);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((t) => (t > 1 ? t - 1 : (clearInterval(interval), 0)));
    }, 1000);
  };

  const handleRegister = () => {
    const { name, rollNo, email, mobile, password, confirmPassword, otp } = form;
    if (!name || !rollNo || !email || !mobile || !password || !confirmPassword || !otp)
      return toast.error("All fields are required.");
    if (password !== confirmPassword) return toast.error("Passwords do not match!");
    toast.success("Registered successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-fade-in">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-black">📝 Student Register</h2>

          <div className="relative">
            <User className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Full Name"
              className="pl-12 py-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Roll Number"
              className="pl-12 py-3"
              value={form.rollNo}
              onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Email"
              className="pl-12 py-3"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="OTP"
              className="flex-1 py-3"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
            />
            <Button
              onClick={sendOtp}
              className="w-[140px] gap-2 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
              disabled={timer > 0}
            >
              {timer ? (
                <>
                  <RotateCw size={18} className="animate-spin" /> {timer}s
                </>
              ) : (
                <>
                  <Send size={18} /> OTP
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Mobile Number"
              className="pl-12 py-3"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Password"
              type={showPass ? "text" : "password"}
              className="pl-12 pr-12 py-3"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div
              className="absolute right-3 top-4 cursor-pointer text-gray-500"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Confirm Password"
              type={showConfirmPass ? "text" : "password"}
              className="pl-12 pr-12 py-3"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <div
              className="absolute right-3 top-4 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            >
              {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <Button
            onClick={handleRegister}
            className="w-full flex gap-2 justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg shadow-md"
          >
            <UserPlus size={18} />
            Register
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

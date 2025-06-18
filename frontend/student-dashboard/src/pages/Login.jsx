import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    const { email, password } = form;
    if (!email || !password) return toast.error("Please fill all fields.");
    toast.success("Logged in successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-fade-in">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center text-black">🔐 Student Login</h2>

          <div className="relative">
            <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
            <Input
              placeholder="Email or Roll No."
              className="pl-12 py-3"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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

          <Button
            onClick={handleLogin}
            className="w-full flex gap-2 justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg shadow-md"
          >
            <LogIn size={18} />
            Login
          </Button>

          <div className="text-center text-sm text-gray-600">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

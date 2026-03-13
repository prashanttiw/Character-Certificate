import { Link, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface-1)] text-[var(--ink-1)]">
      <div className="aurora aurora-three" />
      <div className="grid-pattern opacity-40" />

      <header className="relative z-10 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-10">
          <div>
            <Link to="/dashboard" className="font-display text-2xl tracking-tight">
              Student Command Desk
            </Link>
            <p className="text-sm text-[var(--ink-3)]">
              Character certificate workflow connected to your live backend
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 shadow-sm sm:flex">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-1)]/12 text-[var(--brand-2)]">
                <UserCircle2 className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--ink-1)]">{user?.name || "Student"}</p>
                <p className="text-xs text-[var(--ink-3)]">{user?.rollNo || "Awaiting profile sync"}</p>
              </div>
            </div>

            <div className="hidden rounded-full border border-[var(--line-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-2)] md:flex md:items-center md:gap-2">
              <ShieldCheck className="size-4" />
              Verified workflow
            </div>

            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[var(--line-soft)] bg-white/80"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}

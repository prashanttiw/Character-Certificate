import { Outlet, Link, useLocation } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Waypoints } from "lucide-react";

const navItems = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Reset Password", href: "/forgot-password" },
];

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface-0)] text-[var(--ink-1)]">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="grid-pattern" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div>
          <p className="font-display text-2xl tracking-tight text-[var(--ink-1)]">
            Character Certificate Portal
          </p>
          <p className="text-sm text-[var(--ink-3)]">
            Modern student workflow for verification and certificate requests
          </p>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-white/50 bg-white/55 p-1 backdrop-blur md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-[var(--brand-1)] text-white shadow-lg"
                    : "text-[var(--ink-2)] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-7xl gap-10 px-6 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="flex flex-col justify-center py-6 lg:py-0">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand-2)]/30 bg-white/65 px-4 py-2 text-sm font-medium text-[var(--brand-2)] shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            Campus-ready student experience
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight text-[var(--ink-1)] sm:text-6xl lg:text-7xl">
            From OTP onboarding to application tracking, all in one polished flow.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-3)]">
            The portal now connects directly to the backend for registration, login,
            password reset, dashboard data, and certificate submission. What you
            see here reflects live API behavior instead of placeholder screens.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="feature-tile">
              <ShieldCheck className="size-5 text-[var(--brand-2)]" />
              <p className="feature-title">Secure onboarding</p>
              <p className="feature-copy">OTP-backed registration and reset flows.</p>
            </div>
            <div className="feature-tile">
              <Waypoints className="size-5 text-[var(--brand-2)]" />
              <p className="feature-title">Live workflow</p>
              <p className="feature-copy">Dashboard reads live student and application data.</p>
            </div>
            <div className="feature-tile">
              <ArrowRight className="size-5 text-[var(--brand-2)]" />
              <p className="feature-title">Submission ready</p>
              <p className="feature-copy">Apply, update drafts, and move to review in one place.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center pb-8 lg:pb-0">
          <div className="w-full max-w-xl">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}

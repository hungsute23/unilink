"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginWithEmail } from "@/lib/appwrite/actions/auth.actions";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Briefcase,
  Globe,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await loginWithEmail(formData);
      if (res.error) {
        setError(res.error);
        return;
      }

      const role = res.role as string;
      let target = "/";
      switch (role) {
        case "student": target = "/student-portal"; break;
        case "school":  target = "/school-portal";  break;
        case "business": target = "/dashboard";     break;
        case "admin":   target = "/portal";          break;
      }

      router.push(target);
      router.refresh();
    });
  };

  return (
    <div className="min-h-svh grid lg:grid-cols-2">

      {/* ── LEFT: Brand Panel ───────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">UniLink</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your gateway to studying &amp; working in Taiwan.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Join 50,000+ international students who found their perfect university, scholarship, and career through UniLink.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, text: "Access 100+ top universities in Taiwan" },
              { icon: Globe,    text: "Government & private scholarship matching" },
              { icon: Briefcase, text: "Part-time jobs & internships for students" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-4.5 h-4.5 text-white" size={18} />
                </div>
                <span className="text-white/90 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 ns-card-inner p-5 bg-white/10 border-white/20 space-y-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-amber-400/90" />
            ))}
          </div>
          <p className="text-white/90 text-sm leading-relaxed italic">
            "UniLink helped me secure the MOE scholarship and a part-time job at TSMC within 3 months of arriving in Taiwan."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">MH</div>
            <div>
              <p className="text-white text-xs font-semibold">Manh Hung</p>
              <p className="text-white/50 text-xs">NTU, Computer Science '25</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ───────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">UniLink</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue your journey.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(new FormData(e.currentTarget));
            }}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-12 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="h-12 rounded-2xl border-border bg-card pr-12 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full h-12 text-base gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link href="/register">
            <Button variant="outline" className="btn-secondary w-full h-12 text-base">
              Create free account
            </Button>
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
            {" & "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

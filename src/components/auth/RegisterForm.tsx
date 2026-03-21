"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerUser } from "@/lib/appwrite/actions/auth.actions";
import { UserRole } from "@/types/appwrite.types";
import {
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "student",  label: "Student",  icon: GraduationCap, desc: "Find universities & scholarships" },
  { value: "school",   label: "University", icon: Building2,  desc: "Recruit international students" },
  { value: "business", label: "Business",  icon: Briefcase,   desc: "Post jobs & internships" },
];

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (formData: FormData) => {
    setError(null);
    formData.set("role", role);
    startTransition(async () => {
      const res = await registerUser(formData);
      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.pending) {
        router.push("/pending-approval");
        router.refresh();
        return;
      }

      const resRole = res.role as string;
      let target = "/";
      switch (resRole) {
        case "student":  target = "/student-portal"; break;
        case "school":   target = "/school-portal";  break;
        case "business": target = "/dashboard";       break;
        case "admin":    target = "/portal";           break;
      }

      router.push(target);
      router.refresh();
    });
  };

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!;
  const nameLabel =
    role === "student" ? "Full name" : role === "school" ? "University name" : "Company name";

  return (
    <div className="min-h-svh grid lg:grid-cols-2">

      {/* ── LEFT: Brand Panel ───────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden">
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
              Start your journey in Taiwan today.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Create your free account and get matched with the best universities, scholarships, and career opportunities in minutes.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Free forever — no credit card required",
              "AI matching with 100+ universities",
              "Access to 50+ government scholarships",
              "Exclusive job board for international students",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-white/90 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { num: "50K+", label: "Students" },
            { num: "100+", label: "Universities" },
            { num: "4.9★", label: "Rating" },
          ].map((s, i) => (
            <div key={i} className="text-center ns-card-inner p-4 bg-white/10 border-white/20">
              <div className="text-2xl font-bold text-white">{s.num}</div>
              <div className="text-white/60 text-xs font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form Panel ───────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">UniLink</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground">Create your account</h2>
            <p className="text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          {/* Role selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">I am a...</Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-200 ${
                    role === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <opt.icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pl-1">{selectedRole.desc}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            {error && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                {nameLabel}
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={`Enter your ${nameLabel.toLowerCase()}`}
                required
                className="h-12 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
              />
            </div>

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
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              className="btn-primary w-full h-12 text-base gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create free account <ArrowRight size={18} />
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
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button variant="outline" className="btn-secondary w-full h-12 text-base">
              Sign in instead
            </Button>
          </Link>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
            {" & "}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

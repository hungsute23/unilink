"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Appwrite password recovery requires server-side handling.
    // For now we simulate the flow — wire up to /api/auth/forgot-password when ready.
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">Kiểm tra email của bạn</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nếu <span className="font-semibold text-foreground">{email}</span> tồn tại trong hệ thống,
              bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-8 gap-2">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Quên mật khẩu?</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-12 rounded-2xl font-black"
          >
            {loading ? "Đang gửi..." : "Gửi link đặt lại"}
          </Button>
        </form>
      </div>
    </div>
  );
}

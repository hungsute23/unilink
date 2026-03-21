"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap, BookOpen, Briefcase, Home, Users,
  Menu, X, LayoutDashboard, LogOut,
  Sparkles, Globe, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { logoutUser } from "@/lib/appwrite/actions/auth.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  prefs: Record<string, any>;
}

const NAV_LINKS = [
  { name: "Home",         href: "/",             icon: Home },
  { name: "Schools",      href: "/schools",      icon: GraduationCap },
  { name: "Scholarships", href: "/scholarships",  icon: BookOpen },
  { name: "Jobs",         href: "/jobs",          icon: Briefcase },
  { name: "Services",     href: "/services",      icon: Sparkles },
  { name: "Community",   href: "/community",     icon: Users },
];

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "vi", label: "VI", full: "Tiếng Việt" },
  { code: "zh", label: "ZH", full: "中文" },
];

interface HeaderProps {
  user?: AppwriteUser | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("en");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const getDashboardHref = () => {
    const role = user?.prefs?.role as string;
    switch (role) {
      case "student":  return "/student-portal";
      case "school":   return "/school-portal";
      case "business": return "/dashboard";
      case "admin":    return "/portal";
      default:         return "/student-portal";
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const res = await logoutUser();
    if (res.success) { router.push("/"); router.refresh(); }
    setIsLoggingOut(false);
    setUserMenuOpen(false);
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const currentLang = LANGUAGES.find(l => l.code === activeLang)!;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "header-glass" : "header-transparent"
        )}
      >
        <div className="container mx-auto max-w-[1280px] px-6">
          <div className="flex h-[68px] items-center justify-between gap-8">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-xl bg-primary opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
                <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <GraduationCap size={18} className="text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                Uni<span className="text-primary">Link</span>
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">

              {/* AI Matching CTA */}
              <Link
                href="/ai-matching"
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold transition-all duration-200",
                  pathname === "/ai-matching"
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/30"
                )}
              >
                <Sparkles size={14} className="shrink-0" />
                AI Match
              </Link>

              {/* Language switcher — icon button */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen(!langOpen); setUserMenuOpen(false); }}
                  title={currentLang.full}
                  className={cn(
                    "flex items-center gap-1 h-9 w-9 justify-center rounded-full border transition-all duration-200",
                    langOpen
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe size={15} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-[14px] shadow-xl overflow-hidden py-1.5 z-50">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setActiveLang(lang.code); setLangOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          lang.code === activeLang
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span className="w-7 text-xs font-bold text-muted-foreground">{lang.label}</span>
                        <span>{lang.full}</span>
                        {lang.code === activeLang && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative">
                  {/* Avatar-only icon button */}
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setLangOpen(false); }}
                    title={user.name}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-200 ring-2",
                      userMenuOpen
                        ? "bg-primary ring-primary/40 scale-95"
                        : "bg-primary ring-transparent hover:ring-primary/30 hover:scale-105"
                    )}
                  >
                    {initials}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-[14px] shadow-xl overflow-hidden py-2 z-50">
                      <div className="px-4 py-3 border-b border-border/60">
                        <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-primary" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut size={15} />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <User size={15} />
                  Login
                </Link>
              )}
            </div>

            {/* ── Mobile toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/60 transition-all"
              aria-label="Toggle menu"
            >
              <span className={cn("transition-all duration-300", mobileOpen ? "rotate-90" : "rotate-0")}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border/50 bg-background/95 backdrop-blur-xl",
            mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="container mx-auto max-w-[1280px] px-6 py-5 space-y-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[14px] text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon size={17} />
                  {link.name}
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}

            {/* Mobile language switcher */}
            <div className="pt-2">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Language</p>
              <div className="flex gap-2 px-4">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLang(lang.code)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                      lang.code === activeLang
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link href={getDashboardHref()}>
                    <Button variant="outline" className="w-full gap-2 rounded-[14px] h-11">
                      <LayoutDashboard size={15} /> Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-destructive hover:bg-destructive/10 rounded-[14px] h-11"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut size={15} />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="w-full rounded-[14px] h-11 gap-2">
                    <User size={15} /> Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {(userMenuOpen || langOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setUserMenuOpen(false); setLangOpen(false); }}
        />
      )}

      {/* Spacer */}
      <div className="h-[68px]" />
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut, ChevronLeft, ChevronRight,
  LayoutDashboard, Settings, FileText, Bookmark,
  UserCog, GraduationCap, Building2, Users, ShieldCheck,
  Settings2, ListTodo, BookOpen, Briefcase, History,
  CheckCircle, FileBadge, BarChart3, CalendarDays, Award,
  School, PenSquare, User as UserIcon, Sparkles, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/appwrite/actions/auth.actions";
import { toast } from "sonner";

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
}

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Bookmark, UserCog, GraduationCap,
  Building2, Users, ShieldCheck, Settings2, ListTodo, Sparkles,
  Settings, BookOpen, Briefcase, History, CreditCard, CheckCircle,
  FileBadge, UserIcon, BarChart3, CalendarDays, Award, School, PenSquare,
};

const PORTAL_ACCENT: Record<string, string> = {
  "Admin":    "bg-rose-500",
  "School":   "bg-violet-500",
  "Student":  "bg-indigo-500",
  "Business": "bg-emerald-500",
};

interface SidebarProps {
  navItems: NavItem[];
  user: { name: string; email: string; avatarUrl?: string } | null;
  portalName: string;
  className?: string;
}

export function Sidebar({ navItems, user, portalName, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const accentClass = PORTAL_ACCENT[portalName] ?? "bg-indigo-500";
  const initials = user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col transition-all duration-300 z-50 shrink-0",
        "bg-[#13152b] border-r border-white/[0.06]",
        collapsed ? "w-[68px]" : "w-[240px]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-white/[0.06] shrink-0">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-sm", accentClass)}>
          UL
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-in fade-in duration-200">
            <p className="text-white font-bold text-sm leading-none">UniLink</p>
            <p className="text-white/40 text-[10px] font-medium mt-0.5">{portalName} Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = IconMap[item.icon] ?? LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-indigo-500/15 text-white"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-indigo-400" />
              )}
              <Icon className={cn("shrink-0 w-4 h-4", collapsed && "mx-auto")} />
              {!collapsed && (
                <span className="truncate animate-in fade-in duration-200">{item.label}</span>
              )}
              {!collapsed && item.badge != null && (
                <span className="ml-auto text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/[0.06] p-3 space-y-1 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0", accentClass)}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white/90 text-xs font-semibold truncate leading-none">{user.name}</p>
              <p className="text-white/30 text-[10px] truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 h-9 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 text-sm font-medium",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 h-9 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150 text-sm"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4 mx-auto" />
            : <><ChevronLeft className="w-4 h-4" /><span className="text-[11px]">Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

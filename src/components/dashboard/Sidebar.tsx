"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LogOut, 
  ChevronRight, 
  Search,
  LayoutDashboard,
  Settings,
  Bell,
  Menu,
  X,
  CreditCard,
  User as UserIcon,
  FileText,
  Bookmark,
  UserCog,
  GraduationCap,
  Building2,
  Users,
  ShieldCheck,
  Settings2,
  ListTodo,
  Sparkles,
  BookOpen,
  Briefcase,
  History,
  CheckCircle,
  FileBadge,
  BarChart3,
  CalendarDays,
  Award,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/appwrite/actions/auth.actions";
import { toast } from "sonner";

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: string | number;
}

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Bookmark,
  UserCog,
  GraduationCap,
  Building2,
  Users,
  ShieldCheck,
  Settings2,
  ListTodo,
  Sparkles,
  Settings,
  BookOpen,
  Briefcase,
  History,
  CreditCard,
  CheckCircle,
  FileBadge,
  UserIcon,
  BarChart3,
  CalendarDays,
  Award,
  School
};

interface SidebarProps {
  navItems: NavItem[];
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  portalName: string;
  className?: string;
}

export function Sidebar({ navItems, user, portalName, className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className={cn(
      "h-screen sticky top-0 bg-background/50 backdrop-blur-3xl border-r border-primary/5 flex flex-col transition-all duration-500 z-50",
      isCollapsed ? "w-24" : "w-72",
      className
    )}>
      {/* Brand Logo & Toggle */}
      <div className="p-8 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="text-white font-black text-xl italic uppercase">UL</span>
            </div>
            <div>
              <p className="font-black text-sm tracking-tighter uppercase italic leading-none">UniLink</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-0.5">{portalName}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
           <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mx-auto">
              <span className="text-white font-black text-xl italic uppercase font-outline-2">U</span>
           </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = IconMap[item.icon] || UserIcon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "hover:bg-primary/5 text-muted-foreground hover:text-primary",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "" : "opacity-60 group-hover:opacity-100")} />
              
              {!isCollapsed && (
                <span className="font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left duration-500">
                  {item.label}
                </span>
              )}

              {!isCollapsed && isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white/50" />
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-2xl">
                   {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Actions & Profile */}
      <div className="p-6 border-t border-primary/5 bg-primary/[0.02]">
        <div className={cn(
          "flex flex-col gap-4",
          isCollapsed ? "items-center" : ""
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-background/50 shadow-sm animate-in fade-in slide-in-from-bottom duration-500">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black tracking-tight truncate uppercase italic">{user?.name || "Guest"}</p>
                <p className="text-[9px] font-bold text-muted-foreground opacity-50 truncate uppercase tracking-tighter">Premium Agent</p>
              </div>
            </div>
          )}

          <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-col" : "justify-between"
          )}>
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className={cn(
                "h-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors",
                isCollapsed ? "w-10 p-0" : "flex-1 justify-center gap-2 px-4"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

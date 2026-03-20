"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  Star,
  FileText,
  Bookmark,
  UserCog,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Using string representing the icon name
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  user: {
    fullName: string;
    email: string;
  } | null;
  portalName: string;
  logoIcon?: React.ReactNode;
}

// Icon mapping to avoid serialization issues
const iconMap: Record<string, any> = {
  "LayoutDashboard": LayoutDashboard,
  "Settings": Settings,
  "LogOut": LogOut,
  "FileText": FileText,
  "Bookmark": Bookmark,
  "UserCog": UserCog,
  "PenSquare": PenSquare,
};

export function DashboardSidebar({ navItems, user, portalName, logoIcon }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "relative flex flex-col border-r bg-slate-950 text-slate-200 transition-all duration-300 ease-in-out z-50",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-slate-800 px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg overflow-hidden whitespace-nowrap">
            <div className="p-1.5 rounded bg-indigo-600 text-white shrink-0">
               <ShieldCheck size={20} />
            </div>
            {!isCollapsed && <span className="tracking-tight text-white uppercase font-black text-sm">UniLink HQ</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-all mb-1",
                      isActive 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" 
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    )}
                  >
                    <Icon className={cn("shrink-0", isCollapsed ? "mx-auto" : "")} size={18} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 flex flex-col gap-2 bg-slate-900/30">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-2 py-1 mb-2">
              <div className="w-8 h-8 rounded border border-slate-700 bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-xs">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black tracking-widest uppercase text-white truncate">{user.fullName}</span>
                <span className="text-[9px] text-slate-500 font-bold truncate">{user.email}</span>
              </div>
            </div>
          )}

          <Button 
            variant="ghost" 
            size={isCollapsed ? "icon" : "default"}
            className={cn("w-full justify-start gap-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-widest")}
          >
            <LogOut size={18} className={isCollapsed ? "mx-auto" : ""} />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-20 bg-slate-950 border border-slate-800 shadow-xl rounded h-6 w-6 text-slate-400 hover:text-white"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

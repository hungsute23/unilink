"use client";

import React from "react";
import { 
  Bell, 
  Search, 
  User as UserIcon,
  HelpCircle,
  Sparkles,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  user?: {
    name: string;
    email: string;
  } | null;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, user, className, children }: PageHeaderProps) {
  return (
    <header className={cn(
      "flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 animate-in fade-in duration-700",
      className
    )}>
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-1.5 h-6 bg-primary rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System Core</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-gradient leading-none">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground font-medium max-w-xl line-clamp-2">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {children && <div className="flex items-center gap-3 mr-2">{children}</div>}
        
        <div className="hidden lg:flex items-center relative group min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search Intelligence..." 
            className="pl-11 h-14 bg-muted/20 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 font-bold transition-all shadow-sm"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 h-6 px-1.5 rounded-md border bg-background text-[10px] font-black text-muted-foreground pointer-events-none flex items-center gap-1">
             <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>

        <div className="flex items-center gap-2 bg-muted/10 p-1.5 rounded-2xl border border-primary/5">
           <Button variant="ghost" size="sm" className="h-11 w-11 rounded-xl relative hover:bg-primary/10">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-lg animate-pulse" />
           </Button>
           
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-11 w-11 rounded-xl hover:bg-primary/10">
                   <UserIcon className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-3xl p-3 glass-card border-none shadow-2xl">
                 <DropdownMenuLabel className="p-4 bg-primary/5 rounded-2xl mb-2">
                    <p className="text-xs font-black uppercase tracking-widest">{user?.name || "Premium User"}</p>
                    <p className="text-[10px] font-medium text-muted-foreground lowercase truncate">{user?.email || "agent@unilink.io"}</p>
                 </DropdownMenuLabel>
                 <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                 <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-primary/10">
                    <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Upgrade to Pro</span>
                 </DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl p-3 cursor-pointer focus:bg-primary/10">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Help Center</span>
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

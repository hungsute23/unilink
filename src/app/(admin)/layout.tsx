import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | UniLink Admin",
  },
};

import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { ShieldCheck, LayoutDashboard, Users, GraduationCap, Building2, Banknote, Settings } from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/portal", icon: "LayoutDashboard" },
  { label: "Users", href: "/portal/users", icon: "Users" },
  { label: "Schools", href: "/portal/schools", icon: "GraduationCap" },
  { label: "Businesses", href: "/portal/businesses", icon: "Building2" },
  { label: "Scholarships", href: "/portal/scholarships", icon: "Banknote" },
  { label: "System Info", href: "/portal/config", icon: "Settings" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-svh bg-background/50">
      <DashboardSidebar 
        navItems={adminNavItems} 
        user={{ fullName: user.name, email: user.email }}
        portalName="UniLink HQ" 
        logoIcon={<div className="p-1.5 rounded-lg bg-destructive text-white tracking-widest font-black uppercase"><ShieldCheck size={20} /></div>}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
           <div className="p-8 pb-20 max-w-[1600px] mx-auto">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}

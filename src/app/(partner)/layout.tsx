import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { DashboardSidebar, NavItem } from "@/components/shared/DashboardSidebar";

export const metadata: Metadata = {
  title: {
    default: "Partner Dashboard",
    template: "%s | UniLink Partner",
  },
};

const partnerNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Job Postings", href: "/dashboard/jobs", icon: "Briefcase" },
  { label: "Applications", href: "/dashboard/applications", icon: "Users" },
];

export default async function PartnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const userData = {
    name: user.name,
    email: user.email,
  };

  return (
    <div className="flex min-h-svh bg-background/50">
      <DashboardSidebar 
        navItems={partnerNavItems} 
        user={{ fullName: user.name, email: user.email }}
        portalName="Partner Portal" 
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
           <div className="p-8 pb-20 max-w-[1600px] mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                {children}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

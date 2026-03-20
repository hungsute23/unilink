import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { DashboardSidebar, NavItem } from "@/components/shared/DashboardSidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "Student Portal",
    template: "%s | UniLink Student",
  },
};

const studentNavItems: NavItem[] = [
  { label: "Overview", href: "/student-portal", icon: "LayoutDashboard" },
  { label: "My Applications", href: "/student-portal/applications", icon: "FileText" },
  { label: "Saved Items", href: "/student-portal/saved", icon: "Bookmark" },
  { label: "Community Posts", href: "/student-portal/community", icon: "PenSquare" },
  { label: "Profile Settings", href: "/student-portal/profile", icon: "UserCog" },
];

export default async function StudentPortalLayout({
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
        navItems={studentNavItems} 
        user={{ fullName: user.name, email: user.email }}
        portalName="Student Portal" 
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
           <div className="p-8 pb-20 max-w-[1600px] mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading intelligence...</div>}>
                  {children}
                </Suspense>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

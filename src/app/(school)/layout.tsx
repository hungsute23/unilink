import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "School Portal",
    template: "%s | UniLink School",
  },
};

const schoolNavItems: NavItem[] = [
  { label: "Overview", href: "/school-portal", icon: "BarChart3" },
  { label: "Admission Terms", href: "/school-portal/terms", icon: "CalendarDays" },
  { label: "Academic Programs", href: "/school-portal/programs", icon: "BookOpen" },
  { label: "Scholarships", href: "/school-portal/scholarships", icon: "Award" },
  { label: "Applications", href: "/school-portal/applications", icon: "Users" },
];

export default async function SchoolPortalLayout({
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
      <Sidebar 
        navItems={schoolNavItems} 
        user={userData}
        portalName="School Portal" 
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

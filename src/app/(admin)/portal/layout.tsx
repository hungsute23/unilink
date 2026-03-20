import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | UniLink Admin",
  },
};

const adminNavItems: NavItem[] = [
  { label: "Overview", href: "/portal", icon: "LayoutDashboard" },
  { label: "Users", href: "/portal/users", icon: "Users" },
  { label: "Schools", href: "/portal/schools", icon: "School" },
  { label: "Businesses", href: "/portal/businesses", icon: "Building2" },
  { label: "Scholarships", href: "/portal/scholarships", icon: "GraduationCap" },
  { label: "Community", href: "/portal/community", icon: "FileText" },
  { label: "System Config", href: "/portal/config", icon: "Settings2" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getLoggedInUser();
  
  if (!user) redirect("/login");
  
  const role = (user.prefs as any)?.role as string | undefined;
  if (role !== "admin") {
    if (role === "student") redirect("/student-portal");
    if (role === "school") redirect("/school-portal");
    if (role === "business") redirect("/dashboard");
    redirect("/");
  }

  const userData = {
    name: user.name,
    email: user.email,
  };

  return (
    <div className="flex min-h-svh bg-background/50">
      <Sidebar 
        navItems={adminNavItems} 
        user={userData}
        portalName="Super Admin" 
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

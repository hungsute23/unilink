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
    <div className="flex min-h-svh bg-[#f0f2f8] dark:bg-[#0d0f1c]">
      <Sidebar
        navItems={adminNavItems}
        user={userData}
        portalName="Admin"
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

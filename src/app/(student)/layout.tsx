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
  { label: "Overview",          href: "/student-portal",              icon: "LayoutDashboard" },
  { label: "Applications",      href: "/student-portal/applications", icon: "FileText" },
  { label: "Saved Items",       href: "/student-portal/saved",        icon: "Bookmark" },
  { label: "Community Posts",   href: "/student-portal/community",    icon: "PenSquare" },
  { label: "Profile",           href: "/student-portal/profile",      icon: "UserCog" },
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
    <div className="flex min-h-svh bg-[#f0f2f8] dark:bg-[#0d0f1c]">
      <DashboardSidebar 
        navItems={studentNavItems} 
        user={{ fullName: user.name, email: user.email }}
        portalName="Student"
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1400px] mx-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>
            }>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

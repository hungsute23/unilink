import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "School Portal",
    template: "%s | UniLink School",
  },
};

const schoolNavItems: NavItem[] = [
  { label: "Overview",     href: "/school-portal",              icon: "LayoutDashboard" },
  { label: "Terms",        href: "/school-portal/terms",        icon: "CalendarDays" },
  { label: "Programs",     href: "/school-portal/programs",     icon: "BookOpen" },
  { label: "Scholarships", href: "/school-portal/scholarships", icon: "Award" },
  { label: "Applications", href: "/school-portal/applications", icon: "Users" },
  { label: "School Profile",href: "/school-portal/profile",    icon: "GraduationCap" },
];

export default async function SchoolPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  if (!school || school.isApproved === false) redirect("/pending-approval");

  return (
    <div className="flex min-h-svh bg-[#f0f2f8] dark:bg-[#0d0f1c]">
      <Sidebar
        navItems={schoolNavItems}
        user={{ name: user.name, email: user.email }}
        portalName="School"
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

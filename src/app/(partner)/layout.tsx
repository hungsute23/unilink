import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import { Sidebar, NavItem } from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: {
    default: "Partner Dashboard",
    template: "%s | UniLink Partner",
  },
};

const partnerNavItems: NavItem[] = [
  { label: "Overview",     href: "/dashboard",              icon: "LayoutDashboard" },
  { label: "Job Postings", href: "/dashboard/jobs",         icon: "Briefcase" },
  { label: "Applications", href: "/dashboard/applications", icon: "Users" },
  { label: "Company Profile", href: "/dashboard/profile",  icon: "Building2" },
];

export default async function PartnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const business = await getBusinessProfile(user.$id);
  if (!business || business.isApproved === false) redirect("/pending-approval");

  const userData = {
    name: user.name,
    email: user.email,
  };

  return (
    <div className="flex min-h-svh bg-[#f0f2f8] dark:bg-[#0d0f1c]">
      <Sidebar
        navItems={partnerNavItems}
        user={{ name: user.name, email: user.email }}
        portalName="Business"
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

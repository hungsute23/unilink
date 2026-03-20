import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile, getBusinessApplications } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ApplicationsTable } from "@/components/partner/ApplicationsTable";

export const metadata: Metadata = {
  title: "Candidate Applications",
  description: "Review and manage all student applications for your job postings.",
};

export default async function ApplicationsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const business = await getBusinessProfile(user.$id);
  if (!business) redirect("/dashboard");

  const applications = await getBusinessApplications(business.$id);

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Applicant Tracking" 
        description="Review incoming scholarship and job applications. Make data-driven decisions on candidate evaluations."
      />

      <div className="space-y-8">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}

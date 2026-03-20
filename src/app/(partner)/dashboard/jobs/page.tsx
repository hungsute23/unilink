import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile, getBusinessJobs } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { JobsTable } from "@/components/partner/JobsTable";
import { JobFormContainer } from "@/components/partner/JobFormContainer"; // A client wrapper for the modal
import { PlusCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "My Job Postings",
  description: "Manage your company's open positions and recruitment status.",
};

export default async function JobsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const business = await getBusinessProfile(user.$id);
  if (!business) redirect("/dashboard");

  const jobs = await getBusinessJobs(business.$id);

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Job Postings" 
        description="Create and manage your organization's job opportunities. Track visibility and reach across the platform."
      />

      <div className="space-y-8">
        <JobFormContainer businessId={business.$id} jobs={jobs} />
      </div>
    </div>
  );
}

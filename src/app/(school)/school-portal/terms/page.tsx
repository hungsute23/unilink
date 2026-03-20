import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile, getAdmissionTerms } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { TermsTable } from "@/components/school/TermsTable";
import { AdmissionTerm } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "Admission Terms - School Portal",
  description: "Manage your school's application periods and intake months.",
};

export default async function AdmissionTermsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  if (!school) redirect("/school-portal");

  const terms = await getAdmissionTerms(school.$id) as unknown as AdmissionTerm[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Admission Terms</h1>
        <p className="text-muted-foreground text-lg">
          Configure the application periods during which students can apply to your programs.
        </p>
      </div>

      <TermsTable schoolId={school.$id} initialTerms={terms.map(t => ({ ...t }))} />
    </div>
  );
}

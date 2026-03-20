import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile, getAdmissionTerms, getSchoolPrograms } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { ProgramsTable } from "@/components/school/ProgramsTable";
import { AdmissionTerm, Program } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "Academic Programs - School Portal",
  description: "Manage your school's degree programs and language courses.",
};

export default async function ProgramsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  if (!school) redirect("/school-portal");

  const [terms, programs] = await Promise.all([
    getAdmissionTerms(school.$id) as unknown as Promise<AdmissionTerm[]>,
    getSchoolPrograms(school.$id) as unknown as Promise<Program[]>
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Programs</h1>
        <p className="text-muted-foreground text-lg">
          Manage the degree levels, tuition fees, and requirements for each department.
        </p>
      </div>

      <ProgramsTable 
        schoolId={school.$id} 
        initialPrograms={programs.map(p => ({ ...p }))} 
        terms={terms.map(t => ({ ...t }))}
      />
    </div>
  );
}

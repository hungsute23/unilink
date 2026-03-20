import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile, getSchoolScholarships } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { ScholarshipsTable } from "@/components/school/ScholarshipsTable";
import { Scholarship } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "School Scholarships - School Portal",
  description: "Manage scholarships offered by your institution.",
};

export default async function ScholarshipsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  if (!school) redirect("/school-portal");

  const scholarships = await getSchoolScholarships(school.$id) as unknown as Scholarship[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Financial Awards</h1>
        <p className="text-muted-foreground text-lg">
          Create and manage scholarships, tuition waivers, and stipends to attract top talent.
        </p>
      </div>

      <ScholarshipsTable 
        schoolId={school.$id} 
        initialScholarships={scholarships.map(s => ({ ...s }))} 
      />
    </div>
  );
}

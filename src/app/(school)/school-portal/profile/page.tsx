import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { SchoolProfileForm } from "./SchoolProfileForm";

export const metadata = { title: "School Profile | School Portal" };

export default async function SchoolProfilePage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const raw = await getSchoolProfile(user.$id);
  if (!raw) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <GraduationCap className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
        <p className="text-muted-foreground">No school profile found for your account.</p>
      </div>
    );
  }

  const school = JSON.parse(JSON.stringify(raw));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
          <GraduationCap className="w-4 h-4" />
          School Portal
        </div>
        <h1 className="text-4xl font-black tracking-tighter">School Profile</h1>
        <p className="text-muted-foreground font-medium mt-1">
          Update your institution's information shown to students.
        </p>
      </div>
      <SchoolProfileForm school={school} />
    </div>
  );
}

import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getStudentProfile } from "@/lib/appwrite/queries/student.queries";
import { ProfileForm } from "@/components/student/ProfileForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your UniLink student profile.",
};

export default async function StudentProfilePage() {
  const account = await getLoggedInUser();
  if (!account) return redirect("/login");

  const student = await getStudentProfile(account.$id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Update your personal, academic, and immigration details here. Keeping your profile up-to-date helps universities and employers find you!
        </p>
      </div>

      {student ? (
        <ProfileForm student={{ ...student }} />
      ) : (
        <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-xl text-destructive">
          <h3 className="font-bold">Profile not found</h3>
          <p className="text-sm mt-1">We could not retrieve your student profile. Please contact support.</p>
        </div>
      )}
    </div>
  );
}

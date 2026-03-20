import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile, getSchoolApplications } from "@/lib/appwrite/queries/school.queries";
import { getStudentsByIds } from "@/lib/appwrite/queries/student.queries";
import { redirect } from "next/navigation";
import { ApplicationsTable } from "@/components/school/ApplicationsTable";
import { Application, Student } from "@/types/appwrite.types";

export const metadata: Metadata = {
  title: "Student Applications - School Portal",
  description: "Review and manage applications from students.",
};

export default async function ApplicationsPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  if (!school) redirect("/school-portal");

  const rawApplications = await getSchoolApplications(school.$id) as unknown as Application[];
  
  // Fetch student profiles for these applications
  const studentIds = Array.from(new Set(rawApplications.map(app => app.studentId)));
  const students = await getStudentsByIds(studentIds);
  
  const studentMap = new Map(students.map(s => [s.$id, s]));
  
  const applicationsWithStudents = rawApplications.map(app => ({
    ...app,
    student: studentMap.get(app.studentId) ? { ...studentMap.get(app.studentId)! } : undefined
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Student Applications</h1>
        <p className="text-muted-foreground text-lg">
          Review documents and update the status of incoming applications for your school.
        </p>
      </div>

      <ApplicationsTable initialApplications={applicationsWithStudents.map(app => ({ ...app }))} />
    </div>
  );
}

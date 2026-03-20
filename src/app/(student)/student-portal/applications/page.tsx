import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getStudentApplications } from "@/lib/appwrite/queries/student.queries";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { FileText, Building2, Banknote, Briefcase, CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "My Applications",
  description: "Track your applications for schools, scholarships, and jobs.",
};

export default async function ApplicationsPage() {
  const account = await getLoggedInUser();
  if (!account) return redirect("/login");

  const applications = await getStudentApplications(account.$id);

  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your applications.</p>
        </div>
        <div className="p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
           <FileText className="w-12 h-12 mb-4 text-muted-foreground/50" />
           <p className="text-lg font-medium text-foreground">No applications found.</p>
           <p className="text-sm pb-4">Start applying to schools, scholarships, and jobs to see your progress here.</p>
           <div className="flex gap-4">
             <Link href="/schools" className="text-primary hover:underline hover:text-primary">Browse Schools</Link>
             <Link href="/jobs" className="text-primary hover:underline hover:text-primary">Browse Jobs</Link>
           </div>
        </div>
      </div>
    );
  }

  // Get target details
  const schoolIds = applications.filter(a => a.targetType === "school").map(a => a.targetId);
  const scholarshipIds = applications.filter(a => a.targetType === "scholarship").map(a => a.targetId);
  const jobIds = applications.filter(a => a.targetType === "job").map(a => a.targetId);

  const { databases } = await createAdminClient();
  const dbId = process.env.APPWRITE_DATABASE_ID!;

  const [[schoolsResp], [scholarshipsResp], [jobsResp]] = await Promise.all([
    schoolIds.length > 0 ? Promise.all([databases.listDocuments(dbId, "Schools", [Query.equal("$id", schoolIds)])]) : [{ documents: [] }],
    scholarshipIds.length > 0 ? Promise.all([databases.listDocuments(dbId, "Scholarships", [Query.equal("$id", scholarshipIds)])]) : [{ documents: [] }],
    jobIds.length > 0 ? Promise.all([databases.listDocuments(dbId, "Jobs", [Query.equal("$id", jobIds)])]) : [{ documents: [] }]
  ]);

  const targetMap = new Map();
  (schoolsResp.documents as any[]).forEach(d => targetMap.set(d.$id, { name: d.schoolName, type: "school", icon: Building2 }));
  (scholarshipsResp.documents as any[]).forEach(d => targetMap.set(d.$id, { name: d.name, type: "scholarship", icon: Banknote }));
  (jobsResp.documents as any[]).forEach(d => targetMap.set(d.$id, { name: d.title, type: "job", icon: Briefcase }));

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      case "under_review": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "pending": return "Pending";
      case "under_review": return "Under Review";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      default: return "Unknown";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of your applications for schools, scholarships, and jobs.
        </p>
      </div>

      <div className="grid gap-6">
        {applications.map((app) => {
          const target = targetMap.get(app.targetId);
          if (!target) return null; // Or show deleted item placeholder
          const Icon = target.icon;

          return (
            <div key={app.$id} className="p-6 border rounded-xl bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted/50 border flex items-center justify-center shrink-0 mt-1 shadow-inner">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    <span>{target.type}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <CalendarDays className="w-3 h-3 mr-1" />
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    <Link href={`/${target.type}s/${app.targetId}`} className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary rounded-sm">
                      {target.name}
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </Link>
                  </h3>
                  {app.notes && (
                    <p className="text-sm text-foreground/80 mt-2 italic line-clamp-2 pl-3 border-l-2 border-primary/20 bg-muted/20 p-2 rounded-r-md">"{app.notes}"</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <Badge variant="secondary" className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-0 shadow-sm ${getStatusColor(app.status)}`}>
                  {getStatusLabel(app.status)}
                </Badge>
                {app.documentUrls && app.documentUrls.length > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {app.documentUrls.length} attached file(s)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

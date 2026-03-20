import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSavedItems } from "@/lib/appwrite/queries/student.queries";
import { createSessionClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { School, Scholarship, Job } from "@/types/appwrite.types";
import { SchoolCard } from "@/components/public/SchoolCard";
import { ScholarshipCard } from "@/components/public/ScholarshipCard";
import { JobCard } from "@/components/public/JobCard";
import { BookmarkX } from "lucide-react";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "View your saved schools, scholarships, and jobs.",
};

export default async function SavedItemsPage() {
  const account = await getLoggedInUser();
  if (!account) return redirect("/login");

  const savedItems = await getSavedItems(account.$id);

  if (savedItems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Items</h1>
          <p className="text-muted-foreground">Keep track of the opportunities you love.</p>
        </div>
        <div className="p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
           <BookmarkX className="w-12 h-12 mb-4 text-muted-foreground/50" />
           <p className="text-lg font-medium text-foreground">No saved items yet.</p>
           <p className="text-sm">Start exploring and save your favorite schools, scholarships, and jobs.</p>
        </div>
      </div>
    );
  }

  // Group IDs by type
  const schoolIds = savedItems.filter(i => i.itemType === "school").map(i => i.itemId);
  const scholarshipIds = savedItems.filter(i => i.itemType === "scholarship").map(i => i.itemId);
  const jobIds = savedItems.filter(i => i.itemType === "job").map(i => i.itemId);

  const { databases } = await createSessionClient();
  const dbId = process.env.APPWRITE_DATABASE_ID!;

  // Fetch actual documents in parallel
  const [schoolsResp, scholarshipsResp, jobsResp] = await Promise.all([
    schoolIds.length > 0 ? databases.listDocuments(dbId, "Schools", [Query.equal("$id", schoolIds)]) : Promise.resolve({ documents: [] }),
    scholarshipIds.length > 0 ? databases.listDocuments(dbId, "Scholarships", [Query.equal("$id", scholarshipIds)]) : Promise.resolve({ documents: [] }),
    jobIds.length > 0 ? databases.listDocuments(dbId, "Jobs", [Query.equal("$id", jobIds)]) : Promise.resolve({ documents: [] })
  ]);

  const schools = (schoolsResp.documents as unknown as School[]).map(s => JSON.parse(JSON.stringify(s)));
  const scholarships = (scholarshipsResp.documents as unknown as Scholarship[]).map(s => JSON.parse(JSON.stringify(s)));
  const jobsRaw = (jobsResp.documents as unknown as Job[]).map(s => JSON.parse(JSON.stringify(s)));

  // Fetch Business names for Jobs
  const businessIds = Array.from(new Set(jobsRaw.map(j => j.businessId)));
  const businessesResp = businessIds.length > 0 
    ? await databases.listDocuments(dbId, "Businesses", [Query.equal("$id", businessIds)]) 
    : { documents: [] };
  
  const businessMap: Record<string, string> = {};
  businessesResp.documents.forEach((b: any) => {
    businessMap[b.$id] = b.companyName;
  });

  const jobs = jobsRaw.map(j => ({
    ...j,
    companyName: businessMap[j.businessId] || "Partner Business"
  }));

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-8">
        {schools.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full" />
               <h2 className="text-xl font-black uppercase tracking-widest italic">Saved Schools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {schools.map(school => (
                <SchoolCard 
                   key={school.$id} 
                   id={school.$id}
                   name={school.schoolName}
                   city={school.city || "Various"}
                   type="University"
                   logoUrl={school.logoUrl}
                   description={school.description}
                   isSaved={true}
                   studentId={account.$id}
                />
              ))}
            </div>
          </section>
        )}

        {scholarships.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
               <h2 className="text-xl font-black uppercase tracking-widest italic">Saved Scholarships</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scholarships.map(scholarship => (
                <ScholarshipCard 
                   key={scholarship.$id} 
                   id={scholarship.$id}
                   name={scholarship.name}
                   source={scholarship.source}
                   amount={scholarship.amount}
                   deadline={scholarship.deadline}
                   isSaved={true}
                   studentId={account.$id}
                />
              ))}
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
               <h2 className="text-xl font-black uppercase tracking-widest italic">Saved Jobs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map(job => (
                <JobCard 
                   key={job.$id} 
                   id={job.$id}
                   title={job.title}
                   companyName={job.companyName}
                   city={job.location}
                   hoursPerWeek={job.hoursPerWeek}
                   isSaved={true}
                   studentId={account.$id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

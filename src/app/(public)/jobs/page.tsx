import type { Metadata } from "next";
import { getAllJobs } from "@/lib/appwrite/queries/public.queries";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSavedItems } from "@/lib/appwrite/queries/student.queries";
import { JobCard } from "@/components/public/JobCard";
import { FilterSidebar } from "@/components/public/FilterSidebar";
import { Briefcase, Zap } from "lucide-react";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export const metadata: Metadata = {
  title: "Part-time & Full-time Jobs in Taiwan",
  description: "Find part-time and full-time jobs that support international students in Taiwan. Safe opportunities with good income and work permit support.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; visa?: string }>;
}) {
  const resolvedParams = await searchParams;
  const user = await getLoggedInUser();

  const [jobsRaw, savedItems] = await Promise.all([
    getAllJobs({
       type: resolvedParams.type,
       allowsVisa: resolvedParams.visa === "true" || undefined
    }),
    user ? getSavedItems(user.$id) : Promise.resolve([])
  ]);

  const jobsData = jobsRaw.map(j => JSON.parse(JSON.stringify(j)));
  const savedItemIds = new Set(savedItems.map(i => i.itemId));

  // Hydrate Business names
  const businessIds = Array.from(new Set(jobsData.map(j => j.businessId)));
  const { databases: adminDb } = await createAdminClient();
  const dbId = process.env.APPWRITE_DATABASE_ID!;
  
  const businessesResp = businessIds.length > 0 
    ? await adminDb.listDocuments(dbId, "Businesses", [Query.equal("$id", businessIds)]) 
    : { documents: [] };
  
  const businessMap: Record<string, string> = {};
  businessesResp.documents.forEach((b: any) => {
    businessMap[b.$id] = b.companyName;
  });

  const jobs = jobsData.map(j => ({
    ...j,
    companyName: businessMap[j.businessId] || "Partner Business"
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in duration-1000">
             <Zap className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Career Advancement</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter text-gradient leading-none">
            Elite Careers
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Discover verified jobs with legal work permit support. High-paying roles in hospitality, tech, and services.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar type="jobs" className="hidden lg:block shrink-0" />

          {/* Results Grid */}
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-emerald-500">{jobs.length}</span> Opportunities Available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard 
                    key={job.$id} 
                    id={job.$id}
                    title={job.title}
                    companyName={job.companyName}
                    city={job.location}
                    hoursPerWeek={job.hoursPerWeek}
                    isSaved={savedItemIds.has(job.$id)}
                    studentId={user?.$id}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-muted-foreground glass-card border-none rounded-[32px]">
                  <p className="text-lg font-bold uppercase tracking-widest italic opacity-40">Market Empty</p>
                  <p className="text-xs font-medium mt-2">No opportunities match your current filtration parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

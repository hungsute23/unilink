import type { Metadata, ResolvingMetadata } from "next";
import { createAdminClient } from "@/lib/appwrite/server";
import { Job } from "@/types/appwrite.types";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { checkIsSaved } from "@/lib/appwrite/queries/student.queries";
import { notFound } from "next/navigation";
import { Briefcase, MapPin, Clock, FileBadge, CheckCircle2, ChevronRight, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/shared/SaveButton";
import { ApplyModal } from "@/components/student/ApplyModal";

interface Props {
  params: Promise<{ id: string }>;
}

async function getJob(id: string): Promise<Job | null> {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      "Jobs",
      id
    );
    return doc as unknown as Job;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = (await params).id;
  const item = await getJob(id);

  if (!item) return { title: "Job Not Found" };

  return {
    title: `${item.title} at ${item.location} | UniLink`,
    description: `Hiring ${item.title} (${item.jobType}). Salary: ${item.salaryRange || 'Negotiable'}. View job details now.`,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const id = (await params).id;
  
  const [item, account] = await Promise.all([
    getJob(id),
    getLoggedInUser()
  ]);

  if (!item) notFound();

  let isSaved = false;
  if (account) {
    const saved = await checkIsSaved(account.$id, item.$id);
    isSaved = !!saved;
  }

  const isExpired = new Date(item.deadline) < new Date();

  return (
    <div className="container py-8 md:py-12 px-4 md:px-6 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-8 md:p-10">
           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm font-semibold rounded-md uppercase tracking-tight">
                    {item.jobType}
                  </span>
                  {item.allowsStudentVisa && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-sm font-semibold rounded-md flex items-center">
                       <FileBadge className="w-4 h-4 mr-1.5" /> Work Permit Support
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">{item.title}</h1>
                <div className="text-xl font-bold text-primary">
                  {item.salaryRange || "Negotiable Salary"}
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground pt-2">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {item.location} {item.district ? `(${item.district})` : ""}
                  </div>
                  {item.hoursPerWeek && (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {item.hoursPerWeek} hours/week
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                 {isExpired ? (
                   <Button size="lg" className="w-full py-6 text-lg" disabled>
                     Application Closed
                   </Button>
                 ) : (
                   <ApplyModal 
                     targetId={item.$id}
                     targetType="job"
                     targetName={item.title}
                     studentId={account?.$id}
                   />
                 )}
                 <SaveButton 
                   studentId={account?.$id} 
                   itemId={item.$id} 
                   itemType="job" 
                   initialIsSaved={isSaved} 
                   className="w-full py-6 text-lg"
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ChevronRight className="w-6 h-6 text-primary" /> Job Description
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pl-8">
              {item.requirements}
            </div>
          </section>

          <section className="space-y-4 bg-muted/30 p-8 rounded-2xl border">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <HandHeart className="w-6 h-6 text-primary" /> Benefits & Perks
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line pl-8">
              {item.benefits || "Standard benefits as per labor law. Details will be discussed during the interview process."}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
             <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chinese Proficiency</h3>
                <p className="font-medium flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-primary mr-2" />
                  {item.chineseRequired || "Not required, basic knowledge preferred"}
                </p>
             </div>
             
             <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Application Deadline</h3>
                <p className="font-medium text-destructive">
                  {new Date(item.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
             </div>
             
             <div className="pt-4 border-t">
               <p className="text-xs text-muted-foreground text-center">
                 This job posting is protected by UniLink's verification standards. Any requests for reservation fees or deposits from employers are strictly prohibited.
               </p>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}

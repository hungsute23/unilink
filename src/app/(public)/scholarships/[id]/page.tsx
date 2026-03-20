import type { Metadata, ResolvingMetadata } from "next";
import { createAdminClient } from "@/lib/appwrite/server";
import { Scholarship } from "@/types/appwrite.types";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { checkIsSaved } from "@/lib/appwrite/queries/student.queries";
import { notFound } from "next/navigation";
import { Banknote, CheckCircle2, CalendarDays, ExternalLink, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/shared/SaveButton";
import { ApplyModal } from "@/components/student/ApplyModal";

interface Props {
  params: Promise<{ id: string }>;
}

async function getScholarship(id: string): Promise<Scholarship | null> {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      "Scholarships",
      id
    );
    return doc as unknown as Scholarship;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = (await params).id;
  const item = await getScholarship(id);

  if (!item) return { title: "Scholarship Not Found" };

  return {
    title: `${item.name} | Taiwan Scholarship`,
    description: `Scholarship amount: ${item.amount} from ${item.source}. Deadline: ${new Date(item.deadline).toLocaleDateString("en-US")}.`,
  };
}

export default async function ScholarshipDetailPage({ params }: Props) {
  const id = (await params).id;
  
  const [item, account] = await Promise.all([
    getScholarship(id),
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
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden">
        {isExpired && (
           <div className="absolute top-0 right-0 py-1.5 px-4 bg-destructive text-destructive-foreground font-bold rounded-bl-2xl">
              Expired
           </div>
        )}
        
        <div className="w-24 h-24 rounded-2xl bg-background border flex items-center justify-center shrink-0">
          <Banknote className="w-12 h-12 text-primary" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
              {item.source}
            </span>
            <span className="text-secondary-foreground font-medium flex items-center">
              <GraduationCap className="w-4 h-4 mr-1" /> Taiwan Scholarship
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{item.name}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground pt-1">
             <span className="font-semibold text-foreground text-lg">{item.amount || "Full Scholarship"}</span>
             <span>• Deadline: {new Date(item.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-b pb-2">Scholarship Coverage</h2>
            <div className="flex flex-wrap gap-3">
               {item.coversTuition && (
                 <div className="flex items-center bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium border border-green-200">
                   <CheckCircle2 className="w-5 h-5 mr-2" /> 100% Tuition Waiver
                 </div>
               )}
               {item.coversDorm && (
                 <div className="flex items-center bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium border border-green-200">
                   <CheckCircle2 className="w-5 h-5 mr-2" /> Dormitory Support
                 </div>
               )}
               {item.coversStipend && (
                 <div className="flex items-center bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2 rounded-lg font-medium border border-green-200">
                   <CheckCircle2 className="w-5 h-5 mr-2" /> Monthly Living Stipend
                 </div>
               )}
            </div>
            <div className="mt-4 pt-4 prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
               {item.requirements || "No detailed requirements provided for this scholarship. Please check the official application link or contact the provider for more information."}
            </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-2xl font-bold border-b pb-2">Eligibility Requirements</h2>
             <ul className="space-y-4 text-muted-foreground">
                <li><strong className="text-foreground">Minimum GPA:</strong> {item.minGpa || "Not required"}</li>
                <li><strong className="text-foreground">English Proficiency:</strong> {item.minEnglishReq || "Not required"} (TOEIC/IELTS/TOEFL)</li>
                <li><strong className="text-foreground">Chinese Proficiency:</strong> {item.minChineseReq || "Not required"} (TOCFL)</li>
                <li><strong className="text-foreground">Eligible Degrees:</strong> {(item.eligibleDegrees && item.eligibleDegrees.length > 0) ? item.eligibleDegrees.join(', ') : "All Degrees"}</li>
             </ul>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card shadow-sm space-y-4">
            <h3 className="font-bold text-xl uppercase tracking-tight">Apply Now</h3>
            <div className="flex items-center text-muted-foreground text-sm gap-2">
              <CalendarDays className="w-4 h-4" /> 
              Deadline: <strong className="text-foreground">{new Date(item.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </div>
            {item.applicationUrl && (
              <Button className="w-full py-6 text-base" size="lg" disabled={isExpired} asChild={!isExpired}>
                {isExpired ? (
                   <span>Past Deadline</span>
                ) : (
                  <a href={item.applicationUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center">
                    Visit Official Site <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </Button>
            )}
            {!item.applicationUrl && !isExpired && (
                <div className="space-y-3">
                  <ApplyModal 
                    targetId={item.$id}
                    targetType="scholarship"
                    targetName={item.name}
                    studentId={account?.$id}
                  />
                  <SaveButton 
                    studentId={account?.$id} 
                    itemId={item.$id} 
                    itemType="scholarship" 
                    initialIsSaved={isSaved} 
                    className="w-full justify-center py-6 text-base"
                  />
                </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

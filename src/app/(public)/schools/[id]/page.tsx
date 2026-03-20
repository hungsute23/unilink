import type { Metadata, ResolvingMetadata } from "next";
import { createAdminClient } from "@/lib/appwrite/server";
import { School } from "@/types/appwrite.types";
import { getSchoolAdmissionTerms, getSchoolPrograms } from "@/lib/appwrite/queries/public.queries";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { checkIsSaved } from "@/lib/appwrite/queries/student.queries";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, Building2, CheckCircle2, CalendarDays, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/shared/SaveButton";
import { ApplyModal } from "@/components/student/ApplyModal";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSchool(id: string): Promise<School | null> {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      "Schools",
      id
    );
    return doc as unknown as School;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = (await params).id;
  const school = await getSchool(id);

  if (!school) return { title: "School Not Found" };

  return {
    title: `${school.schoolName} | Study in Taiwan`,
    description: school.description || `Detailed information about ${school.schoolName}.`,
    openGraph: {
      title: `${school.schoolName} | Study in Taiwan`,
      description: school.description || `Detailed information about ${school.schoolName}.`,
    }
  };
}

export default async function SchoolDetailPage({ params }: Props) {
  const id = (await params).id;
  const school = await getSchool(id);

  if (!school) {
    notFound();
  }

  // Fetch related data
  const [terms, programs, account] = await Promise.all([
    getSchoolAdmissionTerms(id),
    getSchoolPrograms(id),
    getLoggedInUser()
  ]);

  let isSaved = false;
  if (account) {
    const saved = await checkIsSaved(account.$id, school.$id);
    isSaved = !!saved;
  }

  return (
    <div className="container py-8 md:py-12 px-4 md:px-6 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 p-8 rounded-2xl bg-card border shadow-sm relative overflow-hidden">
        {school.ranking && (
           <div className="absolute top-0 right-0 py-1.5 px-4 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold rounded-bl-2xl">
              Ranking: {school.ranking}
           </div>
        )}
        
        <div className="w-24 h-24 rounded-2xl bg-muted/30 border flex items-center justify-center shrink-0">
          <Building2 className="w-12 h-12 text-primary/50" />
        </div>
        
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold">{school.schoolName}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              {school.city || "Taipei, Taiwan"}
            </div>
            {school.website && (
               <a href={school.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors">
                 <ExternalLink className="w-4 h-4 mr-1.5" />
                 Official Website
               </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-b pb-2">About the University</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {school.description || "The university has not provided detailed introductory information. Please contact them directly or visit their official website for more details on academic programs."}
            </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-2xl font-bold border-b pb-2 flex items-center gap-2">
               <CalendarDays className="w-6 h-6 text-primary" /> Admission Intakes
             </h2>
             {terms.length > 0 ? (
               <div className="space-y-4">
                 {terms.map((term) => {
                   const isOpen = new Date() >= new Date(term.applyStartDate) && new Date() <= new Date(term.applyEndDate);
                   return (
                     <div key={term.$id} className="p-4 border rounded-xl bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                         <h3 className="font-bold text-lg">{term.termName}</h3>
                         <p className="text-sm text-muted-foreground mt-1">
                           Application Period: {new Date(term.applyStartDate).toLocaleDateString('en-US')} - {new Date(term.applyEndDate).toLocaleDateString('en-US')}
                         </p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOpen ? 'bg-green-100 text-green-700' : 'bg-secondary text-secondary-foreground'}`}>
                         {isOpen ? 'Open' : 'Closed'}
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="p-8 border border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/20">
                  <p>No admission intakes have been updated yet.</p>
               </div>
             )}
          </section>

          <section className="space-y-4">
             <h2 className="text-2xl font-bold border-b pb-2 flex items-center gap-2">
               <BookOpen className="w-6 h-6 text-primary" /> Academic Programs
             </h2>
             {programs.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {programs.map((program) => (
                   <div key={program.$id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                     <h3 className="font-bold">{program.departmentName}</h3>
                     <div className="text-sm text-muted-foreground mt-2 space-y-1">
                       <p>Degree Level: <span className="text-foreground font-medium">{program.degreeLevel}</span></p>
                       <p>Language of Instruction: <span className="text-foreground font-medium">{program.languageInstruction}</span></p>
                       {program.tuitionFee && <p>Estimated Tuition Fee: <span className="text-foreground font-medium">{program.tuitionFee}</span></p>}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 border border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/20">
                  <p>No academic programs have been updated yet.</p>
               </div>
             )}
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-muted/10 space-y-4">
            <h3 className="font-bold text-lg">Quick Facts</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span><strong className="block text-foreground">Location:</strong> {school.city || "TBA"}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span><strong className="block text-foreground">Dormitory:</strong> {school.hasDorm ? "Available for international students" : "Off-campus self-arranged"}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span><strong className="block text-foreground">Admission Email:</strong> {school.contactEmail || "TBA"}</span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 rounded-xl border bg-primary/5 text-primary space-y-4 text-center">
            <h3 className="font-bold text-lg">Interested in this school?</h3>
            <p className="text-sm opacity-90 mb-4">You can apply directly or save this school to your favorites.</p>
            <div className="space-y-3">
              <ApplyModal 
                targetId={school.$id}
                targetType="school"
                targetName={school.schoolName}
                studentId={account?.$id}
              />
              <SaveButton 
                studentId={account?.$id} 
                itemId={school.$id} 
                itemType="school" 
                initialIsSaved={isSaved} 
                className="w-full justify-center py-6 text-base shadow-sm"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

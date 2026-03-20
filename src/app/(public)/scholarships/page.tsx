import type { Metadata } from "next";
import { getAllScholarships } from "@/lib/appwrite/queries/public.queries";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSavedItems } from "@/lib/appwrite/queries/student.queries";
import { ScholarshipCard } from "@/components/public/ScholarshipCard";
import { FilterSidebar } from "@/components/public/FilterSidebar";
import { Banknote, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Scholarships in Taiwan",
  description: "Discover the latest full and partial scholarships from the Taiwan Government (MOE, ICDF) and universities.",
};

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const resolvedParams = await searchParams;
  const user = await getLoggedInUser();

  const [scholarshipsRaw, savedItems] = await Promise.all([
    getAllScholarships({ source: resolvedParams.source }),
    user ? getSavedItems(user.$id) : Promise.resolve([])
  ]);

  const scholarships = scholarshipsRaw.map(s => JSON.parse(JSON.stringify(s)));
  const savedItemIds = new Set(savedItems.map(i => i.itemId));

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 animate-in fade-in duration-1000">
             <Sparkles className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Funding Opportunities</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter text-gradient leading-none">
            Global Funding
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Access billions in scholarship funds. From full government stipends to university-specific tuition wavers.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar type="scholarships" className="hidden lg:block shrink-0" />

          {/* Results Grid */}
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-amber-500">{scholarships.length}</span> Active Programs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {scholarships.length > 0 ? (
                scholarships.map((scholarship) => (
                  <ScholarshipCard 
                    key={scholarship.$id} 
                    id={scholarship.$id}
                    name={scholarship.name}
                    source={scholarship.source}
                    amount={scholarship.amount}
                    deadline={scholarship.deadline}
                    isSaved={savedItemIds.has(scholarship.$id)}
                    studentId={user?.$id}
                    coversTuition={scholarship.coversTuition}
                    coversStipend={scholarship.coversStipend}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-muted-foreground glass-card border-none rounded-[32px]">
                  <p className="text-lg font-bold uppercase tracking-widest italic opacity-40">No Funding Records</p>
                  <p className="text-xs font-medium mt-2">No programs match your current filtration parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getAllSchools } from "@/lib/appwrite/queries/public.queries";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSavedItems } from "@/lib/appwrite/queries/student.queries";
import { SchoolCard } from "@/components/public/SchoolCard";
import { FilterSidebar } from "@/components/public/FilterSidebar";
import { MobileFilterDrawer } from "@/components/public/MobileFilterDrawer";
import { Pagination } from "@/components/public/Pagination";
import { GraduationCap } from "lucide-react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Universities in Taiwan",
  description: "Explore the list of top universities in Taiwan, admission information, rankings, and scholarships.",
};

const PER_PAGE = 6;

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; type?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const user = await getLoggedInUser();

  const [schoolsRaw, savedItems] = await Promise.all([
    getAllSchools({
      search: resolvedParams.q,
      city: resolvedParams.city,
      type: resolvedParams.type,
    }),
    user ? getSavedItems(user.$id) : Promise.resolve([])
  ]);

  const schools = schoolsRaw.map(s => JSON.parse(JSON.stringify(s)));
  const savedItemIds = new Set(savedItems.map(i => i.itemId));

  const totalPages = Math.ceil(schools.length / PER_PAGE);
  const paged = schools.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in duration-1000">
             <GraduationCap className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Academic Excellence</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter text-gradient leading-none">
            Elite Institutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            Discover world-class universities in Taiwan. Filter by infrastructure, region, and academic prestige.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <Suspense><FilterSidebar type="schools" className="hidden lg:block shrink-0" /></Suspense>

          {/* Results Grid */}
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-primary">{schools.length}</span> Institutions Found
              </p>
              <Suspense><MobileFilterDrawer type="schools" /></Suspense>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paged.length > 0 ? (
                paged.map((school) => (
                  <SchoolCard
                    key={school.$id}
                    id={school.$id}
                    name={school.schoolName}
                    city={school.city || "Taiwan"}
                    type="University"
                    logoUrl={school.logoUrl}
                    description={school.description}
                    isSaved={savedItemIds.has(school.$id)}
                    studentId={user?.$id}
                  />
                ))
              ) : (
                <div className="col-span-full py-32 text-center text-muted-foreground glass-card border-none rounded-[18px]">
                  <p className="text-lg font-bold uppercase tracking-widest italic opacity-40">Intelligence Missing</p>
                  <p className="text-xs font-medium mt-2">No institutions match your current filtration parameters.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Suspense>
                <Pagination currentPage={page} totalPages={totalPages} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { getPartners } from "@/lib/appwrite/actions/admin.actions";
import { ModerationTable } from "@/components/admin/ModerationTable";
import { AdminSearchBar } from "@/components/admin/AdminSearchBar";
import { School, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { searchParams: Promise<{ q?: string; status?: string }> }

export default async function SchoolsModerationPage({ searchParams }: Props) {
  const { q, status } = await searchParams;
  const result = await getPartners("Schools", 50, 0, q, (status as any) ?? "all");

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card border-none rounded-3xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Failed to load schools</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">{result.error}</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12">Try Again</Button>
      </div>
    );
  }

  const partners = JSON.parse(JSON.stringify(result.documents!)).map((doc: any) => ({
    $id: doc.$id, isApproved: doc.isApproved, schoolName: doc.schoolName,
    contactEmail: doc.contactEmail, city: doc.city, website: doc.website, $createdAt: doc.$createdAt,
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
            <School className="w-4 h-4" />
            Verification Queue
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient">Partner Schools</h1>
          <p className="text-muted-foreground font-medium mt-2 max-w-xl">
            Audit educational institutions. Approve genuine schools to grant access to program management and scholarship listing.
          </p>
          {q && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing <span className="font-semibold text-foreground">{partners.length}</span> result{partners.length !== 1 ? "s" : ""} for &quot;{q}&quot;
            </p>
          )}
        </div>
        <AdminSearchBar placeholder="Search schools..." showStatusFilter />
      </div>
      <ModerationTable partners={partners} type="Schools" />
    </div>
  );
}

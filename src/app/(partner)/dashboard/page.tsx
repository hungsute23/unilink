import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile, getBusinessJobs, getBusinessApplications } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import { BusinessProfileForm } from "@/components/partner/BusinessProfileForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { 
  Briefcase, 
  Users, 
  Eye, 
  ArrowUpRight,
  PlusCircle,
  Building2,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your business profile and recruitment activity.",
};

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const business = await getBusinessProfile(user.$id);
  
  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center glass-card border-dashed">
        <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-black">No Business Profile Found</h2>
        <p className="text-muted-foreground max-w-sm mt-3 font-medium opacity-70">
          Your account is not linked to any business profile yet. 
          Please contact our partnership team to get started.
        </p>
      </div>
    );
  }

  const [jobs, applications] = await Promise.all([
    getBusinessJobs(business.$id),
    getBusinessApplications(business.$id)
  ]);

  const stats = [
    { label: "Open Positions", value: jobs.filter(j => j.isActive).length.toString(), icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Applicants", value: applications.length.toString(), icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Profile Views", value: "142", icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Business Dashboard" 
        description="Manage your company brand, recruitment pipeline, and connect with top international talent."
      >
        <Link href="/dashboard/jobs">
          <Button className="h-12 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-8 relative group" gradient>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest opacity-70">
              {stat.label}
            </p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-4xl font-black">{stat.value}</h3>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <GlassCard className="p-10">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 border-b pb-6">
              <Building2 className="w-7 h-7 text-primary" />
              Company Details
            </h3>
            <BusinessProfileForm business={business} />
          </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 vibrant-gradient text-white">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold mb-3">Recruitment Tip</h3>
             <p className="text-sm text-white/80 leading-relaxed font-medium">
               Providing details about **Student Visa** sponsorship increases applicant quality by 60% for international roles.
             </p>
          </GlassCard>

          <GlassCard className="p-8 space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest opacity-60">Upcoming Interviews</h4>
            <div className="py-8 text-center opacity-40">
              <p className="text-xs font-bold">No interviews scheduled yet.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

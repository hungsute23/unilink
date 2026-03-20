import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getSchoolProfile } from "@/lib/appwrite/queries/school.queries";
import { redirect } from "next/navigation";
import { SchoolProfileForm } from "@/components/school/SchoolProfileForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  BookOpen, 
  HelpCircle 
} from "lucide-react";

export const metadata: Metadata = {
  title: "School Profile",
  description: "Monitor international student applications and manage institutional scholarship programs.",
};

export default async function SchoolPortalPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const school = await getSchoolProfile(user.$id);
  
  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center glass-card border-dashed">
        <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-black">No School Profile Found</h2>
        <p className="text-muted-foreground max-w-sm mt-3 font-medium opacity-70">
          Your account is not linked to any school profile yet. 
          Please contact our support team to get started.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total Applicants", value: "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Programs", value: "0", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Overview Insights", value: "Live", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Institutional Profile" 
        description="Manage your university details, recruitment status, and brand identity on UniLink."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
           <GlassCard className="p-10">
              <SchoolProfileForm school={{ ...school }} />
           </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 space-y-6" gradient>
            <h3 className="font-black text-xl flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              Quick Statistics
            </h3>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-5 rounded-2xl border border-white/10 glass flex justify-between items-center transition-all hover:border-primary/30 group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest opacity-70">{stat.label}</span>
                  </div>
                  <span className="text-xl font-black">{stat.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          
          <GlassCard className="p-8 vibrant-gradient text-white">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold mb-3">Optimize for Visibility</h3>
             <p className="text-sm text-white/80 leading-relaxed font-medium">
               High-quality logos and detailed descriptions increase student engagement by up to 45%. 
               Keep your profile rich and accurate.
             </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Helper to keep the code clean
import { cn } from "@/lib/utils";

import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { 
  Send, 
  Bookmark, 
  Calendar, 
  ArrowUpRight,
  GraduationCap
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your applications and discover schools and jobs.",
};

const stats = [
  { label: "Applications Sent", value: "0", icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Saved Items", value: "0", icon: Bookmark, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "Interviews", value: "0", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

export default function StudentPortalPage() {
  return (
    <div className="space-y-12">
      <PageHeader 
        title="Welcome back! 👋" 
        description="Maximize your eligibility for top Taiwanese universities and high-growth scholarships."
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 space-y-6">
          <h3 className="text-2xl font-bold">Recent Activity</h3>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
               <Send className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">No recent applications yet.</p>
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-6" gradient>
          <h3 className="text-2xl font-bold">Recommended for You</h3>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
               <GraduationCap className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Complete your profile to get recommendations.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

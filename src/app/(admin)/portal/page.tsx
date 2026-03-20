import { getPlatformStats } from "@/lib/appwrite/actions/admin.actions";
import { OverviewStats } from "@/components/admin/OverviewStats";
import { ActivityChart } from "@/components/admin/ActivityChart";
import { 
  ShieldCheck, 
  ArrowRight, 
  History,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PortalPage() {
  const result = await getPlatformStats();
  
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card border-none rounded-3xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Failed to load platform stats</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">{result.error}</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12">Try Again</Button>
      </div>
    );
  }

  const stats = JSON.parse(JSON.stringify(result.stats!));

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
            <ShieldCheck className="w-4 h-4" />
            Platform Control Center
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient leading-tight">
            Admin Overview
          </h1>
          <p className="text-muted-foreground font-medium mt-2 max-w-xl">
            Real-time monitoring of UniLink infrastructure. Approve partners, moderate content, and manage global system configurations.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-14 px-8 rounded-2xl font-black border-primary/20 hover:bg-primary/5 transition-all">
            <Link href="/portal/config">System Config</Link>
          </Button>
          <Button className="h-14 px-8 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Quick Action
          </Button>
        </div>
      </div>

      <OverviewStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        
        <div className="space-y-8">
          <div className="glass-card border-none rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black uppercase tracking-widest text-sm opacity-60 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Alerts
              </h3>
              <Link href="/portal/moderation" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View All</Link>
            </div>
            
            <div className="space-y-4">
              {[
                { type: "Pending Approval", title: "National Taiwan University", time: "2h ago", color: "bg-amber-500" },
                { type: "New Partner", title: "TSMC Recruitment", time: "5h ago", color: "bg-blue-500" },
                { type: "System Update", title: "Semester config changed", time: "1d ago", color: "bg-emerald-500" },
              ].map((alert, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer hover:bg-primary/5 p-2 rounded-2xl transition-all">
                  <div className={cn("w-1 h-10 rounded-full mt-1", alert.color)} />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{alert.type}</p>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{alert.title}</p>
                    <p className="text-[10px] font-medium opacity-50 mt-1">{alert.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 leading-tight">Maintenance Mode is OFF</h3>
              <p className="text-xs font-medium opacity-70 mb-6 max-w-[200px]">The platform is currently accessible by all users globally.</p>
              <Button size="sm" className="rounded-xl font-black bg-white text-primary hover:bg-white/90">Toggle System State</Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

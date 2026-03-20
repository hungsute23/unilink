import { 
  Users, 
  School, 
  Building2, 
  GraduationCap, 
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color: string;
}

interface OverviewStatsProps {
  stats: {
    totalUsers: number;
    totalSchools: number;
    totalScholarships: number;
    totalJobs: number;
    totalApplications: number;
  };
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const items: StatItem[] = [
    { 
      label: "Total Users", 
      value: stats.totalUsers, 
      icon: Users,
      trend: { value: "12%", isUp: true },
      color: "from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400"
    },
    { 
      label: "Partner Schools", 
      value: stats.totalSchools, 
      icon: School,
      trend: { value: "5%", isUp: true },
      color: "from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400"
    },
    { 
      label: "Government Scholarships", 
      value: stats.totalScholarships, 
      icon: GraduationCap,
      color: "from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400"
    },
    { 
      label: "Business Jobs", 
      value: stats.totalJobs, 
      icon: Building2,
      trend: { value: "8%", isUp: true },
      color: "from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:text-emerald-400"
    },
    { 
      label: "Total Applications", 
      value: stats.totalApplications, 
      icon: FileText,
      trend: { value: "24%", isUp: true },
      color: "from-rose-500/20 to-rose-600/20 text-rose-600 dark:text-rose-400"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <div key={item.label} className="group relative glass-card border-none p-6 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="relative z-10">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br transition-transform group-hover:rotate-6", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">{item.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black tracking-tighter">{item.value.toLocaleString()}</h3>
              {item.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-black px-2 py-1 rounded-lg",
                  item.trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {item.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.trend.value}
                </div>
              )}
            </div>
          </div>
          {/* Abstract background shape */}
          <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-20 bg-gradient-to-br", item.color)} />
        </div>
      ))}
    </div>
  );
}

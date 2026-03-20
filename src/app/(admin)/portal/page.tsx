import { getPlatformStats } from "@/lib/appwrite/actions/admin.actions";
import Link from "next/link";
import {
  Users, School, GraduationCap, Briefcase,
  FileText, ArrowRight, ShieldCheck,
  Settings2, Building2,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc, color }: { href: string; icon: any; label: string; desc: string; color: string }) {
  return (
    <Link href={href} className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/40 hover:shadow-sm transition-all group flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default async function PortalPage() {
  const result = await getPlatformStats();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load platform stats</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2">{result.error}</p>
      </div>
    );
  }

  const stats = result.stats!;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-rose-200 text-sm font-medium">Platform Control Center</p>
          <h2 className="text-2xl font-bold mt-0.5">Admin Overview</h2>
          <p className="text-rose-200 text-sm mt-1">
            {stats.totalUsers.toLocaleString()} registered users across the platform
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Users"        value={stats.totalUsers}        icon={Users}         color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <StatCard label="Partner Schools"    value={stats.totalSchools}      icon={School}        color="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" />
        <StatCard label="Scholarships"       value={stats.totalScholarships} icon={GraduationCap} color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <StatCard label="Job Postings"       value={stats.totalJobs}         icon={Briefcase}     color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Applications"       value={stats.totalApplications} icon={FileText}      color="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" />
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction href="/portal/users"       icon={Users}         label="Manage Users"       desc="View and manage all registered users"     color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <QuickAction href="/portal/schools"     icon={School}        label="Partner Schools"    desc={`${stats.totalSchools} schools registered`}  color="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" />
          <QuickAction href="/portal/businesses"  icon={Building2}     label="Businesses"         desc="Manage partner companies"                 color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
          <QuickAction href="/portal/scholarships"icon={GraduationCap} label="Scholarships"       desc={`${stats.totalScholarships} programs listed`} color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <QuickAction href="/portal/community"   icon={FileText}      label="Community Posts"    desc="Moderate student community content"        color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
          <QuickAction href="/portal/config"      icon={Settings2}     label="System Config"      desc="Platform settings and configuration"       color="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" />
        </div>
      </div>
    </div>
  );
}

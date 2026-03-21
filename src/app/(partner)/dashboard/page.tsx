import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile, getBusinessJobs, getBusinessApplications } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, Users, ArrowRight,
  Building2, PlusCircle, CheckCircle2,
  Clock, XCircle, UserCheck,
} from "lucide-react";

export const metadata: Metadata = { title: "Overview | Partner Dashboard" };

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc, color }: { href: string; icon: any; label: string; desc: string; color: string }) {
  return (
    <Link href={href} className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/40 hover:shadow-sm transition-all group flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const business = await getBusinessProfile(user.$id);

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Business Profile Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2">
          Your account is not linked to any business profile yet. Contact our partnership team to get started.
        </p>
      </div>
    );
  }

  const [rawJobs, rawApplications] = await Promise.all([
    getBusinessJobs(business.$id),
    getBusinessApplications(business.$id),
  ]);
  const jobs         = JSON.parse(JSON.stringify(rawJobs));
  const applications = JSON.parse(JSON.stringify(rawApplications));

  const activeJobs    = jobs.filter((j: any) => j.isActive).length;
  const pendingApps   = applications.filter((a: any) => a.status === "pending").length;
  const acceptedApps  = applications.filter((a: any) => a.status === "accepted").length;
  const rejectedApps  = applications.filter((a: any) => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-emerald-200 text-sm font-medium">Partner Dashboard</p>
          <h2 className="text-2xl font-bold mt-0.5">{business.companyName ?? business.name}</h2>
          <p className="text-emerald-200 text-sm mt-1">
            {pendingApps > 0
              ? `${pendingApps} pending application${pendingApps !== 1 ? "s" : ""} awaiting review`
              : "No pending applications right now"}
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
          <Building2 className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Positions"    value={activeJobs}         icon={Briefcase}    color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <StatCard label="Total Jobs"        value={jobs.length}        icon={Briefcase}    color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Total Applicants"  value={applications.length}icon={Users}        color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Accepted"          value={acceptedApps}       icon={CheckCircle2} color="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction href="/dashboard/jobs/new"  icon={PlusCircle} label="Post New Job"        desc="Recruit international talent"         color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <QuickAction href="/dashboard/jobs"      icon={Briefcase}  label="Manage Jobs"         desc={`${activeJobs} active position${activeJobs !== 1 ? "s" : ""}`}         color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <QuickAction href="/dashboard/applications" icon={Users}   label="Review Applications" desc={`${pendingApps} pending review`}      color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            <QuickAction href="/dashboard/profile"   icon={Building2}  label="Company Profile"     desc="Update details & branding"            color="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        {/* Application status */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Application Status</h3>
          <div className="space-y-3">
            {[
              { label: "Pending",  count: pendingApps,  icon: Clock,     color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-500/10" },
              { label: "Accepted", count: acceptedApps, icon: UserCheck, color: "text-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-500/10" },
              { label: "Rejected", count: rejectedApps, icon: XCircle,   color: "text-red-500",    bg: "bg-red-50 dark:bg-red-500/10" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>

          {applications.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/10">
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400"   style={{ width: `${(pendingApps  / applications.length) * 100}%` }} />
                <div className="bg-emerald-400" style={{ width: `${(acceptedApps / applications.length) * 100}%` }} />
                <div className="bg-red-400"     style={{ width: `${(rejectedApps / applications.length) * 100}%` }} />
              </div>
            </div>
          )}

          <Link href="/dashboard/applications" className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View all applications <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent applications */}
      {applications.length > 0 && (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Applications</h3>
            <Link href="/dashboard/applications" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {applications.slice(0, 5).map((app: any) => (
              <div key={app.$id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {app.job?.title ?? "Job Application"}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(app.$createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  app.status === "accepted"      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : app.status === "rejected"    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : app.status === "under_review"? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                }`}>
                  {app.status === "under_review" ? "Under Review" : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

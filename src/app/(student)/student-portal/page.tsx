import type { Metadata } from "next";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getStudentProfile, getStudentApplications, getSavedItems } from "@/lib/appwrite/queries/student.queries";
import { getPostsByAuthor } from "@/lib/appwrite/queries/community.queries";
import Link from "next/link";
import {
  Send, Bookmark, PenSquare, User,
  GraduationCap, Briefcase, Award, ArrowRight,
  CheckCircle2, Clock, TrendingUp,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard | Student Portal" };

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
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
    <Link href={href} className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all group flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default async function StudentPortalPage() {
  const user = await getLoggedInUser();
  const [profile, applications, saved, postsRaw] = await Promise.all([
    user ? getStudentProfile(user.$id) : null,
    user ? getStudentApplications(user.$id) : [],
    user ? getSavedItems(user.$id) : [],
    user ? getPostsByAuthor(user.$id) : [],
  ]);

  const pendingApps = applications.filter((a: any) => a.status === "pending").length;
  const acceptedApps = applications.filter((a: any) => a.status === "accepted").length;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Profile completion
  const fields = ["fullName", "nationality", "highestEducation", "englishLevel", "gpa", "targetDegree", "hasPassport"];
  const filled = profile ? fields.filter(f => (profile as any)[f]).length : 0;
  const completion = Math.round((filled / fields.length) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-sm font-medium">Welcome back</p>
          <h2 className="text-2xl font-bold mt-0.5">{user?.name ?? "Student"} 👋</h2>
          <p className="text-indigo-200 text-sm mt-1">
            {completion < 100 ? `Complete your profile to unlock more opportunities (${completion}% done)` : "Your profile is complete. Keep exploring!"}
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/10 items-center justify-center">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={applications.length} icon={Send} color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <StatCard label="Saved Items" value={saved.length} icon={Bookmark} color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        <StatCard label="Community Posts" value={postsRaw.length} icon={PenSquare} color="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" />
        <StatCard label="Accepted" value={acceptedApps} icon={CheckCircle2} color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction href="/schools" icon={GraduationCap} label="Browse Schools" desc="Explore 6 universities in Taiwan" color="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <QuickAction href="/scholarships" icon={Award} label="Find Scholarships" desc="8 active scholarship programs" color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <QuickAction href="/jobs" icon={Briefcase} label="Browse Jobs" desc="18 opportunities for students" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <QuickAction href="/student-portal/community/new" icon={PenSquare} label="Write a Post" desc="Share your Taiwan experience" color="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        {/* Profile completion */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Completion</h3>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Full Name",  done: !!profile?.fullName },
              { label: "Nationality", done: !!profile?.nationality },
              { label: "Education",  done: !!profile?.highestEducation },
              { label: "English Level", done: !!profile?.englishLevel },
              { label: "GPA",        done: !!profile?.gpa },
              { label: "Target Degree", done: !!profile?.targetDegree },
              { label: "Passport",   done: !!profile?.hasPassport },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.done ? "text-emerald-500" : "text-gray-200 dark:text-white/10"}`} />
                <span className={item.done ? "text-gray-600 dark:text-gray-300" : "text-gray-300 dark:text-white/30"}>{item.label}</span>
              </div>
            ))}
          </div>
          <Link href="/student-portal/profile" className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Update profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent applications */}
      {applications.length > 0 && (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Applications</h3>
            <Link href="/student-portal/applications" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {applications.slice(0, 4).map((app: any) => (
              <div key={app.$id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">{app.targetType} application</p>
                    <p className="text-xs text-gray-400">{new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  app.status === "accepted" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : app.status === "rejected" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : app.status === "under_review" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
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

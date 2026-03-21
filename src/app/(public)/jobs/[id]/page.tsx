import type { Metadata } from "next";
import { createAdminClient } from "@/lib/appwrite/server";
import { Job, Business } from "@/types/appwrite.types";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { checkIsSaved } from "@/lib/appwrite/queries/student.queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, MapPin, Clock, CheckCircle2, ChevronRight,
  DollarSign, Globe, Building2, Languages, CalendarDays,
  FileBadge, ArrowLeft, ExternalLink, Star, Users,
} from "lucide-react";
import { SaveButton } from "@/components/shared/SaveButton";
import { SafeLogo } from "@/components/shared/SafeLogo";
import { ApplyModal } from "@/components/student/ApplyModal";
import { cn } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

async function getJob(id: string): Promise<Job | null> {
  try {
    const { databases } = await createAdminClient();
    return (await databases.getDocument(DB_ID, "Jobs", id)) as unknown as Job;
  } catch { return null; }
}

async function getBusiness(id: string): Promise<Business | null> {
  try {
    const { databases } = await createAdminClient();
    return (await databases.getDocument(DB_ID, "Businesses", id)) as unknown as Business;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob((await params).id);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} | UniLink Jobs`,
    description: `${job.jobType} · ${job.salaryRange ?? "Negotiable"} · ${job.location}`,
  };
}

const JOB_TYPE_STYLES: Record<string, string> = {
  "Full-time":  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Part-time":  "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  "Internship": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};

const CHINESE_LEVEL_STYLES: Record<string, string> = {
  "None":          "text-emerald-600 dark:text-emerald-400",
  "Basic":         "text-blue-600 dark:text-blue-400",
  "Conversational":"text-amber-600 dark:text-amber-400",
  "Fluent":        "text-red-600 dark:text-red-400",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function daysUntil(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

export default async function JobDetailPage({ params }: Props) {
  const id = (await params).id;

  const [job, account] = await Promise.all([getJob(id), getLoggedInUser()]);
  if (!job) notFound();

  const business = await getBusiness(job.businessId);

  let isSaved = false;
  if (account) {
    const saved = await checkIsSaved(account.$id, job.$id);
    isSaved = !!saved;
  }

  const isExpired = new Date(job.deadline) < new Date();
  const days = daysUntil(String(job.deadline));
  const typeStyle = JOB_TYPE_STYLES[job.jobType] ?? JOB_TYPE_STYLES["Full-time"];

  // Split requirements into sections (looks for lines starting with common headers)
  const requirementLines = (job.requirements ?? "").split("\n");

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-br from-primary/5 to-background border-b border-border">
        <div className="container mx-auto max-w-[1100px] px-6 py-12">

          {/* Back */}
          <Link href="/jobs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            All Jobs
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Company logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card border border-border shadow-sm shrink-0 overflow-hidden">
              <SafeLogo src={business?.logoUrl} alt={business?.companyName} size={96} fallback="business" />
            </div>

            {/* Title block */}
            <div className="flex-1 space-y-3">
              {/* Company name */}
              {business && (
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Building2 size={13} className="text-primary" />
                  {business.companyName}
                  {business.isApproved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                      <CheckCircle2 size={9} /> Verified
                    </span>
                  )}
                </p>
              )}

              {/* Job title */}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {job.title}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", typeStyle)}>
                  {job.jobType}
                </span>
                {job.allowsStudentVisa && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    <FileBadge size={11} /> Student Visa OK
                  </span>
                )}
                {isExpired ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    Closed
                  </span>
                ) : days <= 14 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 animate-pulse">
                    Closing soon — {days}d left
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  {job.district ?? job.location}
                </span>
                {job.hoursPerWeek && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {job.hoursPerWeek} hrs/week
                  </span>
                )}
                {job.salaryRange && (
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <DollarSign size={14} className="text-primary" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Main ── */}
          <div className="space-y-10 min-w-0">

            {/* About the company */}
            {business && (
              <section className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border overflow-hidden shrink-0">
                    <SafeLogo src={business.logoUrl} alt={business.companyName} size={48} fallback="business" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{business.companyName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border text-[11px] font-medium">
                        {business.industry}
                      </span>
                      <MapPin size={11} /> {business.city}, Taiwan
                    </p>
                  </div>
                  {business.website && (
                    <a href={business.website} target="_blank" rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                      <Globe size={12} /> Website <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                {business.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>
                )}
              </section>
            )}

            {/* Job Description */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Job Description
              </h2>
              <div className="prose-custom space-y-0">
                {requirementLines.map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={i} className="h-3" />;

                  // Section headers (lines ending with nothing after a title-like pattern)
                  if (
                    /^(About|What You|Key Responsibilities|Required|Preferred|Duration|Location|Note|Responsibilities|Qualifications|Benefits|Overview|Target|Selection|Application|Important|Eligible|Coverage|Compensation|Tech|Career|Work|Health|Gaming|Internship|Research|Flexible|Community|Perks|Package|Roles|Open Position|Full|Tier|Renewal|Strict|Award|Priority|Eligible|On\-site|Learning|Growth|Product|Minimum|2026)/.test(trimmed) &&
                    trimmed.length < 60 && !trimmed.startsWith("•") && !trimmed.startsWith("-")
                  ) {
                    return (
                      <p key={i} className="font-bold text-foreground text-[15px] pt-5 pb-1 first:pt-0">
                        {trimmed}
                      </p>
                    );
                  }

                  // Bullet points
                  if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                    return (
                      <div key={i} className="flex items-start gap-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-[14px] text-muted-foreground leading-relaxed">{trimmed.replace(/^[•\-]\s*/, "")}</p>
                      </div>
                    );
                  }

                  // Table-like rows with |
                  if (trimmed.includes("|") && trimmed.startsWith("|")) {
                    const cells = trimmed.split("|").filter(Boolean).map(c => c.trim());
                    if (cells[0] === "---" || cells[0] === "----") return null;
                    return (
                      <div key={i} className="grid grid-cols-2 gap-2 py-1">
                        {cells.map((c, ci) => (
                          <span key={ci} className={cn("text-[13px]", ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                            {c}
                          </span>
                        ))}
                      </div>
                    );
                  }

                  // Normal paragraph
                  return (
                    <p key={i} className="text-[14px] text-muted-foreground leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </section>

            {/* Benefits */}
            {job.benefits && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
                  Benefits & Perks
                </h2>
                <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/40">
                  <div className="space-y-0">
                    {job.benefits.split("\n").map((line, i) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-2" />;
                      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                        return (
                          <div key={i} className="flex items-start gap-2.5 py-0.5">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-[14px] text-foreground leading-relaxed">{trimmed.replace(/^[•\-]\s*/, "")}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={i} className={cn("text-[14px] leading-relaxed",
                          /^[A-Z]/.test(trimmed) && trimmed.length < 50 && !trimmed.endsWith(".")
                            ? "font-bold text-foreground pt-3 pb-1 first:pt-0"
                            : "text-muted-foreground"
                        )}>
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">

            {/* Apply CTA — sticky */}
            <div className="ns-card bg-card p-6 space-y-4 sticky top-24">
              {!isExpired ? (
                <>
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-foreground">{job.salaryRange ?? "Negotiable"}</p>
                    <p className="text-xs text-muted-foreground">{job.jobType} · {job.hoursPerWeek ? `${job.hoursPerWeek} hrs/week` : "Full hours"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 text-center">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      Deadline: {formatDate(String(job.deadline))}
                      {days > 0 && days <= 30 && <span className="ml-1">({days} days left)</span>}
                    </p>
                  </div>

                  <ApplyModal
                    targetId={job.$id}
                    targetType="job"
                    targetName={job.title}
                    studentId={account?.$id}
                  />
                  <SaveButton
                    studentId={account?.$id}
                    itemId={job.$id}
                    itemType="job"
                    initialIsSaved={isSaved}
                    className="w-full justify-center"
                  />
                </>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <CalendarDays size={20} className="text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Applications Closed</p>
                  <p className="text-xs text-muted-foreground">This position closed on {formatDate(String(job.deadline))}</p>
                  <SaveButton
                    studentId={account?.$id}
                    itemId={job.$id}
                    itemType="job"
                    initialIsSaved={isSaved}
                    className="w-full justify-center"
                  />
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Job Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><Briefcase size={13} /> Type</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold border", typeStyle)}>{job.jobType}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><MapPin size={13} /> Location</span>
                  <span className="font-medium text-foreground text-right text-xs">{job.location}</span>
                </div>
                {job.hoursPerWeek && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={13} /> Hours/week</span>
                    <span className="font-medium text-foreground">{job.hoursPerWeek} hrs</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Languages size={13} /> Chinese</span>
                  <span className={cn("font-semibold text-sm", CHINESE_LEVEL_STYLES[job.chineseRequired ?? "None"] ?? "text-foreground")}>
                    {job.chineseRequired ?? "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><FileBadge size={13} /> Student Visa</span>
                  <span className={cn("font-medium", job.allowsStudentVisa ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                    {job.allowsStudentVisa ? "Allowed" : "Not allowed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Company card */}
            {business && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About the Company</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border overflow-hidden shrink-0">
                    <SafeLogo src={business.logoUrl} alt={business.companyName} size={40} fallback="business" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{business.companyName}</p>
                    <p className="text-xs text-muted-foreground">{business.industry}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground border border-border flex items-center gap-1">
                    <MapPin size={9} /> {business.city}
                  </span>
                </div>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <Globe size={11} /> {business.website.replace(/https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>
            )}

            {/* Trust notice */}
            <div className="px-4 py-3 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                This job is verified by UniLink. Any employer requesting payment or deposits is in violation of our policies.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/appwrite/server";
import { School, Program, AdmissionTerm } from "@/types/appwrite.types";
import { getSchoolAdmissionTerms, getSchoolPrograms } from "@/lib/appwrite/queries/public.queries";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { checkIsSaved } from "@/lib/appwrite/queries/student.queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink, MapPin, Building2, CheckCircle2, CalendarDays,
  BookOpen, GraduationCap, Globe, Mail, BedDouble, Star,
  Clock, FileText, DollarSign, Languages, ChevronRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/shared/SaveButton";
import { SafeLogo } from "@/components/shared/SafeLogo";
import { ApplyModal } from "@/components/student/ApplyModal";
import { cn } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

async function getSchool(id: string): Promise<School | null> {
  try {
    const { databases } = await createAdminClient();
    const doc = await databases.getDocument(process.env.APPWRITE_DATABASE_ID!, "Schools", id);
    return doc as unknown as School;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await getSchool((await params).id);
  if (!school) return { title: "School Not Found" };
  return {
    title: `${school.schoolName} | UniLink`,
    description: school.description?.slice(0, 160),
  };
}

const CITY_COLORS: Record<string, string> = {
  Taipei:      "from-blue-500/20 to-cyan-500/10 border-blue-200 dark:border-blue-800",
  Hsinchu:     "from-violet-500/20 to-purple-500/10 border-violet-200 dark:border-violet-800",
  Tainan:      "from-amber-500/20 to-orange-500/10 border-amber-200 dark:border-amber-800",
  Taichung:    "from-emerald-500/20 to-teal-500/10 border-emerald-200 dark:border-emerald-800",
  "New Taipei":"from-slate-500/20 to-slate-400/10 border-slate-200 dark:border-slate-700",
  Kaohsiung:   "from-indigo-500/20 to-blue-500/10 border-indigo-200 dark:border-indigo-800",
};

const DEGREE_COLORS: Record<string, string> = {
  Bachelor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  Master:   "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  PhD:      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};

export default async function SchoolDetailPage({ params }: Props) {
  const id = (await params).id;
  const school = await getSchool(id);
  if (!school) notFound();

  const [terms, programs, account] = await Promise.all([
    getSchoolAdmissionTerms(id),
    getSchoolPrograms(id),
    getLoggedInUser(),
  ]);

  let isSaved = false;
  if (account) {
    const saved = await checkIsSaved(account.$id, school.$id);
    isSaved = !!saved;
  }

  const cityGradient = CITY_COLORS[school.city ?? "Taipei"] ?? CITY_COLORS.Taipei;
  const now = new Date();
  const openTerms = terms.filter(t => now >= new Date(t.applyStartDate) && now <= new Date(t.applyEndDate));

  const degreeGroups = programs.reduce<Record<string, Program[]>>((acc, p) => {
    const key = p.degreeLevel ?? "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className={`w-full bg-gradient-to-br ${cityGradient} border-b`}>
        <div className="container mx-auto max-w-[1100px] px-6 py-12 md:py-16">
          {/* Back */}
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            All Universities
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Logo */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-card border border-border shadow-sm shrink-0 overflow-hidden">
              <SafeLogo src={school.logoUrl} alt={school.schoolName} size={112} fallback="school" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {school.isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle2 size={11} /> Verified Partner
                  </span>
                )}
                {school.ranking && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                    <Star size={11} /> {school.ranking}
                  </span>
                )}
                {openTerms.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    Applications Open
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {school.schoolName}
              </h1>

              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  {school.city}, Taiwan
                </span>
                {school.website && (
                  <a href={school.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Globe size={14} />
                    Official Website
                    <ExternalLink size={11} />
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {school.contactEmail}
                </span>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-sm">
                  <BookOpen size={14} className="text-primary" />
                  <span className="font-semibold text-foreground">{programs.length}</span>
                  <span className="text-muted-foreground">Programs</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-sm">
                  <CalendarDays size={14} className="text-primary" />
                  <span className="font-semibold text-foreground">{terms.length}</span>
                  <span className="text-muted-foreground">Intakes</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-sm">
                  <BedDouble size={14} className="text-primary" />
                  <span className={cn("font-semibold", school.hasDorm ? "text-emerald-600" : "text-muted-foreground")}>
                    {school.hasDorm ? "Dorm Available" : "No Dorm"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-[1100px] px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* ── Main ── */}
          <div className="space-y-12 min-w-0">

            {/* About */}
            {school.description && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                  About {school.schoolName}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{school.description}</p>
              </section>
            )}

            {/* Admission Terms */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Admission Intakes
              </h2>
              {terms.length > 0 ? (
                <div className="space-y-3">
                  {terms.map((term) => {
                    const isOpen = now >= new Date(term.applyStartDate) && now <= new Date(term.applyEndDate);
                    const isFuture = now < new Date(term.applyStartDate);
                    return (
                      <div key={term.$id}
                        className={cn(
                          "p-5 rounded-2xl border transition-colors",
                          isOpen ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800"
                               : "bg-card border-border"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide",
                                isOpen ? "bg-emerald-500 text-white"
                                  : isFuture ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {isOpen ? "Open Now" : isFuture ? "Upcoming" : "Closed"}
                              </span>
                              {term.intakeMonth && (
                                <span className="text-xs text-muted-foreground font-medium">
                                  Intake: {term.intakeMonth}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-foreground">{term.termName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Clock size={12} />
                              {new Date(term.applyStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {" → "}
                              {new Date(term.applyEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        {term.notes && (
                          <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-2.5 border border-border/50">
                            {term.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                  No admission intakes listed yet. Contact the university directly.
                </div>
              )}
            </section>

            {/* Programs */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Academic Programs
                <span className="ml-auto text-sm font-normal text-muted-foreground">{programs.length} programs available</span>
              </h2>

              {programs.length > 0 ? (
                <div className="space-y-6">
                  {(["Bachelor", "Master", "PhD"] as const).map((degree) => {
                    const group = degreeGroups[degree];
                    if (!group?.length) return null;
                    return (
                      <div key={degree}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", DEGREE_COLORS[degree])}>
                            {degree === "Bachelor" ? "Bachelor's" : degree === "PhD" ? "Doctoral (PhD)" : "Master's"}
                          </span>
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{group.length} program{group.length > 1 ? "s" : ""}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {group.map((p) => (
                            <div key={p.$id}
                              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <p className="font-semibold text-foreground text-[15px] leading-snug">{p.departmentName}</p>
                                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    {p.languageInstruction && (
                                      <span className="flex items-center gap-1.5">
                                        <Languages size={13} className="text-primary" />
                                        {p.languageInstruction}
                                      </span>
                                    )}
                                    {p.tuitionFee && (
                                      <span className="flex items-center gap-1.5">
                                        <DollarSign size={13} className="text-primary" />
                                        {p.tuitionFee}
                                      </span>
                                    )}
                                    {p.campusCity && (
                                      <span className="flex items-center gap-1.5">
                                        <MapPin size={13} className="text-primary" />
                                        {p.campusCity}
                                      </span>
                                    )}
                                  </div>
                                  {/* Requirements */}
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {p.minEnglishReq && (
                                      <span className="px-2.5 py-0.5 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                        English: {p.minEnglishReq}
                                      </span>
                                    )}
                                    {p.minChineseReq && (
                                      <span className="px-2.5 py-0.5 rounded-lg text-xs bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                                        Chinese: {p.minChineseReq}
                                      </span>
                                    )}
                                    {p.applicationFee && (
                                      <span className="px-2.5 py-0.5 rounded-lg text-xs bg-muted text-muted-foreground border border-border">
                                        App Fee: {p.applicationFee}
                                      </span>
                                    )}
                                    {p.dormAvailable && (
                                      <span className="px-2.5 py-0.5 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                                        <BedDouble size={10} className="inline mr-1" />Dorm
                                      </span>
                                    )}
                                  </div>
                                  {/* Required Docs */}
                                  {p.requiredDocs && p.requiredDocs.length > 0 && (
                                    <div className="pt-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <FileText size={11} /> Required Documents
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {p.requiredDocs.map((doc) => (
                                          <span key={doc} className="px-2 py-0.5 rounded-md text-[11px] bg-muted text-muted-foreground border border-border/60">
                                            {doc}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {p.programUrl && (
                                  <a
                                    href={p.programUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors"
                                  >
                                    View Program <ExternalLink size={11} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
                  No programs listed yet. Visit the university's website for program information.
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">

            {/* Apply CTA */}
            <div className="ns-card bg-card p-6 space-y-4">
              <h3 className="font-bold text-foreground">Interested in this school?</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{programs.length} programs available</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{school.hasDorm ? "Dormitory available for international students" : "Off-campus accommodation"}</span>
                </div>
                {openTerms.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-emerald-600 font-medium dark:text-emerald-400">{openTerms.length} intake{openTerms.length > 1 ? "s" : ""} currently accepting applications</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                <ApplyModal
                  targetId={school.$id}
                  targetType="school"
                  targetName={school.schoolName}
                  studentId={account?.$id}
                />
                <SaveButton
                  studentId={account?.$id}
                  itemId={school.$id}
                  itemType="school"
                  initialIsSaved={isSaved}
                  className="w-full justify-center"
                />
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><MapPin size={13} /> Location</span>
                  <span className="font-medium text-foreground">{school.city}, Taiwan</span>
                </div>
                {school.ranking && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Star size={13} /> Ranking</span>
                    <span className="font-medium text-foreground text-right text-xs">{school.ranking}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><BedDouble size={13} /> Dormitory</span>
                  <span className={cn("font-medium", school.hasDorm ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                    {school.hasDorm ? "Available" : "Not available"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen size={13} /> Programs</span>
                  <span className="font-medium text-foreground">{programs.length}</span>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1.5 text-xs mb-1.5"><Mail size={12} /> Contact</span>
                  <a href={`mailto:${school.contactEmail}`} className="text-primary hover:underline text-xs break-all">
                    {school.contactEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Website link */}
            {school.website && (
              <a href={school.website} target="_blank" rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Official Website</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, GraduationCap, Briefcase, Banknote,
  Building2, Brain, Globe, Target, Zap, Shield,
  CheckCircle2, Star, Users, Sparkles, TrendingUp,
} from "lucide-react";
import {
  getFeaturedSchools, getFeaturedScholarships,
  getFeaturedJobs, getStats,
} from "@/lib/appwrite/queries/public.queries";
import { getApprovedPosts } from "@/lib/appwrite/queries/community.queries";
import { SchoolCard }       from "@/components/public/SchoolCard";
import { SchoolsSlider }   from "@/components/public/SchoolsSlider";
import { ScholarshipCard }  from "@/components/public/ScholarshipCard";
import { JobCard }          from "@/components/public/JobCard";
import { PostCard }         from "@/components/public/PostCard";
import { ThemeToggle }      from "@/components/shared/ThemeToggle";
import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "UniLink — Study & Work in Taiwan",
  description: "UniLink connects international students with top universities, scholarships, and career opportunities in Taiwan powered by AI.",
};

const PARTNERS = ["NTU", "NCKU", "NYCU", "TSMC", "ASUS", "ACER", "MediaTek", "Foxconn", "NTU", "NCKU", "NYCU", "TSMC", "ASUS", "ACER", "MediaTek", "Foxconn"];

export default async function HomePage() {
  const [schoolsRaw, scholarshipsRaw, jobsRaw, postsRaw, stats] = await Promise.all([
    getFeaturedSchools(6), getFeaturedScholarships(3), getFeaturedJobs(4), getApprovedPosts(3), getStats(),
  ]);

  const schools      = schoolsRaw.map((s) => JSON.parse(JSON.stringify(s)));
  const scholarships = scholarshipsRaw.map((s) => JSON.parse(JSON.stringify(s)));
  const jobsData     = jobsRaw.map((j) => JSON.parse(JSON.stringify(j)));
  const posts        = postsRaw.map((p) => JSON.parse(JSON.stringify(p)));

  const businessIds = Array.from(new Set(jobsData.map((j) => j.businessId)));
  const { databases: adminDb } = await createAdminClient();
  const dbId = process.env.APPWRITE_DATABASE_ID!;

  const bizResp = businessIds.length > 0
    ? await adminDb.listDocuments(dbId, "Businesses", [Query.equal("$id", businessIds)])
    : { documents: [] };

  const bizMap: Record<string, string> = {};
  bizResp.documents.forEach((b: any) => { bizMap[b.$id] = b.companyName; });

  const jobs = jobsData.map((j) => ({
    ...j, companyName: bizMap[j.businessId] || "Strategic Partner",
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-background overflow-hidden">

        {/* Background dot grid */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.4]" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 right-[8%] w-[500px] h-[500px] rounded-full bg-blue-400/12 blur-[100px] animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-400/10 blur-[120px] animate-float-slow pointer-events-none" />
        <div className="absolute top-[10%] left-[20%] w-[250px] h-[250px] rounded-full bg-primary/8 blur-[80px] animate-float-delay pointer-events-none" />

        <div className="container relative z-10 px-6 mx-auto max-w-[1280px] pt-10 pb-20">
          <div className="max-w-[820px] mx-auto text-center space-y-8">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-1"
              style={{ animationFillMode: "both" }}
            >
              <span className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-300/40 bg-emerald-50/80 dark:bg-emerald-900/20 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                AI-Powered Matching is Live
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-600/20 text-[10px] font-bold uppercase tracking-wide">New</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-[76px] font-bold tracking-tight leading-[1.04] text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 stagger-2"
              style={{ animationFillMode: "both" }}
            >
              Your{" "}
              <span className="relative inline-block">
                <span className="nexsas-gradient-text animate-gradient-x">Taiwan journey</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C50 4 100 2 150 2C200 2 250 4 298 9"
                    stroke="url(#underline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {" "}starts here.
            </h1>

            {/* Sub */}
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-3"
              style={{ animationFillMode: "both" }}
            >
              Connect with <strong className="text-foreground">top universities</strong>, secure{" "}
              <strong className="text-foreground">full scholarships</strong>, and land{" "}
              <strong className="text-foreground">career opportunities</strong> in Taiwan — all powered by AI matching.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-4"
              style={{ animationFillMode: "both" }}
            >
              <Link href="/register">
                <Button size="lg" className="btn-primary h-14 px-10 text-base gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                  Get started — it's free
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/schools">
                <Button variant="ghost" size="lg" className="h-14 px-10 text-base rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                  Explore schools →
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm animate-in fade-in duration-1000 stagger-5"
              style={{ animationFillMode: "both" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["bg-blue-400","bg-violet-400","bg-emerald-400","bg-amber-400","bg-rose-400"].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-background ring-0`} />
                  ))}
                </div>
                <span className="text-muted-foreground font-medium">50,000+ students</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-muted-foreground font-medium">4.9 / 5 rating</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-500" /> Official Appwrite Partner
              </span>
            </div>

            {/* Dashboard mockup */}
            <div
              className="relative mx-auto max-w-4xl pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000"
              style={{ animationDelay: "500ms", animationFillMode: "both" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent rounded-[48px] blur-2xl" />
              <div className="relative rounded-[14px] border border-border/60 bg-card shadow-2xl shadow-black/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60 bg-card/80">
                  <div className="flex gap-1.5">
                    {["bg-red-400","bg-amber-400","bg-emerald-400"].map((c,i)=>(
                      <div key={i} className={`w-3 h-3 rounded-full ${c}/70`} />
                    ))}
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-lg bg-muted/60 flex items-center px-3 gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="h-2 w-32 rounded-full bg-muted" />
                  </div>
                </div>
                {/* Dashboard content preview */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-background to-muted/30">
                  {[
                    { label: "AI Match Score", value: "94%", color: "text-primary", sub: "NTU Computer Science" },
                    { label: "Scholarships", value: "12",   color: "text-amber-600", sub: "eligible for you" },
                    { label: "Job Matches",   value: "8",   color: "text-emerald-600", sub: "part-time roles" },
                  ].map((card, i) => (
                    <div key={i} className="ns-card p-4 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="text-[11px] text-muted-foreground">{card.sub}</p>
                    </div>
                  ))}
                  <div className="col-span-3 ns-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">Top Matches</p>
                    <div className="space-y-2">
                      {[
                        { name: "NTU — Computer Science", pct: 94, c: "bg-primary" },
                        { name: "MOE Scholarship 2025", pct: 88, c: "bg-amber-500" },
                        { name: "TSMC Part-time Engineer", pct: 82, c: "bg-emerald-500" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-foreground/80 w-44 truncate">{item.name}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${item.c}`} style={{ width: `${item.pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-foreground">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. MARQUEE PARTNER BAR
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-8 border-y border-border/50 bg-card/50 overflow-hidden">
        <p className="text-center text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground mb-6">
          Trusted by leading universities & companies
        </p>
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
            {PARTNERS.map((p, i) => (
              <span key={i} className="text-xl font-black tracking-tight text-foreground/25 hover:text-foreground/50 transition-colors cursor-default shrink-0">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} /> How it works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Four steps to your{" "}
              <span className="nexsas-gradient-text">Taiwan dream.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {[
              { step: "01", icon: Brain,     title: "AI Profile",        desc: "GPA, language skills & goals analyzed by AI in seconds." },
              { step: "02", icon: Target,    title: "Smart Matching",    desc: "Get ranked recommendations for universities and scholarships." },
              { step: "03", icon: Zap,       title: "Apply in One Click", desc: "Submit your international profile directly to admissions." },
              { step: "04", icon: Briefcase, title: "Career Launchpad",  desc: "Unlock part-time jobs & internships upon arrival." },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-center text-center p-8 rounded-[18px] bg-[#f9fcfe] dark:bg-white/5 border border-[#eff2f6] dark:border-white/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Step number */}
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                    <item.icon size={24} className="text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
                    {i + 1}
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. FOR WHOM — split with AI demo
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-card/30 border-y border-border/50">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <Users size={12} /> Built for everyone
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Every step of your{" "}
                  <span className="nexsas-gradient-text">international journey.</span>
                </h2>
              </div>
              <div className="space-y-5">
                {[
                  { n: "01", title: "Prospective Students", desc: "MOE scholarships, Top 10 admissions, and fast-track visa support.", color: "bg-blue-500" },
                  { n: "02", title: "Current Students",     desc: "Professional part-time roles, program switching, and networking.", color: "bg-violet-500" },
                  { n: "03", title: "Alumni & Global Talent", desc: "Build your high-tech career in Taiwan with Gold Card guidance.", color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-default">
                    <div className={`w-10 h-10 rounded-2xl ${item.color}/10 border border-${item.color.replace("bg-","")}/20 flex items-center justify-center text-xs font-black shrink-0 group-hover:${item.color} group-hover:text-white transition-all duration-300`} style={{color: "inherit"}}>
                      <span className={`text-xs font-black ${item.color.replace("bg-","text-")}`}>{item.n}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register">
                <Button className="btn-primary gap-2 h-12 px-8 shadow-md hover:shadow-lg transition-shadow">
                  Start your journey <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            {/* AI Match card demo */}
            <div className="space-y-4">
              <div className="ns-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">Your AI Match Report</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Based on sample profile</p>
                  </div>
                  <span className="ns-badge-new">Live demo</span>
                </div>
                {[
                  { label: "NTU — Computer Science",   pct: 94, color: "bg-blue-500" },
                  { label: "NCKU — Engineering",        pct: 87, color: "bg-indigo-500" },
                  { label: "NYCU — AI Research",        pct: 82, color: "bg-violet-500" },
                  { label: "MOE Scholarship",           pct: 91, color: "bg-emerald-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                  <CheckCircle2 size={16} />
                  4 strong matches found for your profile
                </div>
              </div>
              {/* Floating mini cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🎓", label: "Scholarship Rate", value: "78%" },
                  { icon: "💼", label: "Job Placement",    value: "92%" },
                ].map((card, i) => (
                  <div key={i} className="ns-card p-4 flex items-center gap-3">
                    <span className="text-2xl">{card.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className="text-xl font-bold text-foreground">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. FEATURED SCHOOLS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <GraduationCap size={12} /> Prestigious institutions
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Top-tier universities.</h2>
            </div>
            <Link href="/schools">
              <Button variant="outline" className="btn-secondary gap-2 rounded-full">
                See all schools <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <SchoolsSlider schools={schools} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. FEATURED SCHOLARSHIPS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-card/30 border-y border-border/50">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-widest">
                <Banknote size={12} /> Financial support
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Generous funding.</h2>
            </div>
            <Link href="/scholarships">
              <Button variant="outline" className="btn-secondary gap-2 rounded-full">
                All scholarships <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scholarships.map((s, i) => (
              <ScholarshipCard
                key={s.$id || i}
                id={s.$id} name={s.name} source={s.source}
                amount={s.amount} deadline={s.deadline}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. FEATURED JOBS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                <Briefcase size={12} /> Career opportunities
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">Latest vacancies.</h2>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="btn-secondary gap-2 rounded-full">
                Jobs in Taiwan <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map((job, i) => (
              <JobCard
                key={job.$id || i}
                id={job.$id} title={job.title} companyName={job.companyName}
                city={job.city} hoursPerWeek={job.hoursPerWeek}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. COMMUNITY POSTS
      ═══════════════════════════════════════════════════════════ */}
      {posts.length > 0 && (
        <section className="py-12 md:py-16 bg-card/30 border-y border-border/50">
          <div className="container px-6 mx-auto max-w-[1280px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-bold uppercase tracking-widest">
                  <Users size={12} /> Real stories
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">From the community.</h2>
                <p className="text-muted-foreground max-w-lg">
                  Tips, experiences, and insights shared by students, universities, and businesses already in Taiwan.
                </p>
              </div>
              <Link href="/community">
                <Button variant="outline" className="btn-secondary gap-2 rounded-full">
                  All stories <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <PostCard key={post.$id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          9. TESTIMONIALS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-widest">
              <Star size={12} className="fill-amber-500 text-amber-500" /> Student reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">What students say.</h2>
            <p className="text-muted-foreground">Real feedback from international students who found their path through UniLink.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Nguyen Minh Tuan",
                country: "🇻🇳 Vietnam",
                program: "Computer Science — NTU",
                avatar: "NM",
                color: "bg-blue-500",
                rating: 5,
                text: "UniLink made the whole application process so much easier. I found NTU's scholarship through the platform and got accepted within 3 months. The AI matching was spot on!",
              },
              {
                name: "Park Ji Yeon",
                country: "🇰🇷 South Korea",
                program: "Business Admin — NCKU",
                avatar: "PJ",
                color: "bg-violet-500",
                rating: 5,
                text: "I was overwhelmed by the number of options in Taiwan. UniLink filtered everything based on my GPA and language level. Found the perfect program and even a part-time job!",
              },
              {
                name: "Ahmad Khalid",
                country: "🇲🇾 Malaysia",
                program: "Electrical Engineering — NYCU",
                avatar: "AK",
                color: "bg-emerald-500",
                rating: 5,
                text: "The scholarship listings are incredibly detailed. I applied for the MOE scholarship directly through UniLink and the whole process was transparent and fast. Highly recommend.",
              },
              {
                name: "Maria Santos",
                country: "🇵🇭 Philippines",
                program: "MBA — NTHU",
                avatar: "MS",
                color: "bg-rose-500",
                rating: 5,
                text: "UniLink's community posts gave me real insight into student life in Taiwan before I even arrived. It felt like I already knew what to expect. The platform is genuinely helpful.",
              },
              {
                name: "Liu Yang",
                country: "🇨🇳 China",
                program: "Data Science — NTNU",
                avatar: "LY",
                color: "bg-amber-500",
                rating: 5,
                text: "I love how the job board is specifically for international students. Found a part-time role at a Taipei startup that works around my class schedule. Couldn't have found it elsewhere.",
              },
              {
                name: "Fatima Al-Hassan",
                country: "🇸🇦 Saudi Arabia",
                program: "Biomedical — CGU",
                avatar: "FA",
                color: "bg-teal-500",
                rating: 5,
                text: "As a student from outside Asia, I was worried about the language barrier. UniLink had everything in English and the support team was incredibly responsive. 10/10 experience.",
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#f9fcfe] dark:bg-white/5 border border-[#eff2f6] dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/20 hover:shadow-sm transition-all">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.country} · {t.program}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. STATS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16 bg-card/30 border-y border-border/50">
        <div className="container px-6 mx-auto max-w-[1280px]">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            {/* Left — heading */}
            <div className="lg:w-72 shrink-0 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <TrendingUp size={12} /> Platform impact
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Trusted by students across <span className="nexsas-gradient-text">30+ countries.</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                UniLink has become the go-to platform for international students pursuing education and careers in Taiwan.
              </p>
              <Link href="/register">
                <Button className="btn-primary gap-2 h-11 px-6 mt-2">
                  Join for free <ArrowRight size={15} />
                </Button>
              </Link>
            </div>

            {/* Right — stat cards */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                {
                  label: "Partner Universities",
                  count: stats.totalSchools,
                  suffix: "+",
                  icon: GraduationCap,
                  color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  desc: "Top institutions in Taiwan",
                },
                {
                  label: "Scholarships",
                  count: stats.totalScholarships,
                  suffix: "+",
                  icon: Banknote,
                  color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  desc: "Full & partial funding",
                },
                {
                  label: "Job Postings",
                  count: stats.totalJobs,
                  suffix: "+",
                  icon: Briefcase,
                  color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  desc: "Student-friendly roles",
                },
                {
                  label: "Strategic Partners",
                  count: 120,
                  suffix: "+",
                  icon: Building2,
                  color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",
                  desc: "Companies & organisations",
                },
              ].map((stat, i) => (
                <div key={i} className="bg-[#f9fcfe] dark:bg-white/5 border border-[#eff2f6] dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground tabular-nums">
                      {stat.count}{stat.suffix}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{stat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. FINAL CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/6 blur-[120px] rounded-full pointer-events-none" />
        <div className="container relative z-10 px-6 mx-auto max-w-[900px] text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Zap size={12} className="fill-primary" /> Start for free today
          </div>
          <h2 className="text-5xl md:text-[72px] font-bold text-foreground leading-[1.04] tracking-tight">
            Shape your future{" "}
            <span className="nexsas-gradient-text animate-gradient-x">in Taiwan.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Join 50,000+ students already using UniLink to study and build careers in Taiwan.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="btn-primary h-14 px-12 text-base gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                Join UniLink — free forever <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="lg" className="h-14 px-12 text-base rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60">
                Read community stories →
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">No credit card · No commitment · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 bg-foreground text-background border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="container relative z-10 px-6 mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="text-xl font-bold text-background">UniLink</span>
              </div>
              <p className="text-background/40 text-sm leading-relaxed">
                The #1 educational and career gateway in Taiwan, powered by AI.
              </p>
            </div>
            {[
              { title: "Platform",   links: [["Universities", "/schools"], ["Scholarships", "/scholarships"], ["Job Board", "/jobs"], ["Community", "/community"]] },
              { title: "Resources",  links: [["Study Guide", "/blog"], ["Visa Procedures", "/visa"], ["About Us", "/about"]] },
              { title: "Network",    links: [["Taipei, Taiwan", "#"], ["Official Appwrite Partner", "#"]] },
            ].map((col) => (
              <div key={col.title} className="space-y-5">
                <h5 className="text-xs font-bold uppercase tracking-widest text-background/30">{col.title}</h5>
                <div className="flex flex-col gap-3.5">
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} className="text-sm text-background/60 hover:text-background transition-colors font-medium">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center text-background/25 text-xs gap-4">
            <span>© 2025 UniLink Global Partners. Built for Taiwan Tech Hub.</span>
            <div className="flex gap-8">
              <span className="text-primary/60">AI Engine v1.0</span>
              <span>UTC+8 Taipei</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Theme toggle */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <ThemeToggle />
      </div>
    </div>
  );
}

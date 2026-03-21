"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { runAIMatching, type MatchPreferences, type MatchResult } from "@/lib/appwrite/actions/ai-matching.actions";
import { SafeLogo } from "@/components/shared/SafeLogo";
import {
  Sparkles, GraduationCap, BookOpen, Briefcase, Globe, ChevronRight,
  CheckCircle2, ArrowRight, Star, MapPin, Trophy, Zap, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "form" | "analyzing" | "results";

interface Question {
  id: keyof MatchPreferences;
  label: string;
  emoji: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}

const QUESTIONS: Question[] = [
  {
    id: "goal",
    label: "What are you looking for?",
    emoji: "🎯",
    options: [
      { value: "school",      label: "University",     icon: <GraduationCap className="w-4 h-4" /> },
      { value: "scholarship", label: "Scholarship",    icon: <BookOpen className="w-4 h-4" /> },
      { value: "job",         label: "Job / Internship", icon: <Briefcase className="w-4 h-4" /> },
      { value: "all",         label: "Everything",     icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    id: "educationLevel",
    label: "Current education level",
    emoji: "🎓",
    options: [
      { value: "high_school", label: "High School" },
      { value: "bachelor",    label: "Bachelor's" },
      { value: "master",      label: "Master's" },
      { value: "phd",         label: "PhD" },
    ],
  },
  {
    id: "targetDegree",
    label: "Degree you want to get",
    emoji: "📜",
    options: [
      { value: "bachelor", label: "Bachelor's" },
      { value: "master",   label: "Master's" },
      { value: "phd",      label: "PhD" },
      { value: "any",      label: "Flexible" },
    ],
  },
  {
    id: "chineseLevel",
    label: "Your Mandarin Chinese level",
    emoji: "🀄",
    options: [
      { value: "none",         label: "None" },
      { value: "beginner",     label: "Beginner (TOCFL A1–A2)" },
      { value: "intermediate", label: "Intermediate (TOCFL B1–B2)" },
      { value: "advanced",     label: "Advanced (TOCFL C1+)" },
    ],
  },
  {
    id: "preferredCity",
    label: "Preferred city in Taiwan",
    emoji: "📍",
    options: [
      { value: "any",       label: "No preference" },
      { value: "Taipei",    label: "Taipei" },
      { value: "Taichung",  label: "Taichung" },
      { value: "Tainan",    label: "Tainan" },
      { value: "Kaohsiung", label: "Kaohsiung" },
    ],
  },
  {
    id: "budget",
    label: "Financial support needed",
    emoji: "💰",
    options: [
      { value: "self_funded", label: "Self-funded" },
      { value: "partial",     label: "Partial scholarship" },
      { value: "full",        label: "Full scholarship" },
    ],
  },
];

const INITIAL: MatchPreferences = {
  goal: "all",
  educationLevel: "bachelor",
  chineseLevel: "none",
  preferredCity: "any",
  budget: "partial",
  targetDegree: "master",
};

// ── Analyzing messages cycle ───────────────────────────────────────────────────
const ANALYZING_STEPS = [
  { text: "Reading your profile…",       pct: 8 },
  { text: "Scanning 120+ universities…", pct: 22 },
  { text: "Evaluating scholarships…",    pct: 38 },
  { text: "Checking job compatibility…", pct: 52 },
  { text: "Running AI scoring engine…",  pct: 67 },
  { text: "Weighing match factors…",     pct: 80 },
  { text: "Ranking results…",            pct: 91 },
  { text: "Almost done…",               pct: 97 },
];

// ── Score ring colour ──────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 85) return "text-emerald-600";
  if (s >= 70) return "text-blue-600";
  if (s >= 55) return "text-amber-600";
  return "text-rose-500";
}
function scoreRingColor(s: number) {
  if (s >= 85) return "stroke-emerald-500";
  if (s >= 70) return "stroke-blue-500";
  if (s >= 55) return "stroke-amber-500";
  return "stroke-rose-500";
}
function scoreBg(s: number) {
  if (s >= 85) return "bg-emerald-50 border-emerald-200";
  if (s >= 70) return "bg-blue-50 border-blue-200";
  if (s >= 55) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

function ScoreRing({ score }: { score: number }) {
  const r = 20, circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className={cn("transition-all duration-1000", scoreRingColor(score))}
        />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center text-xs font-black", scoreColor(score))}>
        {score}%
      </span>
    </div>
  );
}

const TYPE_META = {
  school:      { label: "University",     icon: GraduationCap, accent: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
  scholarship: { label: "Scholarship",    icon: BookOpen,      accent: "bg-violet-500/10 text-violet-600 border-violet-200" },
  job:         { label: "Job",            icon: Briefcase,     accent: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
};

// ── Main Component ─────────────────────────────────────────────────────────────
export function AIMatchingClient() {
  const [step, setStep] = useState<Step>("form");
  const [prefs, setPrefs] = useState<MatchPreferences>(INITIAL);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [stats, setStats] = useState<{ schoolsScanned: number; scholarshipsScanned: number; jobsScanned: number } | null>(null);
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const matchingRef = useRef<ReturnType<typeof runAIMatching> | null>(null);

  // Animate the analyzing screen
  useEffect(() => {
    if (step !== "analyzing") return;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setAnalyzeIdx(Math.min(idx, ANALYZING_STEPS.length - 1));
      setProgress(ANALYZING_STEPS[Math.min(idx, ANALYZING_STEPS.length - 1)].pct);
      if (idx >= ANALYZING_STEPS.length) clearInterval(interval);
    }, 430);
    return () => clearInterval(interval);
  }, [step]);

  const handleStart = async () => {
    setStep("analyzing");
    setError(null);
    setAnalyzeIdx(0);
    setProgress(0);

    // Run matching in parallel with animation (min 3.5s for drama)
    const [res] = await Promise.all([
      runAIMatching(prefs),
      new Promise(r => setTimeout(r, 3600)),
    ]);

    if (!res.success || !res.results) {
      setError(res.error ?? "Something went wrong.");
      setStep("form");
      return;
    }

    setResults(res.results);
    setStats(res.stats ?? null);
    setStep("results");
  };

  // ── FORM ──────────────────────────────────────────────────────────────────
  if (step === "form") {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-16">

          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI-Powered Matching</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              Find your<br /><span className="text-primary">perfect match</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Answer 6 quick questions — our AI scans every university, scholarship, and job in Taiwan and shows you the top matches with a compatibility score.
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {QUESTIONS.map((q, qi) => (
              <div key={q.id} className="ns-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{q.emoji}</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Question {qi + 1} / {QUESTIONS.length}
                    </span>
                    <p className="font-bold text-foreground">{q.label}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.options.map(opt => {
                    const isSelected = (prefs[q.id] as string) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPrefs(p => ({ ...p, [q.id]: opt.value }))}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
                            : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 text-center">
              {error}
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleStart}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-white font-black text-lg hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-xl shadow-primary/30"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Start AI Matching
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground/50 mt-4 font-medium">
            Takes about 3–4 seconds · No sign-up required
          </p>
        </div>
      </div>
    );
  }

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (step === "analyzing") {
    const current = ANALYZING_STEPS[analyzeIdx];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30 animate-ping"
              style={{
                left: `${(i * 37 + 10) % 100}%`,
                top: `${(i * 53 + 15) % 100}%`,
                animationDelay: `${(i * 0.3) % 2}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full text-center">
          {/* Spinning AI orb */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="absolute inset-2 rounded-full bg-primary/15 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-4 rounded-full bg-primary/20 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
            <div className="absolute inset-0 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter">AI Matching</h2>
            <p className="text-muted-foreground font-medium">Analyzing your profile across our entire database</p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="animate-pulse">{current.text}</span>
              <span className="text-primary">{progress}%</span>
            </div>
          </div>

          {/* Scanning items */}
          <div className="w-full space-y-2">
            {[
              { label: "Universities", icon: GraduationCap, color: "text-indigo-500" },
              { label: "Scholarships", icon: BookOpen,      color: "text-violet-500" },
              { label: "Career Paths", icon: Briefcase,     color: "text-emerald-500" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                <span className="text-sm font-semibold text-foreground flex-1 text-left">{item.label}</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${(i * 0.2 + j * 0.1)}s` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/50 font-medium">
            Powered by UniLink AI · Processing thousands of data points
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  const top3 = results.slice(0, 3);
  const rest = results.slice(3);
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.matchScore, 0) / results.length) : 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero result header */}
        <div className="py-14 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Matching Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
            Found <span className="text-primary">{results.length} matches</span><br />just for you
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg mx-auto">
            Based on your profile — average compatibility score <span className="font-bold text-foreground">{avgScore}%</span>
          </p>

          {/* Stats */}
          {stats && (
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-muted/40 border border-border/60 text-sm font-semibold text-muted-foreground divide-x divide-border/60">
              {stats.schoolsScanned > 0      && <span className="pr-6">{stats.schoolsScanned} universities scanned</span>}
              {stats.scholarshipsScanned > 0 && <span className="px-6">{stats.scholarshipsScanned} scholarships scanned</span>}
              {stats.jobsScanned > 0         && <span className="pl-6">{stats.jobsScanned} jobs scanned</span>}
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-black uppercase tracking-widest text-sm">Top Matches</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {top3.map((r, i) => {
                const meta = TYPE_META[r.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "ns-card p-5 flex flex-col gap-4 relative overflow-hidden",
                      i === 0 && "ring-2 ring-primary/30"
                    )}
                  >
                    {/* Best match badge */}
                    {i === 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-black">
                        <Star className="w-3 h-3" /> Best Match
                      </div>
                    )}

                    {/* Rank */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-muted-foreground/20">#{i + 1}</span>
                      <ScoreRing score={r.matchScore} />
                    </div>

                    {/* Logo + info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center shrink-0">
                        <SafeLogo src={r.logoUrl} alt={r.name} size={40} fallback={r.type === "school" ? "school" : "business"} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground leading-snug line-clamp-2 text-sm">{r.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", meta.accent)}>
                            {meta.label}
                          </span>
                          {r.city && (
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />{r.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match reasons */}
                    <ul className="space-y-1">
                      {r.matchReasons.map(reason => (
                        <li key={reason} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3 text-primary shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={r.href}
                      className="mt-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      View details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rest of results — list style */}
        {rest.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-black uppercase tracking-widest text-sm">More Matches</span>
            </div>
            <div className="space-y-3">
              {rest.map(r => {
                const meta = TYPE_META[r.type];
                const Icon = meta.icon;
                return (
                  <div key={r.id} className={cn("ns-card p-4 flex items-center gap-4", scoreBg(r.matchScore))}>
                    {/* Score */}
                    <ScoreRing score={r.matchScore} />

                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl border border-border bg-background overflow-hidden shrink-0">
                      <SafeLogo src={r.logoUrl} alt={r.name} size={40} fallback={r.type === "school" ? "school" : "business"} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground leading-snug line-clamp-1 text-sm">{r.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", meta.accent)}>
                          {meta.label}
                        </span>
                        {r.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />{r.city}
                          </span>
                        )}
                        {r.matchReasons[0] && (
                          <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-0.5">
                            <Zap className="w-3 h-3 text-primary" />{r.matchReasons[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={r.href}
                      className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {results.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <p className="text-4xl">🤔</p>
            <p className="text-lg font-bold">No strong matches found</p>
            <p className="text-muted-foreground">Try adjusting your preferences — broader city or lower Chinese requirement.</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => { setStep("form"); setResults([]); }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Refine preferences
          </button>
          <Link
            href="/schools"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Browse all schools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

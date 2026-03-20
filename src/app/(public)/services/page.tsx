import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, Plane, Home, Languages, HeartPulse, Briefcase,
  GraduationCap, ShieldCheck, ArrowRight, Sparkles, Star,
  CheckCircle2, Clock, Phone, MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services – UniLink",
  description: "Professional support services for international students in Taiwan. From visa to housing, we've got you covered.",
};

const SERVICES = [
  {
    icon: FileText,
    title: "Admission Consulting",
    tag: "Most Popular",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    accent: "from-blue-500 to-indigo-500",
    price: "From $49",
    desc: "End-to-end university application support. Personal statement review, document checklist, submission tracking, and offer negotiation.",
    features: ["University shortlisting", "Document review", "Personal statement editing", "Application tracking"],
  },
  {
    icon: FileText,
    title: "Visa & Immigration",
    tag: "Essential",
    tagColor: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    accent: "from-violet-500 to-purple-500",
    price: "From $39",
    desc: "Student visa application guidance for Taiwan (ARC, student visa extension). We prepare your documents and coach you for the interview.",
    features: ["Visa document prep", "ARC registration support", "Extension assistance", "1-on-1 consultation"],
  },
  {
    icon: Home,
    title: "Housing Placement",
    tag: "New",
    tagColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accent: "from-emerald-500 to-teal-500",
    price: "From $29",
    desc: "Find verified, student-safe housing near your university. We negotiate rent, handle contracts, and coordinate move-in for you.",
    features: ["Verified landlords", "Contract review", "Rent negotiation", "Move-in coordination"],
  },
  {
    icon: Languages,
    title: "Language Courses",
    tag: "Online & Offline",
    tagColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    accent: "from-amber-500 to-orange-500",
    price: "From $19/mo",
    desc: "Mandarin Chinese courses tailored for students — survival Chinese, academic reading, and HSK exam prep with certified tutors.",
    features: ["Survival Mandarin", "Academic reading", "HSK 1–6 prep", "Live + recorded lessons"],
  },
  {
    icon: Plane,
    title: "Airport & Arrival",
    tag: "One-time",
    tagColor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    accent: "from-sky-500 to-blue-500",
    price: "$19",
    desc: "Stress-free arrival in Taiwan. Our team picks you up, helps with SIM card & bank account setup, and orients you to campus life.",
    features: ["Airport pickup", "SIM card setup", "Bank account guide", "Campus orientation"],
  },
  {
    icon: HeartPulse,
    title: "Health & Insurance",
    tag: "Required",
    tagColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    accent: "from-rose-500 to-pink-500",
    price: "From $9/mo",
    desc: "NHI enrollment support, private top-up insurance, and hospital accompaniment service for international students.",
    features: ["NHI enrollment", "Private insurance", "Hospital accompaniment", "24/7 emergency line"],
  },
  {
    icon: Briefcase,
    title: "Career & Internship",
    tag: "Premium",
    tagColor: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    accent: "from-indigo-500 to-violet-500",
    price: "From $59",
    desc: "Resume crafting, LinkedIn optimization, mock interviews, and direct referrals to our partner companies in Taiwan.",
    features: ["Resume & LinkedIn", "Mock interviews", "Partner referrals", "Work permit guidance"],
  },
  {
    icon: GraduationCap,
    title: "Scholarship Coaching",
    tag: "High ROI",
    tagColor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    accent: "from-teal-500 to-emerald-500",
    price: "From $39",
    desc: "We identify the best scholarships for your profile, write compelling essays, and submit applications on your behalf.",
    features: ["Profile matching", "Essay writing", "Multi-scholarship apply", "Interview prep"],
  },
];

const PROCESS = [
  { step: "01", title: "Book a Free Call", desc: "15-minute discovery call to understand your goals and recommend the right services." },
  { step: "02", title: "Get Your Plan", desc: "We create a personalised roadmap with timelines, documents needed, and expected outcomes." },
  { step: "03", title: "We Handle It", desc: "Your dedicated advisor manages the entire process, keeping you updated at every step." },
  { step: "04", title: "You Arrive Ready", desc: "Touch down in Taiwan with university admission, housing, visa, and everything set up." },
];

const STATS = [
  { value: "2,400+", label: "Students placed" },
  { value: "96%", label: "Visa approval rate" },
  { value: "48h", label: "Average response time" },
  { value: "4.9★", label: "Average rating" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero ── */}
        <div className="py-20 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Premium Support</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-none">
            Everything you need,<br />
            <span className="text-primary">handled for you</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-medium">
            From the moment you apply to your first day on campus — our expert advisors take care of every detail so you can focus on your future.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link href="/register" className="btn-primary inline-flex items-center gap-2">
              Book a free call <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/community" className="btn-secondary inline-flex items-center gap-2">
              Read student stories
            </Link>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(s => (
            <div key={s.label} className="ns-card p-6 text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Services grid ── */}
        <div className="mb-20">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Pick what you need — or bundle everything for the best value.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <div key={svc.title} className="ns-card flex flex-col overflow-hidden group">
                  {/* Accent bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${svc.accent}`} />
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 bg-gradient-to-br ${svc.accent} bg-opacity-10`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${svc.tagColor}`}>
                        {svc.tag}
                      </span>
                    </div>

                    {/* Title + price */}
                    <div>
                      <h3 className="font-bold text-foreground leading-snug">{svc.title}</h3>
                      <p className="text-sm font-bold text-primary mt-0.5">{svc.price}</p>
                    </div>

                    {/* Desc */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">{svc.desc}</p>

                    {/* Features */}
                    <ul className="space-y-1.5">
                      {svc.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href="/register"
                      className="mt-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      Get started <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="mb-20">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four simple steps from inquiry to arrival.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="ns-card p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-primary/20">{p.step}</span>
                  {i < PROCESS.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-border" />
                  )}
                </div>
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div className="ns-card p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-primary/5 to-indigo-500/5 border-primary/10">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Free First Consultation</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Ready to start your Taiwan journey?</h2>
            <p className="text-muted-foreground max-w-md">Talk to an advisor today — no commitment, no cost. We'll map out the best path for your situation.</p>
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start pt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" /> Response within 48h
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500" /> 4.9/5 from 2,400+ students
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">
              <Phone className="w-4 h-4" /> Book free call
            </Link>
            <Link href="/community" className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap">
              <MessageCircle className="w-4 h-4" /> Ask community
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

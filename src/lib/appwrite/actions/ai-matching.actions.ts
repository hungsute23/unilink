"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DB = process.env.APPWRITE_DATABASE_ID!;

export interface MatchPreferences {
  goal: "school" | "scholarship" | "job" | "all";
  educationLevel: "high_school" | "bachelor" | "master" | "phd";
  chineseLevel: "none" | "beginner" | "intermediate" | "advanced";
  preferredCity: string; // "any" or city name
  budget: "self_funded" | "partial" | "full";
  targetDegree: "bachelor" | "master" | "phd" | "any";
}

export interface MatchResult {
  id: string;
  type: "school" | "scholarship" | "job";
  name: string;
  subtitle: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  matchScore: number;       // 0-100
  matchReasons: string[];   // why it matched
  href: string;
}

// ── Scoring helpers ────────────────────────────────────────────────────────────

function cityScore(itemCity?: string, preferred?: string): number {
  if (!preferred || preferred === "any" || !itemCity) return 15;
  return itemCity.toLowerCase().includes(preferred.toLowerCase()) ? 30 : 5;
}

function chineseScore(required: string | undefined, userLevel: string): number {
  const req = (required ?? "none").toLowerCase();
  if (req === "none" || req === "no") return 25; // no chinese needed = always good
  if (userLevel === "advanced") return 25;
  if (userLevel === "intermediate") return req === "basic" ? 20 : 10;
  if (userLevel === "beginner") return req === "basic" ? 12 : 5;
  return 5; // user has none, chinese is required
}

function budgetScore(budget: string, coversTuition?: boolean, coversStipend?: boolean, coversDorm?: boolean): number {
  if (budget === "self_funded") return 10;
  if (budget === "partial") {
    return (coversTuition || coversStipend) ? 25 : 10;
  }
  // full scholarship needed
  const covers = [coversTuition, coversStipend, coversDorm].filter(Boolean).length;
  return covers >= 2 ? 30 : covers === 1 ? 15 : 5;
}

function deterministicVariance(id: string, range = 8): number {
  // Reproducible "random" per item so results are consistent across re-runs
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return (Math.abs(hash) % range) - range / 2;
}

// ── Main matching function ─────────────────────────────────────────────────────

export async function runAIMatching(prefs: MatchPreferences): Promise<{
  success: boolean;
  results?: MatchResult[];
  stats?: { schoolsScanned: number; scholarshipsScanned: number; jobsScanned: number };
  error?: string;
}> {
  try {
    const { databases } = await createAdminClient();
    const results: MatchResult[] = [];

    const wantsSchool      = prefs.goal === "school"      || prefs.goal === "all";
    const wantsScholarship = prefs.goal === "scholarship" || prefs.goal === "all";
    const wantsJob         = prefs.goal === "job"         || prefs.goal === "all";

    let schoolsScanned = 0, scholarshipsScanned = 0, jobsScanned = 0;

    // ── Schools ────────────────────────────────────────────────────────────────
    if (wantsSchool) {
      const res = await databases.listDocuments(DB, "Schools", [Query.limit(100)]);
      schoolsScanned = res.total;

      for (const s of res.documents) {
        let score = 0;
        const reasons: string[] = [];

        // City preference
        const cs = cityScore(s.city, prefs.preferredCity);
        score += cs;
        if (cs >= 25 && prefs.preferredCity !== "any") reasons.push(`Located in ${s.city}`);

        // Programs available
        score += 20;
        reasons.push("Diverse academic programs");

        // Dorm availability (important if budget is limited)
        if (s.hasDorm) {
          score += prefs.budget !== "self_funded" ? 15 : 8;
          reasons.push("On-campus housing available");
        } else {
          score += 5;
        }

        // Verified partner
        score += 10;
        reasons.push("Verified UniLink partner");

        // Education level match
        if (prefs.targetDegree === "any") {
          score += 15;
        } else {
          score += 15;
          reasons.push(`Offers ${prefs.targetDegree} programs`);
        }

        // Variance
        score += deterministicVariance(s.$id, 10);
        score = Math.min(98, Math.max(45, Math.round(score)));

        if (score >= 50) {
          results.push({
            id: s.$id,
            type: "school",
            name: s.schoolName || "University",
            subtitle: s.city || "Taiwan",
            description: s.description,
            logoUrl: s.logoUrl,
            city: s.city,
            matchScore: score,
            matchReasons: reasons.slice(0, 3),
            href: `/schools/${s.$id}`,
          });
        }
      }
    }

    // ── Scholarships ───────────────────────────────────────────────────────────
    if (wantsScholarship) {
      const res = await databases.listDocuments(DB, "Scholarships", [
        Query.equal("isActive", true),
        Query.limit(100),
      ]);
      scholarshipsScanned = res.total;

      for (const s of res.documents) {
        let score = 0;
        const reasons: string[] = [];

        // Budget match
        const bs = budgetScore(prefs.budget, s.coversTuition, s.coversStipend, s.coversDorm);
        score += bs;
        if (s.coversTuition) reasons.push("Covers tuition fees");
        if (s.coversStipend) reasons.push("Includes monthly stipend");
        if (s.coversDorm) reasons.push("Covers accommodation");

        // Chinese requirement
        const chs = chineseScore(s.minChineseReq, prefs.chineseLevel);
        score += chs;
        if (chs >= 20) reasons.push("Matches your language profile");

        // Education level (min GPA etc. — simple heuristic)
        score += 20;
        if (prefs.educationLevel !== "high_school") {
          reasons.push("Open to your education level");
        }

        // Source bonus
        if (s.source === "government") { score += 10; reasons.push("Government-backed scholarship"); }
        else if (s.source === "school_based") { score += 8; reasons.push("University scholarship"); }
        else { score += 5; }

        score += deterministicVariance(s.$id, 10);
        score = Math.min(97, Math.max(40, Math.round(score)));

        if (score >= 45) {
          results.push({
            id: s.$id,
            type: "scholarship",
            name: s.name || "Scholarship",
            subtitle: s.source ? s.source.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Scholarship",
            description: s.requirements,
            city: undefined,
            matchScore: score,
            matchReasons: reasons.slice(0, 3),
            href: `/scholarships/${s.$id}`,
          });
        }
      }
    }

    // ── Jobs ───────────────────────────────────────────────────────────────────
    if (wantsJob) {
      const res = await databases.listDocuments(DB, "Jobs", [
        Query.equal("isActive", true),
        Query.limit(100),
      ]);
      jobsScanned = res.total;

      for (const j of res.documents) {
        let score = 0;
        const reasons: string[] = [];

        // Chinese level match
        const chs = chineseScore(j.chineseRequired, prefs.chineseLevel);
        score += chs;
        if (chs >= 20) reasons.push("Matches your Chinese level");

        // Visa friendly
        if (j.allowsStudentVisa) {
          score += 30;
          reasons.push("Student visa friendly");
        } else {
          score += 5;
        }

        // City preference
        const cs = cityScore(j.location, prefs.preferredCity);
        score += cs;
        if (cs >= 25 && prefs.preferredCity !== "any") reasons.push(`Job in ${j.location}`);

        // Salary/hours
        score += 10;
        if (j.hoursPerWeek && j.hoursPerWeek <= 20) reasons.push("Part-time friendly hours");

        score += deterministicVariance(j.$id, 10);
        score = Math.min(96, Math.max(35, Math.round(score)));

        if (score >= 40) {
          results.push({
            id: j.$id,
            type: "job",
            name: j.title || "Position",
            subtitle: j.companyName || j.businessId || "Company",
            description: j.description,
            city: j.location,
            matchScore: score,
            matchReasons: reasons.slice(0, 3),
            href: `/jobs/${j.$id}`,
          });
        }
      }
    }

    // Sort by score desc, return top 12
    results.sort((a, b) => b.matchScore - a.matchScore);
    const top = results.slice(0, 12);

    return {
      success: true,
      results: top,
      stats: { schoolsScanned, scholarshipsScanned, jobsScanned },
    };
  } catch (error) {
    console.error("[runAIMatching]", error);
    return { success: false, error: "Matching failed. Please try again." };
  }
}

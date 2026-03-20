/**
 * scripts/setup-database.ts
 *
 * Bootstrap the complete Appwrite database schema for UniLink EdTech Portal.
 * Optimized for: Scholarship hunting, Taiwan study abroad, Part-time/Full-time jobs.
 *
 * Run with: npm run db:setup
 *
 * IDEMPOTENT — safe to re-run. Existing collections/attributes are skipped (409 ignored).
 *
 * Environment variables required (in .env):
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 *   APPWRITE_DATABASE_ID
 */

import "dotenv/config";
import { Client, Databases, Permission, Role } from "node-appwrite";

// ─── Client ───────────────────────────────────────────────────────────────────

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey    = process.env.APPWRITE_API_KEY!;
const DB        = process.env.APPWRITE_DATABASE_ID!;

if (!endpoint || !projectId || !apiKey || !DB) {
  console.error("❌  Missing required environment variables. Aborting.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new Databases(client);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms = 1500) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type AppwriteError = { code?: number; message?: string };

async function safe(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    console.log(`    + ${label}`);
  } catch (err) {
    const e = err as AppwriteError;
    if (e?.code === 409) {
      console.log(`    ~ ${label} (exists — skipped)`);
    } else {
      throw err;
    }
  }
}

// Shorthand helpers
async function col(id: string, name: string, perms: string[]) {
  console.log(`\n📦  ${name}`);
  await safe(`Collection "${name}"`, () =>
    db.createCollection(DB, id, name, perms)
  );
}

async function str(c: string, k: string, size: number, req: boolean, def?: string, arr = false) {
  await delay();
  await safe(`[str] ${k}`, () => db.createStringAttribute(DB, c, k, size, req, def, arr));
}

async function bool(c: string, k: string, req: boolean, def?: boolean) {
  await delay();
  await safe(`[bool] ${k}`, () => db.createBooleanAttribute(DB, c, k, req, def));
}

async function dt(c: string, k: string, req: boolean) {
  await delay();
  await safe(`[datetime] ${k}`, () => db.createDatetimeAttribute(DB, c, k, req));
}

async function int(c: string, k: string, req: boolean, min?: number, max?: number, def?: number) {
  await delay();
  await safe(`[int] ${k}`, () => db.createIntegerAttribute(DB, c, k, req, min, max, def));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀  UniLink – Appwrite DB Bootstrapper (Taiwan Edition)");
  console.log(`   Endpoint : ${endpoint}`);
  console.log(`   Project  : ${projectId}`);
  console.log(`   Database : ${DB}`);
  console.log("─".repeat(56));

  try {

    // ══════════════════════════════════════════════════════════
    // A. SYSTEM_CONFIGS  (unchanged)
    // ══════════════════════════════════════════════════════════
    await col("System_Configs", "System_Configs", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ]);
    await str("System_Configs", "key",   255,  true);
    await str("System_Configs", "value", 5000, true);

    // ══════════════════════════════════════════════════════════
    // B. STUDENTS  (+gpa, +targetDegree, +hasPassport,
    //               +workPermitStatus, +dateOfBirth, +targetCity)
    // ══════════════════════════════════════════════════════════
    await col("Students", "Students", [
      Permission.create(Role.users()),
      Permission.read(Role.user("owner")),
      Permission.read(Role.team("admin")),
      Permission.update(Role.user("owner")),
      Permission.update(Role.team("admin")),
    ]);
    await str("Students", "accountId",        36,   true);
    await str("Students", "fullName",         255,  true);
    await str("Students", "avatarUrl",        2048, false);
    await str("Students", "nationality",      100,  false);
    await str("Students", "highestEducation", 100,  false);
    await str("Students", "englishLevel",     100,  false); // e.g. "IELTS 6.0"
    await str("Students", "chineseLevel",     100,  false); // e.g. "TOCFL Band B"
    await str("Students", "skills",           100,  false, undefined, true); // array
    // ── NEW ──────────────────────────────────────────────────
    await dt  ("Students", "dateOfBirth",         false);             // age check for scholarships
    await str ("Students", "gpa",                 10,   false);       // e.g. "3.8/4.0"
    await str ("Students", "targetDegree",        50,   false);       // Bachelor/Master/PhD
    await str ("Students", "targetCityTaiwan",    100,  false);       // Taipei, Taichung...
    await bool ("Students", "hasPassport",         false);
    await str ("Students", "workPermitStatus",    50,   false, "none"); // none/applied/approved
    await str ("Students", "vietnameseId",        20,   false);       // CCCD

    // ══════════════════════════════════════════════════════════
    // C1. SCHOOLS  (unchanged)
    // ══════════════════════════════════════════════════════════
    await col("Schools", "Schools", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("school")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("school")),
      Permission.delete(Role.team("admin")),
      Permission.delete(Role.team("school")),
    ]);
    await str("Schools", "ownerId",       36,   true);
    await str("Schools", "schoolName",    255,  true);
    await str("Schools", "website",       2048, false);
    await str("Schools", "contactEmail",  255,  true);
    await str("Schools", "description",   5000, false);
    // ── NEW ──────────────────────────────────────────────────
    await str ("Schools", "city",         100,  false); // Taipei, Taichung, Tainan...
    await str ("Schools", "logoUrl",      2048, false);
    await str ("Schools", "ranking",      50,   false); // e.g. "QS Top 500"
    await bool("Schools", "hasDorm",            false);

    // ══════════════════════════════════════════════════════════
    // C2. ADMISSION_TERMS  (unchanged)
    // ══════════════════════════════════════════════════════════
    await col("Admission_Terms", "Admission_Terms", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("school")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("school")),
      Permission.delete(Role.team("admin")),
      Permission.delete(Role.team("school")),
    ]);
    await str("Admission_Terms", "schoolId",       36,  true);
    await str("Admission_Terms", "termName",       255, true);
    await dt ("Admission_Terms", "applyStartDate",      true);
    await dt ("Admission_Terms", "applyEndDate",        true);
    // ── NEW ──────────────────────────────────────────────────
    await str("Admission_Terms", "intakeMonth",    50,  false); // "September 2026"
    await str("Admission_Terms", "notes",          1000, false);

    // ══════════════════════════════════════════════════════════
    // C3. PROGRAMS  (+campusCity, +dormAvailable, +applicationFee,
    //                +scholarshipIds, +intakeMonth)
    // ══════════════════════════════════════════════════════════
    await col("Programs", "Programs", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("school")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("school")),
      Permission.delete(Role.team("admin")),
      Permission.delete(Role.team("school")),
    ]);
    await str ("Programs", "termId",              36,   true);
    await str ("Programs", "departmentName",      255,  true);
    await str ("Programs", "degreeLevel",         50,   true);   // Bachelor/Master/PhD
    await str ("Programs", "languageInstruction", 50,   true);   // English/Chinese
    await str ("Programs", "tuitionFee",          100,  false);
    await str ("Programs", "minEnglishReq",       100,  false);
    await str ("Programs", "minChineseReq",       100,  false);
    await str ("Programs", "requiredDocs",        255,  false, undefined, true); // array
    // ── NEW ──────────────────────────────────────────────────
    await str ("Programs", "campusCity",          100,  false); // Taipei / Kaohsiung...
    await bool("Programs", "dormAvailable",             false);
    await str ("Programs", "applicationFee",      50,   false); // "2,000 NTD"
    await str ("Programs", "scholarshipIds",      36,   false, undefined, true); // FK[] → Scholarships
    await str ("Programs", "programUrl",          2048, false); // Direct link to program page

    // ══════════════════════════════════════════════════════════
    // C4. SCHOLARSHIPS  ← NEW COLLECTION
    // ══════════════════════════════════════════════════════════
    await col("Scholarships", "Scholarships", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("school")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("school")),
      Permission.delete(Role.team("admin")),
    ]);
    await str ("Scholarships", "name",            255,  true);
    // source: "MOE_Taiwan" | "ICDF" | "school_based" | "private" | "government"
    await str ("Scholarships", "source",          50,   true);
    await str ("Scholarships", "schoolId",        36,   false); // null = government-wide scholarship
    await str ("Scholarships", "amount",          100,  false); // "15,000 NTD/month"
    await str ("Scholarships", "duration",        100,  false); // "4 years" / "2 semesters"
    await bool("Scholarships", "coversTuition",         false, false);
    await bool("Scholarships", "coversDorm",            false, false);
    await bool("Scholarships", "coversStipend",         false, false);
    await str ("Scholarships", "minGpa",          10,   false); // "3.0 / 4.0"
    await str ("Scholarships", "minEnglishReq",   100,  false);
    await str ("Scholarships", "minChineseReq",   100,  false);
    await str ("Scholarships", "eligibleDegrees", 50,   false, undefined, true); // ["Bachelor","Master"]
    await str ("Scholarships", "eligibleCountries",100, false, undefined, true); // ["Vietnam","Indonesia"]
    await str ("Scholarships", "requirements",    5000, false); // detailed conditions
    await dt  ("Scholarships", "deadline",              true);
    await str ("Scholarships", "applicationUrl",  2048, false);
    await bool("Scholarships", "isActive",              false, true);

    // ══════════════════════════════════════════════════════════
    // D1. BUSINESSES  (unchanged)
    // ══════════════════════════════════════════════════════════
    await col("Businesses", "Businesses", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("business")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("business")),
      Permission.delete(Role.team("admin")),
      Permission.delete(Role.team("business")),
    ]);
    await str("Businesses", "ownerId",     36,   true);
    await str("Businesses", "companyName", 255,  true);
    await str("Businesses", "industry",    100,  true);
    await str("Businesses", "website",     2048, false);
    await str("Businesses", "description", 5000, false);
    // ── NEW ──────────────────────────────────────────────────
    await str ("Businesses", "city",       100,  false); // Taipei, Taichung...
    await str ("Businesses", "logoUrl",    2048, false);

    // ══════════════════════════════════════════════════════════
    // D2. JOBS  (+hoursPerWeek, +allowsStudentVisa, +chineseRequired, +district)
    // ══════════════════════════════════════════════════════════
    await col("Jobs", "Jobs", [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.create(Role.team("business")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("business")),
      Permission.delete(Role.team("admin")),
      Permission.delete(Role.team("business")),
    ]);
    await str ("Jobs", "businessId",         36,   true);
    await str ("Jobs", "title",              255,  true);
    await str ("Jobs", "jobType",            50,   true);  // Full-time/Part-time/Internship
    await str ("Jobs", "salaryRange",        100,  false);
    await str ("Jobs", "location",           255,  true);
    await str ("Jobs", "requirements",       5000, true);
    await dt  ("Jobs", "deadline",                 true);
    await bool("Jobs", "isActive",                 false, true);
    // ── NEW ──────────────────────────────────────────────────
    // Taiwan law: international students can work max 20h/week
    await int ("Jobs", "hoursPerWeek",       false, 1, 40);
    await bool("Jobs", "allowsStudentVisa",        false, true); // Key filter for du học sinh
    // "None" | "Basic" | "Conversational" | "Fluent"
    await str ("Jobs", "chineseRequired",    50,   false, "None");
    await str ("Jobs", "district",          100,  false); // e.g. "Da'an District, Taipei"
    await str ("Jobs", "benefits",          1000, false); // Meal / Transport / Insurance

    // ══════════════════════════════════════════════════════════
    // E. APPLICATIONS  (+targetType now includes "scholarship")
    // ══════════════════════════════════════════════════════════
    await col("Applications", "Applications", [
      Permission.create(Role.team("student")),
      Permission.read(Role.user("owner")),
      Permission.read(Role.team("admin")),
      Permission.read(Role.team("school")),
      Permission.read(Role.team("business")),
      Permission.update(Role.team("admin")),
      Permission.update(Role.team("school")),
      Permission.update(Role.team("business")),
      Permission.delete(Role.team("admin")),
    ]);
    await str ("Applications", "studentId",    36,   true);
    await str ("Applications", "targetId",     36,   true);
    // "school_program" | "business_job" | "scholarship"
    await str ("Applications", "targetType",   50,   true);
    // required=false so we can set default="pending" (Appwrite rule)
    await str ("Applications", "status",       50,   false, "pending");
    await dt  ("Applications", "appliedAt",          true);
    await str ("Applications", "documentUrls", 2048, false, undefined, true); // array
    // ── NEW ──────────────────────────────────────────────────
    await str ("Applications", "notes",        1000, false); // student's cover note
    await str ("Applications", "reviewNote",   1000, false); // school/business feedback

    // ══════════════════════════════════════════════════════════
    // F. SAVED_ITEMS  ← NEW COLLECTION  (Bookmark / Wishlist)
    // ══════════════════════════════════════════════════════════
    await col("Saved_Items", "Saved_Items", [
      Permission.create(Role.team("student")),
      Permission.create(Role.users()),
      Permission.read(Role.user("owner")),
      Permission.update(Role.user("owner")),
      Permission.delete(Role.user("owner")),
    ]);
    await str("Saved_Items", "studentId",  36,  true);
    // "school" | "program" | "job" | "scholarship"
    await str("Saved_Items", "itemType",   50,  true);
    await str("Saved_Items", "itemId",     36,  true);  // FK to the saved document
    await dt ("Saved_Items", "savedAt",         true);

    // ══════════════════════════════════════════════════════════
    // G. POSTS  ← Community articles (user-generated, moderated)
    // ══════════════════════════════════════════════════════════
    await col("Posts", "Posts", [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.user("owner")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.user("owner")),
      Permission.delete(Role.team("admin")),
    ]);
    await str ("Posts", "authorId",        36,    true);
    await str ("Posts", "authorName",      255,   true);
    await str ("Posts", "authorRole",      50,    true);  // student/school/business
    await str ("Posts", "title",           255,   true);
    await str ("Posts", "slug",            255,   true);
    await str ("Posts", "content",         50000, true);
    await str ("Posts", "excerpt",         500,   false);
    await str ("Posts", "coverImageUrl",   2048,  false);
    await str ("Posts", "tags",            50,    false, undefined, true); // array
    // "pending" | "approved" | "rejected"
    await str ("Posts", "status",          50,    false, "pending");
    await str ("Posts", "rejectionReason", 500,   false);
    await dt  ("Posts", "publishedAt",            false);
    await int ("Posts", "viewCount",              false, 0, 999999, 0);

    // ─── Done ──────────────────────────────────────────────────
    console.log("\n" + "═".repeat(56));
    console.log("🎉  Database schema bootstrapped successfully!");
    console.log("═".repeat(56));
    console.log("\n  [A] System_Configs     — 2 attrs");
    console.log("  [B] Students           — 15 attrs");
    console.log("  [C] Schools            — 9 attrs");
    console.log("  [C] Admission_Terms    — 6 attrs");
    console.log("  [C] Programs           — 13 attrs");
    console.log("  [C] Scholarships       — 17 attrs");
    console.log("  [D] Businesses         — 7 attrs");
    console.log("  [D] Jobs               — 13 attrs");
    console.log("  [E] Applications       — 8 attrs");
    console.log("  [F] Saved_Items        — 4 attrs");
    console.log("  [G] Posts              — 13 attrs  ← NEW (Community)");
    console.log("\n✅  All done — UniLink Taiwan Edition schema is live!\n");

  } catch (err) {
    const e = err as AppwriteError;
    console.error("\n❌  Fatal error:");
    console.error(`   Code    : ${e?.code ?? "unknown"}`);
    console.error(`   Message : ${e?.message ?? String(err)}`);
    process.exit(1);
  }
}

main();

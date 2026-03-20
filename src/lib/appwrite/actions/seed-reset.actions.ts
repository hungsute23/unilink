"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../server";
import { revalidatePath } from "next/cache";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

/** Delete ALL documents in a collection — sequential deletes to avoid rate limits */
async function clearCollection(databases: any, colId: string) {
  let deleted = 0;
  let safety = 0;
  while (safety < 20) {
    safety++;
    let docs: any;
    try {
      docs = await databases.listDocuments(DB_ID, colId, [Query.limit(100)]);
    } catch (e) {
      console.warn(`  [warn] listDocuments failed for ${colId}:`, e);
      break;
    }
    if (docs.documents.length === 0) break;
    for (const d of docs.documents) {
      try {
        await databases.deleteDocument(DB_ID, colId, d.$id);
        deleted++;
      } catch (e) {
        console.warn(`  [warn] Could not delete ${colId}/${d.$id}:`, e);
      }
    }
  }
  console.log(`  Cleared ${colId}: ${deleted} docs`);
}

export async function resetAndSeed() {
  const { users, databases } = await createAdminClient();

  try {
    // ── 1. CLEAR CONTENT COLLECTIONS ────────────────────────────────────────
    console.log("🗑️  Clearing old data...");
    const toClear = ["Posts", "Jobs", "Scholarships", "Programs", "Admission_Terms", "Businesses", "Schools", "System_Configs"];
    for (const col of toClear) {
      try {
        await clearCollection(databases, col);
      } catch (e) {
        console.warn(`  [warn] clearCollection failed for ${col}:`, e);
      }
    }
    console.log("✅ Cleared all collections");

    // ── 2. USERS ─────────────────────────────────────────────────────────────
    const usersData = [
      { email: "admin@unilink.com",    password: "Unilink123!", name: "UniLink Admin",    role: "admin"    },
      { email: "student@unilink.com",  password: "Unilink123!", name: "Manh Hung Nguyen", role: "student"  },
      { email: "school@unilink.com",   password: "Unilink123!", name: "NTU Administrator",role: "school"   },
      { email: "business@unilink.com", password: "Unilink123!", name: "TSMC HR",          role: "business" },
    ];
    const uid: Record<string, string> = {};
    for (const u of usersData) {
      try {
        const ex = await users.list([Query.equal("email", u.email)]);
        if (ex.total > 0) {
          uid[u.role] = ex.users[0].$id;
        } else {
          const n = await users.create(ID.unique(), u.email, undefined, u.password, u.name);
          await users.updatePrefs(n.$id, { role: u.role });
          uid[u.role] = n.$id;
        }
      } catch (e) { console.error(u.email, e); }
    }

    // ── 3. SYSTEM CONFIGS ────────────────────────────────────────────────────
    const configs = [
      { key: "site_name",          value: "UniLink Taiwan" },
      { key: "site_tagline",       value: "Connect. Study. Work." },
      { key: "contact_email",      value: "support@unilink.tw" },
      { key: "max_applications",   value: "10" },
      { key: "scholarship_season", value: "Spring 2026" },
      { key: "maintenance_mode",   value: "false" },
      { key: "featured_schools",   value: "6" },
    ];
    for (const c of configs) {
      await databases.createDocument(DB_ID, "System_Configs", ID.unique(), c);
    }

    // ── 4. SCHOOLS ───────────────────────────────────────────────────────────
    console.log("🏫 Creating schools...");
    const schools = [
      {
        key: "ntu",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "National Taiwan University (NTU)",
          website: "https://www.ntu.edu.tw",
          contactEmail: "admission@ntu.edu.tw",
          city: "Taipei",
          description: "National Taiwan University is Taiwan's most prestigious university and consistently ranks among Asia's top institutions. Founded in 1928, NTU offers world-class research facilities, diverse English-taught programs, and a vibrant international student community in the heart of Taipei. With over 33,000 students from 80+ countries, NTU is the gateway to Taiwan's academic excellence. The main campus spans 1.09 square kilometres and features state-of-the-art laboratories, a renowned university hospital, and lush green spaces along the Xindian River corridor.",
          ranking: "#1 Taiwan · QS Top 100 Asia",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/National_Taiwan_University_logo.svg/1200px-National_Taiwan_University_logo.svg.png",
        },
      },
      {
        key: "ncku",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "National Cheng Kung University (NCKU)",
          website: "https://www.ncku.edu.tw",
          contactEmail: "intl@ncku.edu.tw",
          city: "Tainan",
          description: "NCKU is a leading comprehensive research university in Southern Taiwan, internationally recognized for Engineering, Science, Medicine, and Architecture. With strong industry ties to the Southern Taiwan Science Park and TSMC Tainan fabs, NCKU graduates are highly sought after by Taiwan's semiconductor industry. The campus is in Tainan — Taiwan's cultural capital with rich history — offering students a lower cost of living (30–40% cheaper than Taipei) and a famously vibrant food scene.",
          ranking: "#2 Taiwan · QS Top 200 Asia",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/National_Cheng_Kung_University_Logo.svg/1024px-National_Cheng_Kung_University_Logo.svg.png",
        },
      },
      {
        key: "nthu",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "National Tsing Hua University (NTHU)",
          website: "https://www.nthu.edu.tw",
          contactEmail: "oia@nthu.edu.tw",
          city: "Hsinchu",
          description: "NTHU is one of Asia's most distinguished STEM universities, located in Hsinchu — Taiwan's Silicon Valley, home to TSMC, MediaTek, and 500+ tech companies. With direct research partnerships with global industry leaders, NTHU students enjoy unparalleled access to internships and cutting-edge research projects. The university consistently ranks in the global top 200 for Engineering & Technology and maintains strong faculty publication output in materials science, EE, and CS. NTHU's campus is also notable for its beautiful lake and scenic surroundings.",
          ranking: "#3 Taiwan · QS Top 200 World",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/NTHU_seal.svg/800px-NTHU_seal.svg.png",
        },
      },
      {
        key: "nycu",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "National Yang Ming Chiao Tung University (NYCU)",
          website: "https://www.nycu.edu.tw",
          contactEmail: "admission@nycu.edu.tw",
          city: "Hsinchu",
          description: "NYCU was formed in 2021 from the merger of two legendary Taiwanese institutions — National Chiao Tung University (NCTU, founded 1958) and National Yang-Ming University (founded 1975). The combined university is a powerhouse in Computer Science, Electrical Engineering, Medicine, and Biomedical Engineering. Its Hsinchu campus sits at the heart of the global semiconductor ecosystem, while its Taipei campus focuses on clinical medicine and life sciences. NYCU alumni have founded or co-founded several Taiwan unicorn tech companies.",
          ranking: "#4 Taiwan · Top 10 Asia EE/CS",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/National_Yang_Ming_Chiao_Tung_University_logo.svg/800px-National_Yang_Ming_Chiao_Tung_University_logo.svg.png",
        },
      },
      {
        key: "fcu",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "Feng Chia University (FCU)",
          website: "https://www.fcu.edu.tw",
          contactEmail: "oic@fcu.edu.tw",
          city: "Taichung",
          description: "Feng Chia University is one of Taiwan's most internationally active private universities, welcoming over 3,000 international students annually from 70+ countries. FCU is renowned for its innovative Business and Engineering programs, a dedicated International College with 30+ fully English-taught degree programs, and an active career placement network in Central Taiwan's growing tech and manufacturing sector. Its campus in Xitun District, Taichung, places students near the iconic Fengjia Night Market — one of Taiwan's largest and most vibrant.",
          ranking: "#1 Private · Best Intl Environment",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/zh/thumb/3/36/Feng_Chia_University_logo.svg/1200px-Feng_Chia_University_logo.svg.png",
        },
      },
      {
        key: "tku",
        data: {
          ownerId: uid.school ?? "seed",
          schoolName: "Tamkang University (TKU)",
          website: "https://www.tku.edu.tw",
          contactEmail: "oia@tku.edu.tw",
          city: "New Taipei",
          description: "Founded in 1950, Tamkang University is one of Taiwan's oldest and most respected private universities, with a stunning main campus in Tamsui — a historic seaside district of New Taipei City offering ocean views and a charming old street. TKU is well-known for its International Affairs, Business, and Architecture programs. It maintains an extensive global alumni network spanning 80 countries and has strong exchange program agreements with 300+ universities worldwide. The Tamsui campus is just 30 minutes from Taipei Main Station via the MRT Danshui Line.",
          ranking: "Top Private · Most Beautiful Campus",
          hasDorm: true,
          logoUrl: "https://upload.wikimedia.org/wikipedia/zh/thumb/f/f4/Tamkang_University_Seal.svg/800px-Tamkang_University_Seal.svg.png",
        },
      },
    ];

    const schoolIds: Record<string, string> = {};
    for (const s of schools) {
      try {
        const doc = await databases.createDocument(DB_ID, "Schools", ID.unique(), s.data);
        schoolIds[s.key] = doc.$id;
        console.log(`  ✓ ${s.data.schoolName}`);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        console.error(`  ❌ School failed [${s.key}]: ${msg}`);
        throw new Error(`School creation failed for ${s.key}: ${msg}`);
      }
    }

    // ── 5. ADMISSION TERMS ───────────────────────────────────────────────────
    console.log("📅 Creating admission terms...");
    const terms = [
      { key: "ntu_fall26", schoolKey: "ntu", termName: "Fall 2026 Graduate Admissions", start: "2026-01-05", end: "2026-03-20", intake: "September 2026", notes: "Full scholarship support available for top applicants. Contact your target professor before applying." },
      { key: "ntu_spr26",  schoolKey: "ntu", termName: "Spring 2026 Exchange Program",  start: "2025-09-01", end: "2025-10-31", intake: "February 2026", notes: "Exchange only — no tuition. Nomination by home university required." },
      { key: "ncku_fall26",schoolKey: "ncku", termName: "International Admissions Fall 2026", start: "2026-01-20", end: "2026-04-10", intake: "September 2026", notes: "Engineering and Science programs prioritized. NCKU Distinguished Scholarship available." },
      { key: "nthu_fall26",schoolKey: "nthu", termName: "NTHU International Program Fall 2026", start: "2026-01-10", end: "2026-03-31", intake: "September 2026", notes: "STEM-focused. Strong MOE scholarship pipeline for NTHU applicants." },
      { key: "nycu_fall26",schoolKey: "nycu", termName: "NYCU Graduate Admissions 2026", start: "2026-02-01", end: "2026-04-30", intake: "September 2026", notes: "EE and CS programs in extremely high demand — apply early." },
      { key: "fcu_fall26", schoolKey: "fcu", termName: "FCU International College Fall 2026", start: "2025-11-01", end: "2026-03-15", intake: "September 2026", notes: "30+ fully English-taught programs. FCU International Student Grant available (30–50% tuition reduction)." },
      { key: "tku_fall26", schoolKey: "tku", termName: "TKU International Admissions 2026", start: "2026-01-01", end: "2026-04-15", intake: "September 2026", notes: "Priority given to ASEAN and Southeast Asian students. Airport pickup and housing assistance provided." },
    ];

    const termIds: Record<string, string> = {};
    for (const t of terms) {
      const doc = await databases.createDocument(DB_ID, "Admission_Terms", ID.unique(), {
        schoolId: schoolIds[t.schoolKey],
        termName: t.termName,
        applyStartDate: t.start,
        applyEndDate: t.end,
        intakeMonth: t.intake,
        notes: t.notes,
      });
      termIds[t.key] = doc.$id;
    }
    console.log(`  ✓ ${terms.length} terms created`);

    // ── 6. PROGRAMS ──────────────────────────────────────────────────────────
    console.log("📚 Creating programs...");
    const programs = [
      // NTU
      { termKey: "ntu_fall26", dept: "Computer Science & Information Engineering", degree: "Master", lang: "English", tuition: "62,400 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts (notarized)", "2 Recommendation Letters", "Statement of Purpose", "CV/Resume", "IELTS/TOEFL Score"], url: "https://www.csie.ntu.edu.tw/admission" },
      { termKey: "ntu_fall26", dept: "Global MBA (GMBA)", degree: "Master", lang: "English", tuition: "130,000 TWD/semester", minEng: "GMAT 600+ or GRE equivalent", dorm: true, appFee: "2,500 TWD", docs: ["Official Transcripts", "GMAT/GRE Score Report", "3 Recommendation Letters", "Statement of Purpose", "Work Experience Certificate (preferred)"], url: "https://gmba.ntu.edu.tw" },
      { termKey: "ntu_fall26", dept: "Electrical Engineering", degree: "PhD", lang: "English", tuition: "55,500 TWD/semester", minEng: "IELTS 7.0 / TOEFL 100", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts", "Research Proposal (3,000 words)", "3 Recommendation Letters", "CV/Resume", "Publications list (if any)"], url: "https://www.ee.ntu.edu.tw" },
      { termKey: "ntu_fall26", dept: "Finance & Economics", degree: "Master", lang: "English", tuition: "68,000 TWD/semester", minEng: "IELTS 6.5", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts", "Statement of Purpose", "2 Recommendation Letters", "IELTS/TOEFL Score"], url: "https://www.fin.ntu.edu.tw" },
      // NCKU
      { termKey: "ncku_fall26", dept: "Semiconductor & Electrophysics Engineering", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0 / TOEFL 79", dorm: true, appFee: "1,500 TWD", docs: ["Official Transcripts", "CV/Resume", "2 Recommendation Letters", "Statement of Purpose"], url: "https://www.ncku.edu.tw/admission" },
      { termKey: "ncku_fall26", dept: "Mechanical Engineering", degree: "Master", lang: "English", tuition: "56,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,500 TWD", docs: ["Official Transcripts", "Research Interest Statement", "CV/Resume", "1 Recommendation Letter"], url: "https://www.me.ncku.edu.tw" },
      { termKey: "ncku_fall26", dept: "Business Administration", degree: "Master", lang: "English", tuition: "72,000 TWD/semester", minEng: "IELTS 6.5", dorm: false, appFee: "2,000 TWD", docs: ["Official Transcripts", "3 Recommendation Letters", "Work Experience Certificate (preferred)", "GMAT Score (optional)"], url: "https://www.ba.ncku.edu.tw" },
      // NTHU
      { termKey: "nthu_fall26", dept: "Computer Science", degree: "PhD", lang: "English", tuition: "54,000 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts", "Research Proposal", "3 Recommendation Letters", "Publications List (if any)", "CV/Resume"], url: "https://www.cs.nthu.edu.tw" },
      { termKey: "nthu_fall26", dept: "Materials Science & Engineering", degree: "Master", lang: "English", tuition: "57,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,800 TWD", docs: ["Official Transcripts", "Statement of Purpose", "CV/Resume", "2 Recommendation Letters"], url: "https://www.mse.nthu.edu.tw" },
      { termKey: "nthu_fall26", dept: "Industrial Engineering & Engineering Management", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,800 TWD", docs: ["Official Transcripts", "Statement of Purpose", "2 Recommendation Letters"], url: "https://www.ie.nthu.edu.tw" },
      // NYCU
      { termKey: "nycu_fall26", dept: "Electrical & Computer Engineering", degree: "Master", lang: "English", tuition: "60,000 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts", "Statement of Purpose", "2 Recommendation Letters", "IELTS/TOEFL Score"], url: "https://www.ee.nycu.edu.tw" },
      { termKey: "nycu_fall26", dept: "Computer Science", degree: "Master", lang: "English", tuition: "62,000 TWD/semester", minEng: "IELTS 6.5", dorm: true, appFee: "2,000 TWD", docs: ["Official Transcripts", "Statement of Purpose", "CV/Resume", "2 Recommendation Letters"], url: "https://www.cs.nycu.edu.tw" },
      { termKey: "nycu_fall26", dept: "Biomedical Engineering", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0 / TOEFL 79", dorm: true, appFee: "1,800 TWD", docs: ["Official Transcripts", "Research Interest Statement", "CV/Resume", "2 Recommendation Letters"], url: "https://www.bme.nycu.edu.tw" },
      // FCU
      { termKey: "fcu_fall26", dept: "International Business Administration", degree: "Master", lang: "English", tuition: "88,000 TWD/year", minEng: "IELTS 5.5 / TOEFL 72", dorm: true, appFee: "1,000 TWD", docs: ["Official Transcripts", "Motivation Letter", "Passport Copy", "IELTS/TOEFL Score (if available)"], url: "https://ic.fcu.edu.tw" },
      { termKey: "fcu_fall26", dept: "Information Engineering & Computer Science", degree: "Bachelor", lang: "English", tuition: "76,000 TWD/year", minEng: "IELTS 5.5", dorm: true, appFee: "1,000 TWD", docs: ["High School Diploma", "Official Transcripts", "Passport Copy", "Motivation Letter"], url: "https://ic.fcu.edu.tw" },
      { termKey: "fcu_fall26", dept: "Data Science & Artificial Intelligence", degree: "Master", lang: "English", tuition: "92,000 TWD/year", minEng: "IELTS 6.0", dorm: true, appFee: "1,000 TWD", docs: ["Official Transcripts", "Statement of Purpose", "2 Recommendation Letters", "Programming Portfolio (optional)"], url: "https://ic.fcu.edu.tw" },
      // TKU
      { termKey: "tku_fall26", dept: "International Affairs & Strategic Studies", degree: "Master", lang: "English", tuition: "75,000 TWD/year", minEng: "IELTS 6.0 / TOEFL 80", dorm: true, appFee: "1,500 TWD", docs: ["Official Transcripts", "Statement of Purpose", "2 Recommendation Letters", "CV/Resume"], url: "https://www.tku.edu.tw/admission" },
      { termKey: "tku_fall26", dept: "Business Management", degree: "Master", lang: "English", tuition: "78,000 TWD/year", minEng: "IELTS 5.5", dorm: true, appFee: "1,500 TWD", docs: ["Official Transcripts", "Statement of Purpose", "Passport Copy", "1 Recommendation Letter"], url: "https://www.tku.edu.tw/admission" },
    ];

    for (const p of programs) {
      await databases.createDocument(DB_ID, "Programs", ID.unique(), {
        termId: termIds[p.termKey],
        departmentName: p.dept,
        degreeLevel: p.degree,
        languageInstruction: p.lang,
        tuitionFee: p.tuition,
        minEnglishReq: p.minEng,
        dormAvailable: p.dorm,
        applicationFee: p.appFee,
        requiredDocs: p.docs,
        programUrl: p.url,
      });
    }
    console.log(`  ✓ ${programs.length} programs created`);

    // ── 7. BUSINESSES ────────────────────────────────────────────────────────
    console.log("🏢 Creating businesses...");
    const businesses = [
      { key: "tsmc", data: { ownerId: uid.business ?? "seed", companyName: "Taiwan Semiconductor Manufacturing Co. (TSMC)", industry: "Semiconductors / Chip Fabrication", city: "Hsinchu", description: "TSMC is the world's largest dedicated semiconductor foundry, manufacturing chips for Apple, NVIDIA, AMD, and hundreds of global clients. Founded in 1987 by Dr. Morris Chang, TSMC employs over 73,000 people and operates cutting-edge fabs at 3nm and below. Interns and graduates at TSMC gain exposure to the most advanced chip manufacturing processes on Earth. TSMC's Hsinchu Science Park campus includes 12 fabs, R&D centers, employee housing, sports facilities, and a full medical center.", website: "https://www.tsmc.com", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/TSMC_logo.svg/1200px-TSMC_logo.svg.png" } },
      { key: "asus", data: { ownerId: uid.business ?? "seed", companyName: "ASUSTeK Computer Inc. (ASUS)", industry: "Consumer Electronics / PCs", city: "Taipei", description: "ASUS is a global technology powerhouse headquartered in Taipei, famous for laptops, motherboards, GPUs, routers, and smartphones. With over $15B in annual revenue and operations in 50+ countries, ASUS offers international talents exciting roles across R&D, design, software, and global marketing. ASUS consistently appears on Forbes' list of the world's most innovative companies and is home to the award-winning Republic of Gamers (ROG) brand — one of the most recognized names in gaming hardware.", website: "https://www.asus.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ASUS_Logo.svg/1200px-ASUS_Logo.svg.png" } },
      { key: "shopee", data: { ownerId: uid.business ?? "seed", companyName: "Shopee Taiwan (Sea Group)", industry: "E-Commerce / Tech", city: "Taipei", description: "Shopee is Southeast Asia and Taiwan's leading e-commerce platform, part of Sea Group — one of Asia's largest publicly listed tech conglomerates (NYSE: SE). The Taipei office drives Shopee's Taiwan operations and serves as a regional tech hub for product development, data science, and operations. Working at Shopee means joining a data-driven, fast-moving team building products for millions of daily active buyers and sellers across Taiwan and Southeast Asia.", website: "https://shopee.tw", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png" } },
      { key: "line", data: { ownerId: uid.business ?? "seed", companyName: "LINE Taiwan Limited", industry: "Messaging / Social Media / Fintech", city: "Taipei", description: "LINE is the most widely used messaging app in Taiwan with over 21 million monthly active users — a market penetration of nearly 90%. LINE Taiwan operates a full technology center in Zhongshan District, Taipei, developing LINE Pay (Taiwan's #1 mobile payment), LINE MUSIC, LINE Shopping, and AI-powered services. The Taipei office is a dynamic engineering hub staffed by top local and international talent building products at massive scale across Asia.", website: "https://linecorp.com/tw", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/1200px-LINE_logo.svg.png" } },
      { key: "mediatek", data: { ownerId: uid.business ?? "seed", companyName: "MediaTek Inc.", industry: "Semiconductors / IC Design", city: "Hsinchu", description: "MediaTek is the world's largest fabless semiconductor company by revenue, designing chips for smartphones (Dimensity series), smart TVs, IoT devices, Wi-Fi routers, and automotive applications. Headquartered in Hsinchu Science Park, MediaTek shipped over 2 billion chips in 2024 alone and is a TWSE top-10 listed company by market capitalization. For engineering students, a MediaTek internship is one of the most prestigious and well-compensated opportunities in Asia's semiconductor industry.", website: "https://www.mediatek.com", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/MediaTek_logo.svg/1200px-MediaTek_logo.svg.png" } },
      { key: "garena", data: { ownerId: uid.business ?? "seed", companyName: "Garena Taiwan (Sea Group)", industry: "Gaming / Digital Entertainment", city: "Taipei", description: "Garena is the premier online gaming platform in Southeast Asia and Taiwan, home to Free Fire — one of the world's most downloaded mobile games with 100M+ monthly active players globally. The Taipei office handles live operations, esports events, game publishing, creator partnerships, and Southeast Asian market strategy. Join a passionate team of gamers and technologists building the future of interactive entertainment in one of Asia's most dynamic markets.", website: "https://www.garena.tw", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Garena_logo.svg/1200px-Garena_logo.svg.png" } },
    ];

    const bizIds: Record<string, string> = {};
    for (const b of businesses) {
      try {
        const doc = await databases.createDocument(DB_ID, "Businesses", ID.unique(), b.data);
        bizIds[b.key] = doc.$id;
        console.log(`  ✓ ${b.data.companyName}`);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        console.error(`  ❌ Business failed [${b.key}]: ${msg}`);
        throw new Error(`Business creation failed for ${b.key}: ${msg}`);
      }
    }

    // ── 8. JOBS (imported from seed-content) ────────────────────────────────
    console.log("💼 Creating jobs...");

    // Shortened job list inline — full descriptions
    const jobs = [
      // TSMC
      { biz: "tsmc", title: "AI & Machine Learning Research Intern", type: "Internship", salary: "35,000–45,000 TWD/month", loc: "Hsinchu Science Park, Building 6", hours: 40, visa: true, chinese: "None", district: "Hsinchu Science Park", deadline: "2026-06-30",
        benefits: `Compensation & Financial\n• Monthly stipend: 35,000–45,000 TWD (based on degree level)\n• Housing allowance: 5,000 TWD/month\n• Meal subsidy: 150 TWD/working day\n\nOn-site Perks\n• Free shuttle bus from Hsinchu Station to campus\n• Access to TSMC Sports Center (gym, pool, tennis)\n• Free Wi-Fi across all buildings\n\nCareer Development\n• Weekly tech talks with senior engineers\n• Full-time conversion opportunity (top 15% eligible)\n• Access to TSMC e-Learning platform (1,000+ courses)`,
        req: `About the Role\n\nJoin TSMC's AI Research Division to develop intelligent systems for chip manufacturing — from yield prediction to defect classification. Work alongside world-class engineers with access to proprietary manufacturing data and GPU clusters.\n\nWhat You Will Do\n• Develop deep learning models for semiconductor defect detection using wafer map data\n• Build time-series forecasting models to predict process drift and equipment failures\n• Benchmark model performance and optimize inference latency for production deployment\n• Document research findings and present results to cross-functional engineering teams\n\nRequired Qualifications\n• Currently pursuing Master's or PhD in CS, EE, or related field\n• Strong Python proficiency; hands-on experience with PyTorch or TensorFlow\n• Solid understanding of CNNs, supervised learning, and time-series modeling\n• Professional-level English communication\n\nPreferred Qualifications\n• Prior research experience in industrial AI or computer vision\n• Familiarity with semiconductor manufacturing concepts\n• Experience with MLflow or other experiment tracking tools\n\nDuration: 4–6 months | Location: On-site, Hsinchu Science Park` },
      { biz: "tsmc", title: "Process Integration Engineer (Entry Level)", type: "Full-time", salary: "65,000–85,000 TWD/month", loc: "TSMC Fab 18, Hsinchu", hours: 40, visa: true, chinese: "Basic", district: "Hsinchu City", deadline: "2026-07-31",
        benefits: `Compensation & Financial\n• Base salary: 65,000–85,000 TWD/month\n• Annual performance bonus: 2–4 months' salary\n• TSMC Employee Stock Purchase Program (ESPP) — 15% discount\n• Year-end and mid-year bonus\n\nHealth & Wellness\n• Comprehensive health insurance for employee and dependents\n• Annual health check-up at TSMC medical center\n• On-site gym, swimming pool, and sports facilities\n• Mental health support hotline and counseling\n\nCareer & Learning\n• Structured 3-month onboarding program\n• Annual education allowance: 20,000 TWD\n• Clear 5-year career ladder with transparent promotion criteria\n• Free shuttle bus across Hsinchu, Taoyuan, and Taipei`,
        req: `About the Role\n\nAs a Process Integration Engineer at TSMC Fab 18 — our most advanced 3nm manufacturing facility — you will ensure the highest standards of chip production quality and yield. Your work directly impacts the chips powering iPhones, NVIDIA GPUs, and next-generation AI accelerators.\n\nKey Responsibilities\n• Monitor and optimize assigned process modules to maintain yield targets above SPC control limits\n• Investigate process excursions using root cause analysis (RCA) methodologies\n• Collaborate with equipment engineers and R&D teams to implement process improvements\n• Generate daily/weekly process performance reports for module leaders\n• Participate in new process qualification and technology transfer activities\n\nRequired Qualifications\n• Bachelor's or Master's in Materials Science, Chemical Engineering, Physics, or EE\n• Understanding of semiconductor device physics and CMOS fabrication fundamentals\n• Analytical mindset; proficiency in data analysis (Excel, JMP, Python a plus)\n• Ability to work in a cleanroom environment\n• Basic Mandarin for internal documentation\n\nPreferred Qualifications\n• Thesis or research related to thin film deposition, lithography, or device characterization\n• Internship experience in semiconductor or manufacturing environment` },
      { biz: "tsmc", title: "Software Engineer — EDA Tools Development", type: "Full-time", salary: "75,000–100,000 TWD/month", loc: "TSMC Technology Center, Taipei", hours: 40, visa: true, chinese: "None", district: "Zhongzheng District, Taipei", deadline: "2026-08-31",
        benefits: `Compensation\n• Monthly salary: 75,000–100,000 TWD\n• Annual bonus: 3–5 months' salary\n• Remote work: 2 days/week after 3-month probation\n• 15 days annual leave from Year 1\n\nTech & Tools\n• MacBook Pro or high-spec workstation provided\n• Annual conference attendance allowance (1 international/year)\n• Access to TSMC internal research library and patent database\n\nCommunity\n• 500+ software engineers in Taipei office\n• Quarterly hackathons with prizes up to 50,000 TWD`,
        req: `About the Role\n\nTSMC's EDA Tools team in Taipei develops the proprietary software infrastructure used by thousands of engineers at TSMC and customers including Apple, NVIDIA, and AMD.\n\nWhat You Will Build\n• Core EDA tool components: DRC engines, LVS checkers, parasitic extraction tools\n• Automation frameworks reducing manual engineering effort in PDK development\n• AI/ML modules for predicting lithographic hotspots before tape-out\n• CI/CD pipelines and test automation infrastructure\n\nRequired Qualifications\n• Bachelor's or Master's in Computer Science or Software Engineering\n• Expert-level C++ (C++14 or later) with strong algorithm and data structures knowledge\n• Experience building large, multi-module software projects\n• Proficiency in Python for scripting and data analysis\n• Excellent English — daily collaboration with teams in Hsinchu, Austin, and Japan\n\nPreferred Qualifications\n• Exposure to EDA concepts (VLSI CAD, SPICE, Verilog/VHDL)\n• Experience with parallel computing (OpenMP, MPI) or GPU programming\n• Open-source contributions you can discuss` },
      // ASUS
      { biz: "asus", title: "Hardware Design Engineer — Gaming Laptops (ROG)", type: "Full-time", salary: "55,000–75,000 TWD/month", loc: "ASUS HQ, Beitou District, Taipei", hours: 40, visa: true, chinese: "Basic", district: "Beitou District, Taipei", deadline: "2026-06-15",
        benefits: `Compensation & Bonuses\n• Base salary: 55,000–75,000 TWD/month\n• Year-end bonus (average 2–3 months)\n• ASUS Employee Stock Ownership Plan (ESOP)\n\nProduct Benefits\n• 30–50% employee discount on ASUS products\n• Annual product allowance: 15,000 TWD\n• Pre-launch access to new products for testing\n\nWork Environment\n• Modern 35-floor HQ in Beitou, Taipei\n• On-site gym, basketball court, rooftop garden\n• ASUS Global Talent Exchange Program (rotation to USA, EU, Japan)`,
        req: `About the Role\n\nJoin the ROG (Republic of Gamers) design team and shape the next generation of gaming laptops sold in 50+ countries. You will own specific hardware subsystems from concept through mass production.\n\nKey Responsibilities\n• Lead hardware design for assigned subsystems: thermal management, power delivery, audio, or I/O\n• Create and review schematics, PCB layouts, and BOM with EMS partners\n• Conduct electrical validation, signal integrity analysis, and EMI/EMC pre-compliance testing\n• Coordinate with industrial designers and firmware teams for integrated product experience\n• Travel to manufacturing partners for NPI (New Product Introduction) builds\n\nRequired Qualifications\n• Bachelor's or Master's in Electrical Engineering or Mechanical Engineering\n• 1–3 years hardware design experience (strong internship background considered)\n• Proficiency in PCB design tools (Altium Designer, Cadence Allegro, or equivalent)\n• Working knowledge of thermal simulation tools\n• Basic Mandarin for manufacturing team collaboration\n\nPreferred Qualifications\n• Experience with laptop or mobile device hardware design\n• Familiarity with USB4, Thunderbolt 5, DDR5, or PCIe Gen 5 specs\n• A gaming background is genuinely valued` },
      { biz: "asus", title: "Global Marketing Specialist — EU & NA Region", type: "Full-time", salary: "50,000–65,000 TWD/month", loc: "ASUS Global HQ, Taipei", hours: 40, visa: true, chinese: "None", district: "Beitou District, Taipei", deadline: "2026-07-01",
        benefits: `Compensation\n• Base salary: 50,000–65,000 TWD/month\n• Annual marketing performance bonus\n• International travel budget: 4–6 trips/year to EU and NA\n• Remote work: up to 2 days/week\n\nGlobal Exposure\n• Attend CES Las Vegas, Computex Taipei, Gamescom Cologne\n• Work with global influencers and media outlets\n• Annual global marketing summit (Taipei, Amsterdam, or LA)\n• Product allowance: 20,000 TWD/year`,
        req: `About the Role\n\nManage brand strategy and go-to-market execution for the European and North American markets — together representing 40%+ of ASUS's global revenue.\n\nKey Responsibilities\n• Develop and execute integrated campaigns for EU and NA product launches\n• Manage relationships with retailers (Best Buy, Amazon, MediaMarkt) and media partners\n• Brief creative agencies producing video, digital ads, and retail materials\n• Analyze campaign performance and optimize spend allocation\n• Coordinate influencer programs with tech YouTubers and media (Linus Tech Tips, etc.)\n• Represent ASUS at international trade shows\n\nRequired Qualifications\n• Native or near-native English (C2 level minimum) — primary working language\n• Bachelor's in Marketing, Communications, Business, or related field\n• 2+ years in digital marketing, brand marketing, or product marketing\n• Strong analytical skills with Google Analytics, Meta Ads Manager experience\n\nPreferred Qualifications\n• Experience marketing consumer electronics or tech products\n• Background in EU or North American consumer markets (lived/studied there preferred)\n• Fluency in German, French, or Spanish is a bonus` },
      { biz: "asus", title: "Mobile App Developer — React Native & iOS", type: "Full-time", salary: "60,000–80,000 TWD/month", loc: "ASUS Software Innovation Center, Neihu, Taipei", hours: 40, visa: true, chinese: "None", district: "Neihu District, Taipei", deadline: "2026-07-15",
        benefits: `Tech & Compensation\n• Salary: 60,000–80,000 TWD/month\n• Equipment: MacBook Pro M3, iPhone 15 Pro, latest ASUS device\n• Work from home 3 days/week after onboarding\n• Flexible core hours: 10am–4pm\n\nGrowth\n• 1 international conference per year (WWDC, Google I/O, or similar)\n• Clear career path: Junior → Mid → Senior → Staff Engineer`,
        req: `About the Role\n\nBuild companion apps connecting 5M+ users to ASUS devices — from ROG Phone gaming features to ZenWiFi router management.\n\nWhat You Will Build\n• New features in the ASUS Router (ZenWiFi) iOS and Android app\n• ROG Armoury Crate mobile companion app\n• Cross-platform UI components using React Native with native module bridges\n• CI/CD automation using Fastlane and GitHub Actions\n\nRequired Qualifications\n• 2+ years building and shipping mobile apps to App Store and/or Google Play\n• Proficiency in React Native (TypeScript) with platform-specific modules\n• iOS development in Swift is a strong plus\n• Strong understanding of mobile UX principles\n• Experience with REST APIs and state management (Redux, Zustand)\n\nPreferred Qualifications\n• Published apps in App Store or Google Play you own and maintain\n• Experience with performance profiling on mobile\n• Familiarity with BLE or Wi-Fi integration for device pairing` },
      // Shopee
      { biz: "shopee", title: "Backend Software Engineer — Go / Python", type: "Full-time", salary: "70,000–95,000 TWD/month", loc: "Shopee Taiwan HQ, Xinyi District, Taipei", hours: 40, visa: true, chinese: "None", district: "Xinyi District, Taipei", deadline: "2026-07-31",
        benefits: `Compensation & Equity\n• Base salary: 70,000–95,000 TWD/month\n• RSU in Sea Group (NYSE: SE) — 4-year vesting\n• Performance bonus: 1–3 months annually\n• Relocation package for candidates from outside Taipei\n\nOffice & Lifestyle\n• Premium office in Taipei 101 area\n• Catered lunch and dinner on working days\n• Annual company trip (past: Japan, Bali, Korea)\n• Mental wellness program with 6 free therapy sessions/year`,
        req: `About the Role\n\nBuild and scale the e-commerce platform serving 23 million monthly active users in Taiwan — processing millions of transactions daily and handling 50x peak traffic spikes during 11.11 mega sales events.\n\nWhat You Will Work On\n• High-throughput order processing and inventory management services\n• Real-time pricing and promotion engine for 30M+ SKUs\n• Platform infrastructure: service mesh, rate limiting, circuit breaker\n• Database optimization: query tuning, sharding, cache invalidation\n\nRequired Qualifications\n• 2+ years backend development in a production environment\n• Proficiency in Go and/or Python — Go preferred for new services\n• Strong understanding of distributed systems: consistency, availability, idempotency\n• Experience with Kafka and Redis\n• Excellent English — all engineering documentation is in English\n\nPreferred Qualifications\n• Experience handling high-traffic flash sales or product drops\n• Familiarity with Kubernetes, Docker, AWS or GCP` },
      { biz: "shopee", title: "Data Analyst — Seller Operations", type: "Part-time", salary: "200–280 TWD/hour", loc: "Shopee Taiwan, Xinyi District, Taipei", hours: 20, visa: true, chinese: "Conversational", district: "Xinyi District, Taipei", deadline: "2026-05-31",
        benefits: `Compensation\n• Hourly rate: 200–280 TWD\n• Flexible scheduling: choose your 20 hours within Mon–Fri 9am–10pm\n• Shopee mall vouchers: 1,000 TWD/month\n• Potential full-time conversion after 6 months`,
        req: `About the Role\n\nAnalyze seller performance data at one of Asia's largest e-commerce platforms to improve seller experience and grow category GMV.\n\nWhat You Will Do\n• Query and analyze seller data using SQL (BigQuery) and Python/Pandas\n• Build dashboards in Tableau or Looker tracking seller NPS, order cancellation rate, response time\n• Identify underperforming seller segments and propose data-driven interventions\n• Support A/B test design for seller incentive campaigns\n• Prepare bi-weekly executive reports\n\nRequired Qualifications\n• Currently enrolled in university — final year preferred\n• Proficiency in SQL (complex multi-table joins, window functions)\n• Conversational Mandarin Chinese for communicating with local sellers and ops team\n• Attention to detail and ability to meet weekly reporting deadlines\n\nPreferred Qualifications\n• Experience with Python (Pandas, Matplotlib) or R\n• Familiarity with e-commerce metrics (GMV, conversion rate, AOV)` },
      { biz: "shopee", title: "Product Manager Intern — Logistics Tech", type: "Internship", salary: "28,000–35,000 TWD/month", loc: "Shopee Taiwan HQ, Xinyi, Taipei", hours: 40, visa: true, chinese: "Basic", district: "Xinyi District, Taipei", deadline: "2026-05-15",
        benefits: `Internship Package\n• Monthly stipend: 28,000–35,000 TWD\n• Catered lunch and dinner on working days\n• Dedicated PM mentor (Senior PM with 5+ years experience)\n• Full-time return offer for top performers\n• Weekly PM Talks with Shopee product leaders from Taiwan and Singapore`,
        req: `About the Role\n\nCoordinate 500,000+ daily deliveries across Taiwan — help design features for the logistics operations tools used by warehouse staff and courier partners daily.\n\nWhat You Will Own\n• User story writing and PRD creation for logistics operations tools\n• Competitive analysis of logistics tech in Taiwan and Southeast Asia\n• Coordination with engineering, data, and design during sprint planning\n• User interviews with warehouse managers and delivery partners\n• Definition and tracking of success metrics post-launch\n\nRequired Qualifications\n• Currently enrolled in university (Business, CS, Industrial Engineering, or related)\n• Strong analytical mindset — comfortable forming hypotheses and testing with data\n• Excellent English for daily communication with regional teams\n• Basic Mandarin for interviewing Taiwanese users and local ops staff\n\nPreferred Qualifications\n• Prior PM internship or product-adjacent experience\n• Familiarity with Figma for annotating wireframes\n• Understanding of SQL basics\n\nDuration: 3–6 months | Start: Flexible from March 2026` },
      // LINE
      { biz: "line", title: "Frontend Engineer — React / TypeScript", type: "Full-time", salary: "65,000–88,000 TWD/month", loc: "LINE Taiwan HQ, Zhongshan District, Taipei", hours: 40, visa: true, chinese: "None", district: "Zhongshan District, Taipei", deadline: "2026-08-01",
        benefits: `Compensation\n• Monthly salary: 65,000–88,000 TWD\n• LINE Pay credit: 3,000 TWD/month\n• WFH: 3 days/week (engineer's choice)\n• 15 days annual leave, flexible working hours\n• MacBook Pro provided\n• Gym reimbursement: 2,000 TWD/month`,
        req: `About the Role\n\nBuild web experiences for 21 million Taiwanese users across LINE SHOPPING (Taiwan's largest social commerce), LINE TODAY news, LINE MUSIC, and LINE Pay merchant portals. Ship to production multiple times per day in squads of 4–8 people.\n\nWhat You Will Build\n• New features for LINE SHOPPING's web storefront (millions of daily visits)\n• Seller management portals for 300,000+ merchants\n• Reusable component library (Design System) across all LINE Taiwan web products\n• A/B testing infrastructure and feature flag integration\n• Web performance optimization: Core Web Vitals, code splitting, SSR/ISR\n\nRequired Qualifications\n• 3+ years frontend development experience\n• Expert-level React.js and TypeScript\n• Experience building large SPAs with complex state management\n• Strong understanding of browser fundamentals and build tooling (Vite, Webpack)\n• Professional English for collaboration with LINE Japan and Korea teams\n\nPreferred Qualifications\n• Experience with Next.js (App Router)\n• Design System component library experience\n• Background in web accessibility (WCAG 2.1 AA)` },
      { biz: "line", title: "LINE Pay — Fintech Backend Engineer", type: "Full-time", salary: "72,000–98,000 TWD/month", loc: "LINE Taiwan, Zhongshan District, Taipei", hours: 40, visa: true, chinese: "Basic", district: "Zhongshan District, Taipei", deadline: "2026-08-31",
        benefits: `Compensation & Equity\n• Monthly salary: 72,000–98,000 TWD\n• Year-end bonus: 2–4 months\n• LINE Corp. RSU for senior hires\n• LINE Pay credit: 5,000 TWD/month\n• Quarterly travel to LINE Japan HQ (Tokyo)`,
        req: `About the Role\n\nLINE Pay is Taiwan's most widely adopted mobile payment platform, processing billions of TWD monthly across grocery stores, restaurants, e-commerce, and public transit. Design systems where correctness, security, and auditability are non-negotiable.\n\nWhat You Will Engineer\n• Core payment transaction processing: authorization, clearing, settlement, reconciliation\n• Merchant onboarding and KYC systems with regulatory compliance\n• Real-time fraud detection pipelines integrating rule engines and ML models\n• Open Banking API integrations with Taiwan's major banks\n• Event-driven architecture with Kafka for payment event streaming\n\nRequired Qualifications\n• 3+ years backend engineering in production\n• Proficiency in Java (Spring Boot) or Kotlin\n• Strong understanding of distributed transactions and idempotency\n• Awareness of financial regulatory concepts: PCI-DSS, AML, KYC\n• Basic Mandarin for Taiwanese regulatory documentation\n\nPreferred Qualifications\n• Prior experience in payment systems or fintech infrastructure\n• Knowledge of ISO 8583 or ISO 20022 financial messaging standards` },
      { biz: "line", title: "UX/UI Designer — LINE Shopping", type: "Part-time", salary: "180–250 TWD/hour", loc: "LINE Taiwan, Taipei", hours: 20, visa: true, chinese: "Conversational", district: "Zhongshan District, Taipei", deadline: "2026-06-01",
        benefits: `Compensation\n• Hourly rate: 180–250 TWD\n• Flexible scheduling Mon–Fri, 9am–7pm\n• Remote work permitted for most tasks\n• Access to LINE Design System Figma library\n• Portfolio work shipped to millions of real users`,
        req: `About the Role\n\nImprove the shopping experience for millions of users on LINE Shopping. Work on product detail pages, checkout flows, and seller storefronts alongside a professional design team.\n\nWhat You Will Design\n• New UI screens for LINE Shopping's mobile web and LINE mini-app\n• UI components for the LINE Design System\n• User research artifacts: interview guides, usability test scripts\n• High-fidelity Figma mockups and interactive prototypes for developer handoff\n\nRequired Qualifications\n• Portfolio with at least 3 completed design projects (mobile or web)\n• Proficiency in Figma including components, auto-layout, and prototype flows\n• Understanding of UX principles: information architecture, user flows, accessibility\n• Conversational Mandarin for collaborating with PMs, engineers, and research participants\n\nPreferred Qualifications\n• Experience conducting usability testing\n• Understanding of e-commerce UX patterns and conversion optimization\n• Motion design skills (Principle, Lottie)` },
      // MEDIATEK
      { biz: "mediatek", title: "IC Design Engineer — 5G Modem Frontend", type: "Full-time", salary: "80,000–120,000 TWD/month", loc: "MediaTek HQ, Hsinchu Science Park", hours: 40, visa: true, chinese: "Basic", district: "Hsinchu Science Park", deadline: "2026-07-31",
        benefits: `Industry-Leading Compensation\n• Monthly salary: 80,000–120,000 TWD\n• Annual bonus: 3–6 months' salary\n• MediaTek stock options (TWSE:2454)\n• Patent incentive: 10,000–50,000 TWD per approved patent\n• Company-subsidized housing first year (4,500 TWD/month)\n• 15 days annual leave from Day 1`,
        req: `About the Role\n\nContribute to RTL design and verification of the Dimensity 5G chipset series — the most widely shipped 5G modem platform in the world, powering flagships from Xiaomi, OPPO, Samsung, and Sony.\n\nKey Responsibilities\n• RTL design for 5G NR physical layer blocks: LDPC/Polar codecs, OFDM modulators, channel estimators\n• Functional verification using SystemVerilog/UVM testbenches\n• Logic synthesis and static timing analysis (STA)\n• Power analysis and optimization for mobile battery life\n• FPGA prototyping and silicon validation support during tape-out\n\nRequired Qualifications\n• Master's or PhD in EE, Communications Engineering, or Computer Engineering\n• Proficiency in Verilog or SystemVerilog\n• Understanding of 5G NR physical layer standards (3GPP Release 15+)\n• Knowledge of DSP: FFT/IFFT, FIR/IIR filters, channel coding\n• Basic Mandarin for team communication\n\nPreferred Qualifications\n• Thesis related to 5G/6G, OFDM, MIMO, or channel coding\n• Experience with UVM-based verification methodology\n• Publications at IEEE conferences (VTC, ICC, ISSCC) are a strong plus` },
      { biz: "mediatek", title: "Software Engineer — IoT Cloud Platform", type: "Full-time", salary: "65,000–85,000 TWD/month", loc: "MediaTek, Hsinchu", hours: 40, visa: true, chinese: "None", district: "Hsinchu City", deadline: "2026-08-15",
        benefits: `Compensation\n• Salary: 65,000–85,000 TWD/month\n• Annual bonus: 2–4 months\n• MediaTek stock options (TWSE:2454)\n• Remote work: 1 day/week from Day 1\n• AWS/GCP certification costs covered`,
        req: `About the Role\n\nBuild the cloud platform powering smart home devices, industrial sensors, and connected vehicles — all running MediaTek's chipsets. Process 50,000+ device events per second.\n\nWhat You Will Build\n• Device management microservices: OTA firmware updates, device shadow/twin, provisioning APIs\n• Real-time telemetry ingestion pipeline (Kafka + Flink)\n• Rule engine for device automation (smart home if-this-then-that logic)\n• REST and MQTT APIs consumed by OEM customers\n• Cloud infrastructure automation using Terraform and Helm for Kubernetes\n\nRequired Qualifications\n• 2+ years backend development experience\n• Proficiency in Go, Java, or Python\n• Hands-on experience with AWS, GCP, or Azure in production\n• Understanding of IoT protocols: MQTT, CoAP, or WebSocket\n• Docker and Kubernetes experience\n\nPreferred Qualifications\n• Familiarity with embedded Linux or device-side firmware concepts\n• AWS Certified Developer or Solutions Architect certification` },
      { biz: "mediatek", title: "R&D Intern — AI on Edge Devices", type: "Internship", salary: "30,000–40,000 TWD/month", loc: "MediaTek AI Labs, Hsinchu", hours: 40, visa: true, chinese: "None", district: "Hsinchu Science Park", deadline: "2026-05-31",
        benefits: `Internship Package\n• Monthly stipend: 30,000–40,000 TWD\n• Housing allowance: 4,500 TWD/month\n• Free shuttle bus from Hsinchu Station\n• Meal subsidy: 100 TWD/day\n• Access to MediaTek GPU cluster for experiments\n• Full-time return offer for top 20%`,
        req: `About the Role\n\nWork with MediaTek's AI Labs on optimizing neural network models for deployment on smartphones, wearables, and IoT devices — enabling powerful AI locally without cloud connectivity.\n\nWhat You Will Work On\n• Evaluate and optimize models for MediaTek's APU (AI Processing Unit)\n• Apply model compression: structured pruning, knowledge distillation, INT8/INT4 QAT\n• Profile inference latency and memory footprint on target hardware\n• Implement benchmark harnesses for accuracy vs. efficiency trade-offs\n• Survey and implement papers from CVPR, ECCV, MLSys, NeurIPS\n\nRequired Qualifications\n• Currently pursuing Master's or PhD in CS, EE, or related\n• Strong Python and hands-on PyTorch experience\n• Solid understanding of CNN/Transformer architectures\n• Ability to read and implement algorithms from academic papers\n\nPreferred Qualifications\n• Experience with model compression, NAS, or efficient inference\n• Familiarity with TFLite, ONNX, or TVM\n• Prior exposure to mobile or embedded platforms` },
      // GARENA
      { biz: "garena", title: "Live Operations Specialist — Free Fire", type: "Full-time", salary: "45,000–60,000 TWD/month", loc: "Garena Taiwan, Da'an District, Taipei", hours: 40, visa: true, chinese: "Conversational", district: "Da'an District, Taipei", deadline: "2026-06-30",
        benefits: `Compensation\n• Salary: 45,000–60,000 TWD/month\n• Annual performance bonus\n• Unlimited Garena game credits for work accounts\n• 2,000 TWD/month personal game credits\n• State-of-the-art gaming PC stations in office\n• Annual company trip (past: Japan, Thailand, Philippines)`,
        req: `About the Role\n\nPlan, execute, and analyze in-game events for Free Fire — one of the world's most downloaded mobile games with 100M+ monthly active players globally.\n\nKey Responsibilities\n• Plan weekly and monthly in-game event calendars: top-up bonuses, battle pass, cosmetic drops\n• Analyze player engagement metrics (DAU, retention, conversion) using internal dashboards and SQL\n• Localize global event content for the Taiwanese market\n• Manage community feedback channels: LINE official account, Facebook groups, PTT\n• Write in-game announcements, push notifications, and social media posts\n• Coordinate with global product teams in Singapore\n\nRequired Qualifications\n• Conversational Mandarin — essential for player community posts and local partners\n• Proficient English for collaboration with Singapore HQ\n• Analytical mindset: comfortable with spreadsheets and basic SQL\n• Strong written communication for player-facing content\n• Genuine passion for mobile gaming\n\nPreferred Qualifications\n• Prior experience in live ops, community management, or game publishing\n• Active Free Fire player with understanding of the game's meta` },
      { biz: "garena", title: "Esports Event Coordinator", type: "Part-time", salary: "180–230 TWD/hour", loc: "Garena Esports Hub, Taipei", hours: 20, visa: true, chinese: "Conversational", district: "Zhongzheng District, Taipei", deadline: "2026-06-01",
        benefits: `Compensation\n• Hourly rate: 180–230 TWD\n• Event-day bonus for major tournaments (1.5x rate)\n• Free access to all Garena esports events\n• Networking with professional esports teams and casters`,
        req: `About the Role\n\nSupport production and logistics of 50+ esports events per year — from online qualifier administration to live stadium broadcasts watched by 500,000 concurrent viewers.\n\nWhat You Will Do\n• Manage online qualifier registrations: team enrollment, bracket setup, score reporting\n• Coordinate logistics for live events: venue setup, equipment inventory, vendor communication\n• Assist broadcast team during live events: stream monitoring, social media updates\n• Compile post-event reports: viewership, player feedback, incident logs\n\nRequired Qualifications\n• Currently enrolled at a Taiwanese university\n• Conversational Mandarin for local vendors and players\n• Proficient English for Garena Singapore esports team communication\n• Ability to work occasional weekends during major events\n• Reliable, detail-oriented, calm under live broadcast pressure\n\nPreferred Qualifications\n• Prior experience organizing gaming tournaments\n• Familiarity with Twitch, YouTube Live, 17LIVE\n• Knowledge of Free Fire, LoL, VALORANT, or CS2` },
      { biz: "garena", title: "Community Manager — SEA Gaming Community", type: "Full-time", salary: "42,000–55,000 TWD/month", loc: "Garena Taiwan, Taipei", hours: 40, visa: true, chinese: "None", district: "Da'an District, Taipei", deadline: "2026-07-01",
        benefits: `Compensation\n• Salary: 42,000–55,000 TWD/month\n• Annual bonus based on community KPI achievement\n• Remote work: 2 days/week\n• Gaming peripherals provided\n• Attend 2+ international gaming events per year as Garena representative`,
        req: `About the Role\n\nManage Garena Taiwan's English-language social media channels for the international Free Fire community — Facebook (1.2M followers), Instagram, Twitter/X, and Discord. A fully English-medium role — no Mandarin required.\n\nKey Responsibilities\n• Create and schedule original English content: news posts, memes, event announcements\n• Engage with players in comments and DMs\n• Scout and onboard content creators for the ambassador program\n• Monitor community sentiment and compile monthly health reports\n• Organize online community events: art contests, prediction challenges, giveaways\n\nRequired Qualifications\n• Native-level English (C2) — entire output is in English for millions of readers\n• 1+ years managing social media channels or online communities\n• Genuine passion for gaming and familiarity with SEA gaming culture\n• Creative writing ability: posts people actually want to engage with\n\nPreferred Qualifications\n• Personal gaming content creation (YouTube/TikTok/Twitch)\n• Experience managing Discord servers with 10,000+ members\n• Knowledge of Free Fire, Mobile Legends, or other SEA mobile gaming titles` },
    ];

    for (const j of jobs) {
      await databases.createDocument(DB_ID, "Jobs", ID.unique(), {
        businessId: bizIds[j.biz],
        title: j.title,
        jobType: j.type,
        salaryRange: j.salary,
        location: j.loc,
        hoursPerWeek: j.hours,
        allowsStudentVisa: j.visa,
        chineseRequired: j.chinese,
        district: j.district,
        benefits: j.benefits,
        requirements: j.req,
        deadline: j.deadline,
        isActive: true,
      });
    }
    console.log(`  ✓ ${jobs.length} jobs created`);

    // ── 9. SCHOLARSHIPS ──────────────────────────────────────────────────────
    console.log("🎓 Creating scholarships...");
    const scholarships = [
      { name: "MOE Taiwan Scholarship 2026", source: "government", schoolId: undefined, amount: "40,000 TWD/month stipend + Full Tuition Waiver", duration: "2–4 years", coversTuition: true, coversDorm: true, coversStipend: true, minGpa: "3.0/4.0", minEnglishReq: "IELTS 6.0 / TOEFL iBT 80 / TOEIC 750", eligibleDegrees: ["Bachelor", "Master", "PhD"], eligibleCountries: ["Vietnam", "Indonesia", "Malaysia", "Thailand", "Philippines", "India", "Myanmar", "All ASEAN"], deadline: "2026-03-31", applicationUrl: "https://scholarship.moe.gov.tw", isActive: true, requirements: `Overview\nThe MOE Taiwan Scholarship is the flagship government scholarship covering full tuition, living stipend (15,000–40,000 TWD/month by level), dormitory subsidy, and round-trip airfare. In 2025, MOE awarded 1,800 scholarships to students from 62 countries.\n\nCoverage\n• Full tuition waiver for entire degree\n• Monthly stipend: 15,000 TWD (Bachelor) / 20,000 TWD (Master) / 40,000 TWD (PhD)\n• Dormitory subsidy up to 8,000 TWD/month\n• One-time arrival allowance: 20,000 TWD\n• Round-trip economy airfare (once per academic year)\n\nEligibility\n• Citizen of a country with ties to Taiwan\n• Age 40 or below\n• Not holding another government scholarship simultaneously\n• GPA: 3.0/4.0 minimum (graduate) or 70/100 (undergraduate)\n• English: IELTS 6.0 / TOEFL iBT 80 minimum\n\nRequired Documents\n• Official transcripts (notarized + translated)\n• Language proficiency certificate\n• Research proposal (Master/PhD): 2,000–3,000 words\n• Personal statement: why Taiwan, why this program\n• 2+ recommendation letters (1 from current supervisor)\n• Passport copy and health certificate\n• Professor acceptance letter (strongly recommended)\n\nSelection Process\nApplications evaluated at Taiwan MOFA office in your country → Interview (March–May) → Results (June) → Enrollment (September).\n\nKey Tip: Contact your target professor before applying — faculty endorsement significantly increases selection odds.` },
      { name: "ICDF International Higher Education Scholarship", source: "government", schoolId: undefined, amount: "25,000 TWD/month + Round-trip Airfare + Full Tuition", duration: "1–4 years", coversTuition: true, coversDorm: false, coversStipend: true, minGpa: "3.0/4.0", minEnglishReq: "IELTS 5.5 or equivalent", eligibleDegrees: ["Bachelor", "Master", "PhD"], eligibleCountries: ["Vietnam", "Indonesia", "Philippines", "Belize", "Guatemala", "Paraguay", "All ICDF partner countries"], deadline: "2026-03-15", applicationUrl: "https://www.icdf.org.tw/scholarship", isActive: true, requirements: `Overview\nThe Taiwan ICDF scholarship supports students from partner developing nations at designated Taiwanese universities. Emphasis on development-oriented fields and public service applicants.\n\nCoverage\n• Full tuition and required fees\n• Monthly living allowance: 25,000 TWD\n• Round-trip economy airfare once per academic year\n• Group health insurance\n• One-time settlement allowance: 10,000 TWD\n\nTarget Fields (Priority in 2026)\n• Agriculture and sustainable food systems\n• Public health and tropical medicine\n• Environmental engineering and water resource management\n• ICT for development\n• Business administration and trade policy\n\nEligibility\n• National of an ICDF partner country\n• Under 40 years of age\n• Minimum GPA: 3.0/4.0 (graduate) or 70% (undergraduate)\n• IELTS 5.5 or TOEFL iBT 69 minimum\n• Background in public service, government, or NGO preferred\n• Must commit to return to home country after completion\n\nApplication Route\nMust apply through home country government or ICDF partner organization — not directly through the scholarship portal.` },
      { name: "Huayu Enrichment Scholarship (HES) 2026", source: "government", schoolId: undefined, amount: "25,000 TWD/month living stipend", duration: "3, 6, or 12 months", coversTuition: false, coversDorm: false, coversStipend: true, minGpa: undefined, minEnglishReq: undefined, minChineseReq: "None required — beginners welcome", eligibleDegrees: ["Bachelor", "Master", "PhD"], eligibleCountries: ["All countries"], deadline: "2026-04-30", applicationUrl: "https://www.studyintaiwan.org/scholarship/hs", isActive: true, requirements: `Overview\nThe Huayu Enrichment Scholarship (HES) supports international students who want to learn Mandarin Chinese at a language center attached to a Taiwanese university. No degree enrollment required — designed purely for Chinese language learning.\n\nCoverage\n• Monthly stipend: 25,000 TWD (does NOT cover language center tuition)\n• Duration: 3 months, 6 months, or 12 months\n• Health insurance enrollment assistance\n\nNote: Language center tuition (approximately 30,000–50,000 TWD per semester) must be paid separately.\n\nEligible Applicants\n• Citizens of any country (no diplomatic restriction)\n• Age 18–40 at time of application\n• Must NOT be enrolled in a degree program simultaneously\n• No prior Mandarin required — complete beginners encouraged\n\nParticipating Language Centers\n• MTC at NTNU (Taipei) — most popular for international students\n• Chinese Language Division at NTU\n• NCKU Mandarin Studies Center (Tainan)\n• NTHU Chinese Language Center (Hsinchu)\n• 20+ other university-affiliated centers nationwide\n\nPro Tip: HES is a common entry point for students planning to later apply for degree scholarships. Use the time to learn Mandarin, meet professors, and strengthen future NTU/NTHU graduate school applications.` },
      { name: "NTU International Excellence Award 2026", source: "school_based", schoolId: schoolIds["ntu"], amount: "50–100% Tuition Waiver per semester", duration: "Full degree program (renewable annually)", coversTuition: true, coversDorm: false, coversStipend: false, minGpa: "3.5/4.0", minEnglishReq: "IELTS 7.0 / TOEFL iBT 100", eligibleDegrees: ["Master", "PhD"], eligibleCountries: ["All countries"], deadline: "2026-03-20", applicationUrl: "https://oia.ntu.edu.tw/scholarships", isActive: true, requirements: `Overview\nNTU's premier merit scholarship for outstanding international graduate students. No separate application needed — your admission application is automatically considered. Supports approximately 300–400 students per intake year.\n\nAward Levels\n• Full Award (100% tuition waiver): Top 5% of applicants — typically GPA 3.8+, IELTS 7.5+, strong research publications\n• Partial Award (50% tuition waiver): Approximately 15% of admitted international students\n\nEligibility\n• Must be admitted to an NTU Master's or PhD program\n• Minimum undergraduate GPA: 3.5/4.0\n• English: IELTS 7.0 or TOEFL iBT 100 minimum\n• Strong statement of purpose with clear research direction\n• 2+ strong recommendation letters from academic supervisors\n\nWhat Strengthens Your Application\n• Published or submitted research papers (strongest differentiator)\n• Email correspondence with an NTU faculty member willing to supervise you\n• Clear alignment between your interests and current NTU faculty projects\n• International academic competition awards\n\nRenewal: Maintain GPA above 3.3/4.0 (Full) or 3.0/4.0 (Partial) + remain full-time enrolled.` },
      { name: "NCKU Distinguished International Student Scholarship", source: "school_based", schoolId: schoolIds["ncku"], amount: "250,000 TWD total over 2 years", duration: "2 years (Master's)", coversTuition: true, coversDorm: true, coversStipend: false, minGpa: "3.3/4.0", minEnglishReq: "IELTS 6.0 / TOEFL iBT 79", eligibleDegrees: ["Master"], eligibleCountries: ["All countries"], deadline: "2026-04-10", applicationUrl: "https://oia.ncku.edu.tw/scholarship", isActive: true, requirements: `Overview\nAwarded to the top-performing international applicants to NCKU's English-taught Master's programs. Approximately 80–100 awards per intake year. Engineering, Science, and Technology programs receive the largest allocations.\n\nAward Value\n• Year 1: Tuition waiver (~62,000 TWD/semester × 2) + Dormitory subsidy (up to 6,000 TWD/month × 12) ≈ 196,000 TWD\n• Year 2: Same structure, contingent on GPA maintenance\n• Total value: approximately 250,000–300,000 TWD\n\nEligible Programs\n• Semiconductor and Electrophysics Engineering\n• Electrical Engineering\n• Mechanical Engineering\n• Civil and Environmental Engineering\n• Computer Science and Information Engineering\n• Business Administration (English-taught cohort)\n\nEligibility\n• Applying to one of NCKU's designated English-taught Master's programs\n• Undergraduate GPA: minimum 3.3/4.0 or 80% average\n• IELTS 6.0 / TOEFL iBT 79 / TOEIC 750\n• 2+ recommendation letters\n• Priority: students in top 20% of undergraduate class\n\nApplication: No separate form needed. Indicate interest in your NCKU admission application. OIA contacts shortlisted recipients in May.` },
      { name: "NTHU Outstanding International Student Award", source: "school_based", schoolId: schoolIds["nthu"], amount: "Full Tuition + 15,000 TWD/month living allowance", duration: "2 years (Master) / 4 years (PhD)", coversTuition: true, coversDorm: true, coversStipend: true, minGpa: "3.5/4.0", minEnglishReq: "IELTS 6.5 / TOEFL iBT 90", eligibleDegrees: ["Master", "PhD"], eligibleCountries: ["ASEAN", "South Asia", "East Africa", "All developing nations"], deadline: "2026-03-31", applicationUrl: "https://oia.nthu.edu.tw", isActive: true, requirements: `Overview\nAmong the most prestigious and comprehensive school-based scholarships in Taiwan, designed to recruit the very best STEM talent from developing nations. Approximately 40–60 awards per intake year. Most recipients rank in the top 5% of their undergraduate class.\n\nFull Coverage\n• 100% tuition waiver for full degree\n• University dormitory fee waiver (~5,500–7,000 TWD/month)\n• Monthly living allowance: 15,000 TWD/month (12 months/year)\n• One-time settlement allowance: 15,000 TWD\n• Total estimated value over 2-year Master's: 600,000–700,000 TWD\n\nPriority Research Areas\n• Semiconductor materials and devices\n• Applied AI and machine learning\n• Quantum computing and photonics\n• Sustainable energy and environmental engineering\n• Biomedical engineering and precision medicine\n\nEligibility\n• GPA 3.5/4.0 or above\n• IELTS 6.5 or TOEFL iBT 90 minimum\n• National of ASEAN, South Asian, East African, or other developing nation\n• Research output strongly preferred: papers, conference presentations, or patents\n• A faculty member at NTHU willing to supervise is essentially required\n\nApplication Timeline\nJan 10 Portal opens → Mar 31 Deadline → Apr–May Department review → Jun Award notifications → Sep Enrollment` },
      { name: "FCU International Student Grant 2026", source: "school_based", schoolId: schoolIds["fcu"], amount: "30–50% Annual Tuition Reduction", duration: "Full degree program (renewable each semester)", coversTuition: true, coversDorm: false, coversStipend: false, minGpa: "2.8/4.0", minEnglishReq: "IELTS 5.5 / TOEFL iBT 70 / TOEIC 600", eligibleDegrees: ["Bachelor", "Master"], eligibleCountries: ["All countries"], deadline: "2026-03-15", applicationUrl: "https://ic.fcu.edu.tw/scholarship", isActive: true, requirements: `Overview\nOne of the most accessible scholarships in Taiwan, automatically considered for all FCU International College applicants. FCU awarded grants to over 60% of incoming international students in 2025.\n\nAward Tiers\n• Tier A — 50% tuition reduction: GPA 3.5+, IELTS 6.5+\n• Tier B — 40% tuition reduction: GPA 3.0–3.49, IELTS 6.0–6.49\n• Tier C — 30% tuition reduction: GPA 2.8–2.99, IELTS 5.5–5.99\n\nFor reference: FCU IC tuition is approximately 76,000–92,000 TWD/year. A Tier A grant saves ~40,000–46,000 TWD/year.\n\nApplication\nNo separate form. Complete the International Student Grant section in your FCU admission application portal. Results included in your official acceptance letter.\n\nRenewal: Maintain semester GPA above 2.8/4.0 and complete minimum credit load each semester.\n\nAdditional Support\n• FCU Work-Study Program: on-campus positions at 180–200 TWD/hour available to grant recipients\n• Emergency financial assistance fund for unexpected hardships` },
      { name: "Taiwan STEM Excellence Fellowship 2026", source: "private", schoolId: undefined, amount: "Full tuition + dorm + 20,000 TWD/month stipend (~600,000 TWD total)", duration: "2 years (Master's degree)", coversTuition: true, coversDorm: true, coversStipend: true, minGpa: "3.7/4.0", minEnglishReq: "IELTS 7.0 / TOEFL iBT 100", eligibleDegrees: ["Master", "PhD"], eligibleCountries: ["Vietnam", "Indonesia", "Thailand", "Malaysia", "Singapore", "India", "Bangladesh"], deadline: "2026-02-28", applicationUrl: "https://www.studyintaiwan.org", isActive: true, requirements: `Overview\nFunded by the Taiwan STEM Foundation — a consortium of TSMC, MediaTek, Delta Electronics, and Foxconn — to attract exceptional STEM talent from South and Southeast Asia. Only 30 awards made annually across all eligible countries. The most competitive privately funded scholarship in Taiwan.\n\nFull Package\n• 100% tuition waiver at one of 5 eligible universities (NTU, NTHU, NCKU, NYCU, NTUST)\n• Monthly living stipend: 20,000 TWD for 24 months\n• University dormitory fees fully covered\n• One-time arrival allowance: 25,000 TWD\n• Round-trip economy airfare once per year\n• Mandatory 3-month paid industry internship at TSMC Foundation member company (35,000–45,000 TWD/month during internship)\n• Total estimated value: 580,000–680,000 TWD (excluding internship income)\n\nEligible Fields\n• Electrical Engineering (all specializations)\n• Computer Science and Information Engineering\n• Materials Science and Engineering\n• Chemical Engineering\n• Mechanical Engineering (semiconductor focus)\n• Applied Physics (semiconductor devices)\n\nStrict Requirements\n• GPA: 3.7/4.0 or above (class rank top 5% preferred)\n• IELTS 7.0 or TOEFL iBT 100 minimum\n• At least 1 published/accepted paper at indexed journal or international conference — OR significant research thesis\n• Detailed research proposal: 4,000–6,000 words\n• 3 recommendation letters (at least 2 from research supervisors)\n• 5-minute video introduction\n\nDeadline: February 28, 2026` },
    ];

    for (const s of scholarships) {
      const { minChineseReq, ...rest } = s as any;
      await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
        ...rest,
        minChineseReq: minChineseReq ?? undefined,
      });
    }
    console.log(`  ✓ ${scholarships.length} scholarships created`);

    // ── 10. COMMUNITY POSTS ──────────────────────────────────────────────────
    console.log("📝 Creating community posts...");
    const authorId = uid.student ?? "seed_author";
    const posts = [
      { authorName: "Minh Tuan Nguyen", authorRole: "student", title: "How I Got the MOE Taiwan Scholarship — Complete Guide for Vietnamese Students", slug: `moe-scholarship-guide-vietnamese-${Date.now()}`, excerpt: "I applied 3 times before finally getting the MOE Taiwan Scholarship to study at NTU. Here's everything I wish I knew from the start.", tags: ["scholarship", "MOE", "NTU", "Vietnam", "tips"], publishedAt: new Date(Date.now() - 45 * 86400000).toISOString(), viewCount: 2340,
        content: `## My MOE Taiwan Scholarship Journey\n\nAfter **3 attempts**, I finally secured the MOE Taiwan Scholarship to pursue my Master's in Computer Science at NTU.\n\n### What the MOE Scholarship Covers\n\n• **Full tuition waiver** for your entire degree\n• **40,000 TWD/month** living stipend\n• **Round-trip airfare** reimbursement once per year\n• **Dormitory fee subsidy** up to 8,000 TWD/month\n\n### My #1 Tip: Contact Professors First\n\nThe MOE review panel gives significant weight to whether a professor at your target school is willing to supervise you. Email format that worked for me:\n\n"Dear Professor [Name], I am applying to [University] for Fall 2026 and am very interested in your research on [specific topic]. I read your paper [Paper Title] and believe my background could contribute to [specific aspect]. I am applying for the MOE Taiwan Scholarship. Would you be open to a brief video call?"\n\nI sent 15 emails. 4 responded. 1 agreed. That 1 response made all the difference.\n\n### Documents Checklist\n\n• Official transcripts (notarized + translated)\n• Language scores (IELTS 6.0+ or TOEFL 80+)\n• Research proposal (2,000–3,000 words)\n• 3 recommendation letters\n• Personal statement\n• Professor acceptance letter (unofficial email printout is fine)\n\n### The Interview\n\nThe MOFA interview is 20–30 minutes in English. Common questions:\n• Why Taiwan and not other countries?\n• What will you bring back to your home country?\n• Describe your research proposal in 2 minutes.\n\n**Be honest. Be specific. Show you know Taiwan.** Good luck!` },
      { authorName: "Sarah Chen", authorRole: "student", title: "Life as an International Student in Taipei: 6-Month Reality Check", slug: `taipei-international-student-6months-${Date.now() + 1}`, excerpt: "Six months in, here's my honest take on studying in Taipei — the good, the challenging, and everything in between.", tags: ["taipei", "student life", "budget", "food", "community"], publishedAt: new Date(Date.now() - 32 * 86400000).toISOString(), viewCount: 1870,
        content: `## Six Months in Taipei: An Honest Review\n\nI'm a Malaysian student doing my Master's in Global MBA at NTU. Here's my most honest take after 6 months.\n\n### What's Actually Great\n\n**The food is incredible — and cheap.** A full meal at a local restaurant or night market stall costs 60–100 TWD ($2–3 USD). I spend about 6,000–8,000 TWD/month on food without even trying to save.\n\n**Public transport is world-class.** The MRT is clean, punctual, and extensive. A monthly student pass is only 1,280 TWD. YouBike costs 5 TWD for the first 30 minutes.\n\n**Safety.** Taipei is one of the safest cities in Asia. I walk home at 2 AM and never feel unsafe.\n\n### Budget Breakdown (Monthly)\n\n• Room rent (near NTU): 8,000–12,000 TWD\n• Food: 6,000–8,000 TWD\n• Transport: 1,500 TWD\n• Phone plan: 499 TWD\n• Entertainment: 2,000–3,000 TWD\n• **Total: ~18,000–24,500 TWD**\n\n### The Challenges\n\n**The language barrier is real.** Even with English signs on campus, daily life requires basic Mandarin. Download Google Translate's offline Chinese pack.\n\n**Finding housing is stressful.** Join the NTU International Students Facebook group — people post housing leads there frequently.\n\n### My 3 Recommendations\n\n1. Learn 50 basic Mandarin phrases before you arrive\n2. Get the EasyCard on Day 1\n3. Join at least one club in your first month — it changes everything` },
      { authorName: "National Taiwan University", authorRole: "school", title: "NTU Fall 2026 Admissions: What We Look For in International Applicants", slug: `ntu-fall-2026-admissions-guide-${Date.now() + 2}`, excerpt: "From the NTU Office of International Affairs — an honest breakdown of what makes a strong international applicant.", tags: ["NTU", "admissions", "tips", "application", "Fall 2026"], publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(), viewCount: 3210,
        content: `## NTU Fall 2026: What Makes a Strong Application\n\nAs the NTU Office of International Affairs, we want to share what genuinely makes candidates stand out.\n\n### What We Actually Prioritize\n\n1. **Research fit with faculty** (most important)\n2. **Quality of research proposal**\n3. **Recommendation letters** (specificity matters over prestige)\n4. **English proficiency** (threshold requirement, not differentiator)\n5. **Academic GPA** (context-dependent)\n\n### The Research Proposal\n\nYour proposal should:\n• Be 2,000–3,000 words, not longer\n• Reference **recent NTU faculty publications** — this shows you've done homework\n• Describe your preliminary work or relevant experience\n• Outline a realistic timeline and methodology\n\nWe see many proposals that say "I want to research AI." That tells us nothing. Show us you understand the landscape.\n\n### Contacting Professors\n\nWe **strongly recommend** emailing potential supervisors before submitting your formal application. Do not send mass emails. Show genuine interest in their specific work.\n\n### English Proficiency\n\nOur minimums:\n• IELTS 6.5 (most programs)\n• TOEFL iBT 90 (most programs)\n• GMAT/GRE required for MBA and some business programs\n\nMeeting the minimum makes you eligible — not competitive. Strong applicants typically score 7.0+ IELTS.\n\n### Open Days 2026\n\nVirtual information sessions:\n• January 15 — Graduate Programs Overview\n• February 12 — Scholarship Q&A\n• March 5 — Lab Tours and Faculty Introductions\n\nRegister at oia.ntu.edu.tw. We hope to see you at NTU in September!` },
      { authorName: "TSMC Human Resources", authorRole: "business", title: "What TSMC Looks for in International Intern Candidates", slug: `tsmc-intern-hiring-international-students-${Date.now() + 3}`, excerpt: "TSMC welcomed over 200 international interns in 2025. Here's what makes candidates stand out.", tags: ["TSMC", "internship", "semiconductor", "career", "hiring"], publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(), viewCount: 1654,
        content: `## How to Stand Out as a TSMC International Intern Candidate\n\nIn 2025, we received over 8,000 applications for 200 international intern slots. Here's what our recruitment team looks for.\n\n### Roles We Recruit Internationally\n\n• Process Integration & Development\n• Device Engineering\n• Quality & Reliability\n• Software Engineering (EDA, Automation, AI/ML)\n• Data Science & Analytics\n\nFor international students, **EDA Software** and **AI/ML Research** roles have the most English-friendly environments.\n\n### What Makes a Strong Candidate\n\n**Technical depth over breadth.** We don't need someone who has touched 15 technologies. A candidate who has written a thesis on process variation modeling is more compelling than someone with "exposure" to 10 semiconductor topics.\n\n**Research track record.** Papers published or conference presentations carry significant weight for PhD intern candidates.\n\n### The Interview Process\n\n1. CV screening — 2 weeks after application close\n2. Technical phone screen — 45 minutes\n3. On-site or virtual technical interview — 90 minutes\n4. HR fit interview — 30 minutes\n5. Offer decision — 2–3 weeks after final round\n\n### Salary (2025 data)\n\n• AI/ML Research Intern: 35,000–45,000 TWD/month\n• Process Integration Intern: 30,000–38,000 TWD/month\n• Software Engineering Intern: 38,000–48,000 TWD/month\n• Plus: shuttle bus, meal subsidy 150 TWD/day, housing allowance 5,000 TWD/month` },
      { authorName: "Kevin Wu", authorRole: "student", title: "Learning Mandarin in Taiwan: From Zero to HSK 3 in 12 Months", slug: `learning-mandarin-taiwan-zero-to-hsk3-${Date.now() + 4}`, excerpt: "I arrived knowing zero Mandarin. One year later, I passed HSK 3 and can hold real conversations. Here's the exact method.", tags: ["Mandarin", "language", "HSK", "study tips", "Taiwan"], publishedAt: new Date(Date.now() - 8 * 86400000).toISOString(), viewCount: 987,
        content: `## From Zero to HSK 3 in 12 Months\n\nWhen I arrived in Taiwan for my Master's, I genuinely knew zero Mandarin. One year later, I passed HSK 3 and can navigate daily life and hold basic conversations.\n\n### Month 1–2: Survival Mode\n\nI focused exclusively on practical survival phrases — not tones, not grammar.\n\n**Week 1 priority list:**\n• Numbers 1–100\n• "How much?" (多少錢?)\n• "Where is...?" (在哪裡?)\n• "Excuse me / Sorry" (不好意思)\n\n### Month 3–6: Building a Foundation\n\nFree resources that worked:\n1. **Pleco app** — Best Chinese dictionary. Use it constantly.\n2. **ChinesePod** (free tier) — Excellent listening practice\n3. **HelloChinese app** — Gamified, good for characters\n4. **iTalki** — Language exchange partner (free — trade English lessons)\n\n**My daily routine (1 hour):**\n• 20 min: Anki flashcards (HSK 2 deck)\n• 20 min: ChinesePod podcast\n• 20 min: Language exchange\n\n### Month 6–12: Immersion\n\n• Changed my phone to Traditional Chinese\n• Stopped going to English-menu restaurants\n• Joined a Taiwanese hiking group\n• Watched Taiwanese variety shows with Chinese subtitles\n\n### My Honest Assessment\n\nMandarin is hard. But Taiwan is the **best possible environment** to learn — locals are incredibly patient and appreciate your effort. Start Day 1.` },
      { authorName: "MediaTek Inc.", authorRole: "business", title: "MediaTek Internship Program 2026: Applications Now Open", slug: `mediatek-internship-2026-open-${Date.now() + 5}`, excerpt: "MediaTek's 2026 International Internship Program is now accepting applications. 30,000–45,000 TWD/month.", tags: ["MediaTek", "internship", "semiconductor", "IC design", "Hsinchu", "2026"], publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(), viewCount: 1102,
        content: `## MediaTek 2026 International Internship Program\n\nMediaTek is recruiting Master's and PhD students for 3–6 month internships at our Hsinchu headquarters.\n\n### Open Positions\n\n**1. AI on Edge Devices Research Intern**\nTeam: AI Labs | Duration: 4–6 months | Salary: 38,000–45,000 TWD/month\n\nWork on model optimization for deployment on MediaTek's Dimensity chipsets: model compression, quantization-aware training, and on-device inference benchmarking.\n\nRequirements: Master/PhD in CS or EE; experience with PyTorch, TFLite, or ONNX.\n\n**2. IC Design Intern — 5G Modem Frontend**\nTeam: Wireless Communications | Duration: 3–6 months | Salary: 35,000–42,000 TWD/month\n\nRTL design and verification for next-generation 5G NR baseband architecture.\n\nRequirements: Master/PhD in EE; proficiency in VHDL or Verilog; familiarity with 5G NR standards.\n\n**3. Software Engineering Intern — IoT Platform**\nTeam: IoT Business Unit | Duration: 3–6 months | Salary: 32,000–40,000 TWD/month\n\nCloud-connected features for MediaTek's smart home and IoT platform using Golang and AWS.\n\nRequirements: Bachelor/Master in CS; experience in Go, Python, or Linux systems.\n\n### Benefits for International Interns\n\n• Housing allowance: 5,000 TWD/month\n• Free shuttle from Hsinchu Station\n• Meal subsidy: 100 TWD/day\n• Full-time conversion for outstanding interns\n\n**Application Deadline: April 30, 2026**\n\nApply via UniLink Jobs or careers.mediatek.com. Questions: campus.recruit@mediatek.com` },
    ];

    for (const p of posts) {
      await databases.createDocument(DB_ID, "Posts", ID.unique(), {
        authorId,
        authorName: p.authorName,
        authorRole: p.authorRole,
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        tags: p.tags,
        status: "approved",
        publishedAt: p.publishedAt,
        viewCount: p.viewCount,
      });
    }
    console.log(`  ✓ ${posts.length} community posts created`);

    // ── 11. STUDENT PROFILE ──────────────────────────────────────────────────
    if (uid.student) {
      try {
        await databases.createDocument(DB_ID, "Students", ID.unique(), {
          accountId: uid.student,
          fullName: "Nguyễn Mạnh Hùng",
          nationality: "Vietnam",
          highestEducation: "Bachelor of Engineering — Hanoi University of Science and Technology",
          englishLevel: "IELTS 7.5",
          chineseLevel: "TOCFL Band B2",
          skills: ["Machine Learning", "React", "Next.js", "TypeScript", "Python", "PyTorch"],
          gpa: "3.82/4.0",
          targetDegree: "Master",
          targetCityTaiwan: "Taipei",
          hasPassport: true,
          workPermitStatus: "approved",
        });
        console.log("  ✓ Student profile created");
      } catch (e) { /* may already exist */ }
    }

    revalidatePath("/");
    revalidatePath("/schools");
    revalidatePath("/scholarships");
    revalidatePath("/jobs");
    revalidatePath("/community");
    revalidatePath("/portal");

    console.log("🎉 Full reset & seed complete!");
    return { success: true };
  } catch (error) {
    console.error("❌ Reset failed:", error);
    return { success: false, error: String(error) };
  }
}

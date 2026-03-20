"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../server";
import { revalidatePath } from "next/cache";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function seedPlatformData() {
  const { users, databases } = await createAdminClient();

  try {
    console.log("🚀 Starting Rich Seed Process...");

    // ─── 1. USERS ─────────────────────────────────────────────────────────────
    const usersData = [
      { email: "admin@unilink.com",    password: "Unilink123!", name: "UniLink Admin",    role: "admin"    },
      { email: "student@unilink.com",  password: "Unilink123!", name: "Manh Hung Nguyen", role: "student"  },
      { email: "school@unilink.com",   password: "Unilink123!", name: "NTU Administrator",role: "school"   },
      { email: "business@unilink.com", password: "Unilink123!", name: "TSMC HR",          role: "business" },
    ];

    const createdUsers: Record<string, string> = {};
    for (const u of usersData) {
      try {
        const existing = await users.list([Query.equal("email", u.email)]);
        let userId: string;
        if (existing.total > 0) {
          userId = existing.users[0].$id;
        } else {
          const newUser = await users.create(ID.unique(), u.email, undefined, u.password, u.name);
          userId = newUser.$id;
          await users.updatePrefs(userId, { role: u.role });
        }
        createdUsers[u.role] = userId;
      } catch (e) { console.error(`User ${u.email}:`, e); }
    }

    // ─── 2. SYSTEM CONFIGS ────────────────────────────────────────────────────
    const configs = [
      { key: "site_name",          value: "UniLink Taiwan" },
      { key: "site_tagline",       value: "Connect. Study. Work." },
      { key: "contact_email",      value: "support@unilink.tw" },
      { key: "max_applications",   value: "10" },
      { key: "featured_schools",   value: "6" },
      { key: "maintenance_mode",   value: "false" },
      { key: "scholarship_season", value: "Spring 2026" },
    ];
    for (const c of configs) {
      try {
        const ex = await databases.listDocuments(DB_ID, "System_Configs", [Query.equal("key", c.key)]);
        if (ex.total === 0) {
          await databases.createDocument(DB_ID, "System_Configs", ID.unique(), c);
        }
      } catch (e) { /* skip */ }
    }

    // ─── 3. SCHOOLS ───────────────────────────────────────────────────────────
    const schoolsData = [
      {
        id: "school_ntu",
        ownerId: createdUsers.school,
        schoolName: "National Taiwan University (NTU)",
        website: "https://www.ntu.edu.tw",
        contactEmail: "admission@ntu.edu.tw",
        city: "Taipei",
        description: "National Taiwan University is Taiwan's most prestigious university and consistently ranks among Asia's top institutions. Founded in 1928, NTU offers world-class research facilities, diverse English-taught programs, and a vibrant international student community in the heart of Taipei. With over 33,000 students from 80+ countries, NTU is the gateway to Taiwan's academic excellence.",
        ranking: "#1 in Taiwan · QS Top 100 Asia",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/National_Taiwan_University_logo.svg/1200px-National_Taiwan_University_logo.svg.png",
      },
      {
        id: "school_ncku",
        ownerId: createdUsers.school,
        schoolName: "National Cheng Kung University (NCKU)",
        website: "https://www.ncku.edu.tw",
        contactEmail: "intl@ncku.edu.tw",
        city: "Tainan",
        description: "NCKU is a leading comprehensive research university in Southern Taiwan, internationally recognized for Engineering, Science, Medicine, and Architecture. With strong industry ties to the Southern Taiwan Science Park and TSMC, NCKU graduates are highly sought after. The campus is in Tainan — Taiwan's cultural capital, with living costs 30% lower than Taipei.",
        ranking: "#2 in Taiwan · QS Top 200 Asia",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/National_Cheng_Kung_University_Logo.svg/1024px-National_Cheng_Kung_University_Logo.svg.png",
      },
      {
        id: "school_nthu",
        ownerId: createdUsers.school,
        schoolName: "National Tsing Hua University (NTHU)",
        website: "https://www.nthu.edu.tw",
        contactEmail: "oia@nthu.edu.tw",
        city: "Hsinchu",
        description: "NTHU is one of Asia's most distinguished STEM universities, located in Hsinchu — Taiwan's Silicon Valley. With direct partnerships with TSMC, MediaTek, and hundreds of tech firms, NTHU students have unparalleled access to internships and research collaborations. The university consistently ranks in the global top 200 for Engineering & Technology.",
        ranking: "#3 in Taiwan · QS Top 200 World",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/NTHU_seal.svg/800px-NTHU_seal.svg.png",
      },
      {
        id: "school_nycu",
        ownerId: createdUsers.school,
        schoolName: "National Yang Ming Chiao Tung University (NYCU)",
        website: "https://www.nycu.edu.tw",
        contactEmail: "admission@nycu.edu.tw",
        city: "Hsinchu",
        description: "NYCU was formed from the merger of two legendary institutions — National Chiao Tung University (NCTU) and National Yang-Ming University. The combined powerhouse now offers programs in Computer Science, Electrical Engineering, Medicine, and Biomedical Engineering. Its Hsinchu campus sits at the heart of the semiconductor industry ecosystem.",
        ranking: "#4 in Taiwan · Top 10 Asia for EE",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/National_Yang_Ming_Chiao_Tung_University_logo.svg/800px-National_Yang_Ming_Chiao_Tung_University_logo.svg.png",
      },
      {
        id: "school_fcu",
        ownerId: createdUsers.school,
        schoolName: "Feng Chia University (FCU)",
        website: "https://www.fcu.edu.tw",
        contactEmail: "oic@fcu.edu.tw",
        city: "Taichung",
        description: "Feng Chia University is one of Taiwan's most internationally active private universities, welcoming over 3,000 international students annually. FCU is renowned for its innovative Business and Engineering programs, a dedicated International College with 30+ English-taught degree programs, and a prime location near Taichung's vibrant night market culture.",
        ranking: "#1 Private University · Best International Environment",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/zh/thumb/3/36/Feng_Chia_University_logo.svg/1200px-Feng_Chia_University_logo.svg.png",
      },
      {
        id: "school_tku",
        ownerId: createdUsers.school,
        schoolName: "Tamkang University (TKU)",
        website: "https://www.tku.edu.tw",
        contactEmail: "oia@tku.edu.tw",
        city: "New Taipei",
        description: "Founded in 1950, Tamkang University is one of Taiwan's oldest and most respected private universities with a beautiful campus in New Taipei's Tamsui district. Known for its International Affairs and Business programs, TKU has a global alumni network spanning 80 countries. The Tamsui campus offers stunning ocean views and easy MRT access to Taipei city center.",
        ranking: "Top Private University · Best Campus",
        hasDorm: true,
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/zh/thumb/f/f4/Tamkang_University_Seal.svg/800px-Tamkang_University_Seal.svg.png",
      },
    ];

    const schoolIds: Record<string, string> = {};
    for (const s of schoolsData) {
      try {
        const ex = await databases.listDocuments(DB_ID, "Schools", [Query.equal("schoolName", s.schoolName)]);
        if (ex.total === 0) {
          const { id, ...data } = s;
          const doc = await databases.createDocument(DB_ID, "Schools", ID.unique(), data);
          schoolIds[id] = doc.$id;
        } else {
          schoolIds[s.id] = ex.documents[0].$id;
        }
      } catch (e) { console.error("School error:", e); }
    }

    // ─── 4. ADMISSION TERMS & PROGRAMS ────────────────────────────────────────
    const termsData = [
      { schoolKey: "school_ntu", termName: "Fall 2026 Graduate Admissions", start: "2026-01-05", end: "2026-03-20", intake: "September 2026", notes: "Full scholarship support available for top applicants." },
      { schoolKey: "school_ntu", termName: "Spring 2026 International Exchange", start: "2025-09-01", end: "2025-10-31", intake: "February 2026", notes: "Exchange program — no tuition. Must be nominated by home university." },
      { schoolKey: "school_ncku", termName: "International Admissions Fall 2026", start: "2026-01-20", end: "2026-04-10", intake: "September 2026", notes: "Engineering and Science programs prioritized." },
      { schoolKey: "school_nthu", termName: "NTHU International Program Fall 2026", start: "2026-01-10", end: "2026-03-31", intake: "September 2026", notes: "STEM-focused. Strong MOE scholarship pipeline." },
      { schoolKey: "school_nycu", termName: "NYCU Graduate Admissions 2026", start: "2026-02-01", end: "2026-04-30", intake: "September 2026", notes: "EE and CS programs in high demand." },
      { schoolKey: "school_fcu", termName: "FCU International College Fall 2026", start: "2025-11-01", end: "2026-03-15", intake: "September 2026", notes: "30+ fully English-taught degree programs." },
      { schoolKey: "school_tku", termName: "TKU International Admissions 2026", start: "2026-01-01", end: "2026-04-15", intake: "September 2026", notes: "Priority given to ASEAN students." },
    ];

    const termIds: Record<string, string> = {};
    for (const t of termsData) {
      try {
        const schoolId = schoolIds[t.schoolKey];
        if (!schoolId) continue;
        const ex = await databases.listDocuments(DB_ID, "Admission_Terms", [
          Query.equal("schoolId", schoolId),
          Query.equal("termName", t.termName),
        ]);
        if (ex.total === 0) {
          const doc = await databases.createDocument(DB_ID, "Admission_Terms", ID.unique(), {
            schoolId,
            termName: t.termName,
            applyStartDate: t.start,
            applyEndDate: t.end,
            intakeMonth: t.intake,
            notes: t.notes,
          });
          termIds[`${t.schoolKey}_${t.termName}`] = doc.$id;
        } else {
          termIds[`${t.schoolKey}_${t.termName}`] = ex.documents[0].$id;
        }
      } catch (e) { console.error("Term error:", e); }
    }

    // Programs data
    const programsData = [
      // NTU Fall 2026
      { termKey: "school_ntu_Fall 2026 Graduate Admissions", dept: "Computer Science & Information Engineering", degree: "Master", lang: "English", tuition: "62,400 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","2 Recommendation Letters","Statement of Purpose","CV/Resume"], url: "https://www.csie.ntu.edu.tw/admission" },
      { termKey: "school_ntu_Fall 2026 Graduate Admissions", dept: "Global MBA (GMBA)", degree: "Master", lang: "English", tuition: "130,000 TWD/semester", minEng: "GMAT 600+ or GRE equivalent", dorm: true, appFee: "2,500 TWD", docs: ["Transcripts","GMAT/GRE Score","3 Recommendation Letters","SOP","Work Experience Certificate"], url: "https://gmba.ntu.edu.tw" },
      { termKey: "school_ntu_Fall 2026 Graduate Admissions", dept: "Electrical Engineering", degree: "PhD", lang: "English", tuition: "55,500 TWD/semester", minEng: "IELTS 7.0 / TOEFL 100", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","Research Proposal","3 Recommendation Letters","CV/Resume"], url: "https://www.ee.ntu.edu.tw" },
      { termKey: "school_ntu_Fall 2026 Graduate Admissions", dept: "Finance & Economics", degree: "Master", lang: "English", tuition: "68,000 TWD/semester", minEng: "IELTS 6.5", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","Statement of Purpose","2 Recommendation Letters"], url: "https://www.fin.ntu.edu.tw" },
      // NCKU Fall 2026
      { termKey: "school_ncku_International Admissions Fall 2026", dept: "Semiconductor & Electrophysics Engineering", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0 / TOEFL 80", dorm: true, appFee: "1,500 TWD", docs: ["Transcripts","CV/Resume","2 Recommendation Letters","SOP"], url: "https://www.ncku.edu.tw/admission" },
      { termKey: "school_ncku_International Admissions Fall 2026", dept: "Mechanical Engineering", degree: "Master", lang: "English", tuition: "56,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,500 TWD", docs: ["Transcripts","Research Interest Statement","CV/Resume"], url: "https://www.me.ncku.edu.tw" },
      { termKey: "school_ncku_International Admissions Fall 2026", dept: "Business Administration", degree: "Master", lang: "English", tuition: "72,000 TWD/semester", minEng: "IELTS 6.5", dorm: false, appFee: "2,000 TWD", docs: ["Transcripts","3 Recommendation Letters","Work Experience (preferred)"], url: "https://www.ba.ncku.edu.tw" },
      // NTHU Fall 2026
      { termKey: "school_nthu_NTHU International Program Fall 2026", dept: "Computer Science", degree: "PhD", lang: "English", tuition: "54,000 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","Research Proposal","3 Recommendation Letters","Publication list (if any)"], url: "https://www.cs.nthu.edu.tw" },
      { termKey: "school_nthu_NTHU International Program Fall 2026", dept: "Materials Science & Engineering", degree: "Master", lang: "English", tuition: "57,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,800 TWD", docs: ["Transcripts","SOP","CV/Resume"], url: "https://www.mse.nthu.edu.tw" },
      { termKey: "school_nthu_NTHU International Program Fall 2026", dept: "Industrial Engineering & Engineering Management", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0", dorm: true, appFee: "1,800 TWD", docs: ["Transcripts","SOP","2 Recommendation Letters"], url: "https://www.ie.nthu.edu.tw" },
      // NYCU Fall 2026
      { termKey: "school_nycu_NYCU Graduate Admissions 2026", dept: "Electrical & Computer Engineering", degree: "Master", lang: "English", tuition: "60,000 TWD/semester", minEng: "IELTS 6.5 / TOEFL 90", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","SOP","2 Recommendation Letters"], url: "https://www.ee.nycu.edu.tw" },
      { termKey: "school_nycu_NYCU Graduate Admissions 2026", dept: "Computer Science", degree: "Master", lang: "English", tuition: "62,000 TWD/semester", minEng: "IELTS 6.5", dorm: true, appFee: "2,000 TWD", docs: ["Transcripts","SOP","CV/Resume","2 Recommendation Letters"], url: "https://www.cs.nycu.edu.tw" },
      { termKey: "school_nycu_NYCU Graduate Admissions 2026", dept: "Biomedical Engineering", degree: "Master", lang: "English", tuition: "58,000 TWD/semester", minEng: "IELTS 6.0 / TOEFL 79", dorm: true, appFee: "1,800 TWD", docs: ["Transcripts","Research Interest Statement","CV/Resume"], url: "https://www.bme.nycu.edu.tw" },
      // FCU Fall 2026
      { termKey: "school_fcu_FCU International College Fall 2026", dept: "International Business Administration", degree: "Master", lang: "English", tuition: "88,000 TWD/year", minEng: "IELTS 5.5 / TOEFL 72", dorm: true, appFee: "1,000 TWD", docs: ["Transcripts","Motivation Letter","Copy of Passport"], url: "https://ic.fcu.edu.tw" },
      { termKey: "school_fcu_FCU International College Fall 2026", dept: "Information Engineering & Computer Science", degree: "Bachelor", lang: "English", tuition: "76,000 TWD/year", minEng: "IELTS 5.5", dorm: true, appFee: "1,000 TWD", docs: ["High School Diploma","Transcripts","Passport Copy"], url: "https://ic.fcu.edu.tw" },
      { termKey: "school_fcu_FCU International College Fall 2026", dept: "Data Science & Artificial Intelligence", degree: "Master", lang: "English", tuition: "92,000 TWD/year", minEng: "IELTS 6.0", dorm: true, appFee: "1,000 TWD", docs: ["Transcripts","SOP","2 Recommendation Letters"], url: "https://ic.fcu.edu.tw" },
      // TKU Fall 2026
      { termKey: "school_tku_TKU International Admissions 2026", dept: "International Affairs & Strategic Studies", degree: "Master", lang: "English", tuition: "75,000 TWD/year", minEng: "IELTS 6.0 / TOEFL 80", dorm: true, appFee: "1,500 TWD", docs: ["Transcripts","SOP","2 Recommendation Letters","CV/Resume"], url: "https://www.tku.edu.tw/admission" },
      { termKey: "school_tku_TKU International Admissions 2026", dept: "Business Management", degree: "Master", lang: "English", tuition: "78,000 TWD/year", minEng: "IELTS 5.5", dorm: true, appFee: "1,500 TWD", docs: ["Transcripts","SOP","Passport Copy"], url: "https://www.tku.edu.tw/admission" },
    ];

    for (const p of programsData) {
      try {
        const termId = termIds[p.termKey];
        if (!termId) continue;
        const ex = await databases.listDocuments(DB_ID, "Programs", [
          Query.equal("termId", termId),
          Query.equal("departmentName", p.dept),
        ]);
        if (ex.total === 0) {
          await databases.createDocument(DB_ID, "Programs", ID.unique(), {
            termId,
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
      } catch (e) { console.error("Program error:", e); }
    }

    // ─── 5. SCHOLARSHIPS ──────────────────────────────────────────────────────
    const scholarshipsData = [
      {
        name: "MOE Taiwan Scholarship 2026",
        source: "government",
        schoolId: null,
        amount: "40,000 TWD/month stipend + Full Tuition Waiver",
        duration: "2–4 years (degree dependent)",
        coversTuition: true,
        coversDorm: true,
        coversStipend: true,
        minGpa: "3.0/4.0",
        minEnglishReq: "IELTS 6.0 or TOEFL 80",
        eligibleDegrees: ["Bachelor", "Master", "PhD"],
        eligibleCountries: ["Vietnam", "Indonesia", "Malaysia", "Thailand", "Philippines", "India", "All ASEAN"],
        requirements: "Must be a citizen of a country with diplomatic ties to Taiwan. Cannot hold another government scholarship simultaneously. Maintain GPA of 3.0+ per semester. Full-time student status required.",
        deadline: "2026-03-31",
        applicationUrl: "https://scholarship.moe.gov.tw",
        isActive: true,
      },
      {
        name: "ICDF International Higher Education Scholarship",
        source: "government",
        schoolId: null,
        amount: "25,000 TWD/month + Airfare + Tuition",
        duration: "1–4 years",
        coversTuition: true,
        coversDorm: false,
        coversStipend: true,
        minGpa: "3.0/4.0",
        minEnglishReq: "IELTS 5.5 or equivalent",
        eligibleDegrees: ["Bachelor", "Master", "PhD"],
        eligibleCountries: ["Vietnam", "Indonesia", "Philippines", "Belize", "Guatemala", "Honduras", "Nicaragua", "Paraguay", "All ICDF partner countries"],
        requirements: "Must apply through Taiwan ICDF partner institutions in your home country. Agreement to return to home country after completion. Candidates in public service or development-related fields prioritized.",
        deadline: "2026-03-15",
        applicationUrl: "https://www.icdf.org.tw/scholarship",
        isActive: true,
      },
      {
        name: "Huayu Enrichment Scholarship (HES)",
        source: "government",
        schoolId: null,
        amount: "25,000 TWD/month",
        duration: "3–12 months",
        coversTuition: false,
        coversDorm: false,
        coversStipend: true,
        minGpa: null,
        minEnglishReq: null,
        minChineseReq: "Basic Mandarin preferred",
        eligibleDegrees: ["Bachelor", "Master", "PhD"],
        eligibleCountries: ["All countries"],
        requirements: "For students who want to learn Mandarin Chinese in Taiwan. Must enroll in a Mandarin language center at a recognized university. No degree program enrollment required. Age 18–40.",
        deadline: "2026-04-30",
        applicationUrl: "https://www.studyintaiwan.org/scholarship/hs",
        isActive: true,
      },
      {
        name: "NTU International Excellence Award",
        source: "school_based",
        schoolId: schoolIds["school_ntu"],
        amount: "50–100% Tuition Waiver",
        duration: "Full degree program",
        coversTuition: true,
        coversDorm: false,
        coversStipend: false,
        minGpa: "3.5/4.0",
        minEnglishReq: "IELTS 7.0",
        eligibleDegrees: ["Master", "PhD"],
        eligibleCountries: ["All countries"],
        requirements: "Open to all admitted NTU international graduate students with outstanding academic records. Automatic consideration upon admission — no separate application needed. Renewable annually based on academic performance.",
        deadline: "2026-03-20",
        applicationUrl: "https://oia.ntu.edu.tw/scholarships",
        isActive: true,
      },
      {
        name: "NCKU Distinguished International Student Scholarship",
        source: "school_based",
        schoolId: schoolIds["school_ncku"],
        amount: "250,000 TWD total (over 2 years)",
        duration: "2 years (Master)",
        coversTuition: true,
        coversDorm: true,
        coversStipend: false,
        minGpa: "3.3/4.0",
        minEnglishReq: "IELTS 6.0",
        eligibleDegrees: ["Master"],
        eligibleCountries: ["All countries"],
        requirements: "Awarded to top 5% of NCKU international applicants. Must maintain GPA above 3.0 per semester. Students in Engineering, Science, or Technology programs given priority.",
        deadline: "2026-04-10",
        applicationUrl: "https://oia.ncku.edu.tw/scholarship",
        isActive: true,
      },
      {
        name: "NTHU Outstanding International Student Award",
        source: "school_based",
        schoolId: schoolIds["school_nthu"],
        amount: "Full Tuition + 15,000 TWD/month",
        duration: "2 years (Master) / 4 years (PhD)",
        coversTuition: true,
        coversDorm: true,
        coversStipend: true,
        minGpa: "3.5/4.0",
        minEnglishReq: "IELTS 6.5",
        eligibleDegrees: ["Master", "PhD"],
        eligibleCountries: ["ASEAN", "South Asia", "East Africa"],
        requirements: "Highly competitive scholarship for top STEM applicants. Research experience or published papers preferred. Candidates must submit a detailed research proposal. Renewable upon satisfactory academic progress.",
        deadline: "2026-03-31",
        applicationUrl: "https://oia.nthu.edu.tw",
        isActive: true,
      },
      {
        name: "FCU International Student Grant",
        source: "school_based",
        schoolId: schoolIds["school_fcu"],
        amount: "30–50% Tuition Reduction",
        duration: "Full degree program",
        coversTuition: true,
        coversDorm: false,
        coversStipend: false,
        minGpa: "2.8/4.0",
        minEnglishReq: "IELTS 5.5",
        eligibleDegrees: ["Bachelor", "Master"],
        eligibleCountries: ["All countries"],
        requirements: "Available to all accepted FCU International College students. Apply simultaneously with university admission. Automatic renewal each semester for students maintaining a 2.8+ GPA.",
        deadline: "2026-03-15",
        applicationUrl: "https://ic.fcu.edu.tw/scholarship",
        isActive: true,
      },
      {
        name: "Taiwan STEM Excellence Fellowship",
        source: "private",
        schoolId: null,
        amount: "600,000 TWD total package",
        duration: "2 years",
        coversTuition: true,
        coversDorm: true,
        coversStipend: true,
        minGpa: "3.7/4.0",
        minEnglishReq: "IELTS 7.0 / TOEFL 100",
        eligibleDegrees: ["Master", "PhD"],
        eligibleCountries: ["Vietnam", "Indonesia", "Thailand", "Malaysia", "Singapore", "India"],
        requirements: "Funded by the Taiwan STEM Foundation. Candidates must be enrolled in EE, CS, Materials Science, or related STEM programs at a top-5 Taiwanese university. Requires 3 months of summer research at a Taiwanese tech company.",
        deadline: "2026-02-28",
        applicationUrl: "https://www.studyintaiwan.org",
        isActive: true,
      },
    ];

    for (const s of scholarshipsData) {
      try {
        const ex = await databases.listDocuments(DB_ID, "Scholarships", [Query.equal("name", s.name)]);
        if (ex.total === 0) {
          await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
            ...s,
            schoolId: s.schoolId ?? undefined,
          });
        }
      } catch (e) { console.error("Scholarship error:", e); }
    }

    // ─── 6. BUSINESSES ────────────────────────────────────────────────────────
    const bizData = [
      {
        id: "biz_tsmc",
        ownerId: createdUsers.business,
        companyName: "Taiwan Semiconductor Manufacturing Co. (TSMC)",
        industry: "Semiconductors / Chip Fabrication",
        city: "Hsinchu",
        description: "TSMC is the world's largest dedicated semiconductor foundry, manufacturing chips for Apple, NVIDIA, AMD, and hundreds of global clients. Founded in 1987 by Dr. Morris Chang, TSMC employs over 73,000 people and operates cutting-edge fabs at 3nm and below. Interns and graduates at TSMC gain exposure to the most advanced chip manufacturing processes on Earth.",
        website: "https://www.tsmc.com",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/TSMC_logo.svg/1200px-TSMC_logo.svg.png",
      },
      {
        id: "biz_asus",
        ownerId: createdUsers.business,
        companyName: "ASUSTeK Computer Inc. (ASUS)",
        industry: "Consumer Electronics / PCs",
        city: "Taipei",
        description: "ASUS is a global technology powerhouse headquartered in Taipei, famous for laptops, motherboards, GPUs, and smartphones. With over $15B in annual revenue and operations in 50+ countries, ASUS offers international talents exciting roles in R&D, design, and global marketing. ASUS consistently appears on Forbes' list of the world's most innovative companies.",
        website: "https://www.asus.com",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ASUS_Logo.svg/1200px-ASUS_Logo.svg.png",
      },
      {
        id: "biz_shopee",
        ownerId: createdUsers.business,
        companyName: "Shopee Taiwan (Sea Group)",
        industry: "E-Commerce / Tech",
        city: "Taipei",
        description: "Shopee is Southeast Asia and Taiwan's leading e-commerce platform, part of Sea Group — one of the largest tech conglomerates in the region. The Taipei office drives Shopee's Taiwan operations and serves as a regional tech hub for product development. Working at Shopee means joining a fast-moving, data-driven team serving millions of users daily.",
        website: "https://shopee.tw",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png",
      },
      {
        id: "biz_line",
        ownerId: createdUsers.business,
        companyName: "LINE Taiwan Limited",
        industry: "Messaging / Social Media / Fintech",
        city: "Taipei",
        description: "LINE is the most widely used messaging app in Taiwan with over 21 million monthly active users. LINE Taiwan operates a full technology center developing LINE Pay, LINE MUSIC, LINE Shopping, and AI services. The Taipei office is a dynamic hub for engineers, designers, and product managers who want to build products at scale across Asia.",
        website: "https://linecorp.com/tw",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/LINE_logo.svg/1200px-LINE_logo.svg.png",
      },
      {
        id: "biz_mediatek",
        ownerId: createdUsers.business,
        companyName: "MediaTek Inc.",
        industry: "Semiconductors / IC Design",
        city: "Hsinchu",
        description: "MediaTek is the world's largest fabless semiconductor company by revenue, designing chips for smartphones, smart TVs, IoT devices, and automotive applications. Headquartered in Hsinchu, MediaTek shipped over 2 billion chips in 2024 alone. For engineering students, a MediaTek internship is one of the most prestigious opportunities in the global semiconductor industry.",
        website: "https://www.mediatek.com",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/MediaTek_logo.svg/1200px-MediaTek_logo.svg.png",
      },
      {
        id: "biz_garena",
        ownerId: createdUsers.business,
        companyName: "Garena Taiwan (Sea Group)",
        industry: "Gaming / Digital Entertainment",
        city: "Taipei",
        description: "Garena is the premier online gaming platform in Southeast Asia and Taiwan, home to Free Fire — one of the world's most downloaded mobile games. The Taipei team handles live operations, esports events, game publishing, and Southeast Asian market strategy. Join a passionate team of gamers and technologists building the future of interactive entertainment.",
        website: "https://www.garena.tw",
        isApproved: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Garena_logo.svg/1200px-Garena_logo.svg.png",
      },
    ];

    const bizIds: Record<string, string> = {};
    for (const b of bizData) {
      try {
        const ex = await databases.listDocuments(DB_ID, "Businesses", [Query.equal("companyName", b.companyName)]);
        if (ex.total === 0) {
          const { id, ...data } = b;
          const doc = await databases.createDocument(DB_ID, "Businesses", ID.unique(), data);
          bizIds[id] = doc.$id;
        } else {
          bizIds[b.id] = ex.documents[0].$id;
        }
      } catch (e) { console.error("Business error:", e); }
    }

    // ─── 7. JOBS ──────────────────────────────────────────────────────────────
    const jobsData = [
      // TSMC
      { biz: "biz_tsmc", title: "AI & Machine Learning Research Intern", type: "Internship", salary: "35,000–45,000 TWD/month", loc: "Hsinchu Science Park, Building 6", hours: 40, visa: true, chinese: "None", district: "Hsinchu Science Park", deadline: "2026-04-30", benefits: "Free shuttle bus, meal subsidy 150 TWD/day, housing allowance", requirements: "Pursuing Master or PhD in CS, EE, or related field. Proficient in Python, PyTorch/TensorFlow. Research experience in ML/AI preferred. Strong English communication skills." },
      { biz: "biz_tsmc", title: "Process Integration Engineer (Entry Level)", type: "Full-time", salary: "65,000–85,000 TWD/month", loc: "Hsinchu Fab 18, TSMC HQ", hours: 40, visa: true, chinese: "Basic", district: "Hsinchu City", deadline: "2026-05-31", benefits: "Annual bonus (2–4 months), stock options, meal subsidy, on-site gym, health insurance", requirements: "Bachelor or Master in Semiconductor Physics, Materials Science, or EE. Understanding of CMOS fabrication processes. Willingness to work in a cleanroom environment." },
      { biz: "biz_tsmc", title: "Software Engineer — EDA Tools", type: "Full-time", salary: "75,000–100,000 TWD/month", loc: "TSMC Technology Center, Taipei", hours: 40, visa: true, chinese: "Basic", district: "Zhongzheng District, Taipei", deadline: "2026-06-30", benefits: "Flexible hours, remote work 2 days/week, education allowance, comprehensive health package", requirements: "Strong background in C++, Python, and Linux. Experience with EDA tools (Cadence, Synopsys) a plus. Problem-solving mindset for large-scale tool development." },
      // ASUS
      { biz: "biz_asus", title: "Hardware Design Engineer — Gaming Laptops", type: "Full-time", salary: "55,000–75,000 TWD/month", loc: "ASUS HQ, Beitou District, Taipei", hours: 40, visa: true, chinese: "Basic", district: "Beitou District, Taipei", deadline: "2026-05-15", benefits: "Product discounts, annual bonus, meal subsidies, health insurance, gym membership", requirements: "Bachelor in EE or Mechanical Engineering. Experience with PCB design, thermal management, or product validation. Familiarity with NPI process a plus." },
      { biz: "biz_asus", title: "Global Marketing Specialist — EU/NA Region", type: "Full-time", salary: "50,000–65,000 TWD/month", loc: "ASUS Global HQ, Beitou, Taipei", hours: 40, visa: true, chinese: "None", district: "Beitou District, Taipei", deadline: "2026-05-30", benefits: "International travel, product allowance, remote work options, annual bonus", requirements: "Native or near-native English speaker. Experience in digital marketing, influencer campaigns, or B2C brand strategy. Knowledge of European or North American tech markets preferred." },
      { biz: "biz_asus", title: "Mobile App Developer (React Native / iOS)", type: "Full-time", salary: "60,000–80,000 TWD/month", loc: "ASUS Software Center, Neihu, Taipei", hours: 40, visa: true, chinese: "None", district: "Neihu District, Taipei", deadline: "2026-06-15", benefits: "Flexible hours, work from home 3 days/week, tech allowance, stock options", requirements: "Proficient in React Native or Swift. Experience shipping apps to App Store / Google Play. Portfolio of published apps preferred. Agile development experience required." },
      // Shopee
      { biz: "biz_shopee", title: "Backend Software Engineer (Go / Python)", type: "Full-time", salary: "70,000–95,000 TWD/month", loc: "Shopee Taiwan HQ, Xinyi District", hours: 40, visa: true, chinese: "None", district: "Xinyi District, Taipei", deadline: "2026-05-31", benefits: "Competitive base + RSU (Sea Group stock), health insurance, catered meals, relocation support", requirements: "2+ years experience in backend development. Proficient in Go or Python. Experience with microservices, Kafka, or Redis. Strong system design fundamentals." },
      { biz: "biz_shopee", title: "Data Analyst — Seller Operations", type: "Part-time", salary: "200–280 TWD/hour", loc: "Shopee Taiwan, Xinyi District", hours: 20, visa: true, chinese: "Conversational", district: "Xinyi District, Taipei", deadline: "2026-04-30", benefits: "Flexible schedule, meal vouchers, performance bonus", requirements: "Proficient in SQL and Excel/Google Sheets. Understanding of e-commerce metrics. Good Mandarin communication for seller support. Python knowledge a plus." },
      { biz: "biz_shopee", title: "Product Manager Intern — Logistics Tech", type: "Internship", salary: "28,000–35,000 TWD/month", loc: "Shopee Taiwan HQ, Xinyi", hours: 40, visa: true, chinese: "Basic", district: "Xinyi District, Taipei", deadline: "2026-04-15", benefits: "Full-time conversion opportunity, mentorship, team events, catered lunch", requirements: "Pursuing a degree in Business, CS, or related field. Analytical mindset with ability to work with data. Excellent English and basic Mandarin. Passion for logistics and supply chain." },
      // LINE
      { biz: "biz_line", title: "Frontend Engineer (React / TypeScript)", type: "Full-time", salary: "65,000–88,000 TWD/month", loc: "LINE Taiwan HQ, Zhongshan District", hours: 40, visa: true, chinese: "None", district: "Zhongshan District, Taipei", deadline: "2026-06-01", benefits: "Flexible WFH policy, top-tier health insurance, LINE Pay allowance, gym reimbursement", requirements: "3+ years in frontend development. Expert-level React and TypeScript. Experience with large-scale SPAs. Eye for clean UI and design systems. English proficiency required." },
      { biz: "biz_line", title: "LINE Pay — Fintech Backend Engineer", type: "Full-time", salary: "72,000–98,000 TWD/month", loc: "LINE Taiwan, Zhongshan District", hours: 40, visa: true, chinese: "Basic", district: "Zhongshan District, Taipei", deadline: "2026-06-30", benefits: "High base salary, RSU, meal subsidy, annual company trips, comprehensive health package", requirements: "Strong Java or Kotlin skills. Experience in payment systems or fintech infrastructure. Knowledge of PCI-DSS compliance a plus. Team player with Agile experience." },
      { biz: "biz_line", title: "UX/UI Designer — LINE Shopping", type: "Part-time", salary: "180–250 TWD/hour", loc: "LINE Taiwan, Taipei", hours: 20, visa: true, chinese: "Conversational", district: "Zhongshan District, Taipei", deadline: "2026-05-01", benefits: "Creative environment, flexible schedule, access to LINE design tools and resources", requirements: "Portfolio demonstrating mobile and web design work. Proficiency in Figma. Ability to conduct user research. Conversational Mandarin required for collaboration." },
      // MediaTek
      { biz: "biz_mediatek", title: "IC Design Engineer — 5G Modem", type: "Full-time", salary: "80,000–120,000 TWD/month", loc: "MediaTek HQ, Hsinchu Science Park", hours: 40, visa: true, chinese: "Basic", district: "Hsinchu Science Park", deadline: "2026-05-31", benefits: "Industry-leading salary, stock options (TWSE listed), annual bonus 3–6 months, relocation", requirements: "Master or PhD in EE, Communications Engineering. Deep understanding of 5G NR standards, signal processing, or RF circuit design. VHDL/Verilog experience required." },
      { biz: "biz_mediatek", title: "Software Engineer — IoT Platform", type: "Full-time", salary: "65,000–85,000 TWD/month", loc: "MediaTek, Hsinchu", hours: 40, visa: true, chinese: "None", district: "Hsinchu City", deadline: "2026-06-15", benefits: "Flexible hours, remote work 1 day/week, tech certifications paid, comprehensive benefits", requirements: "Experience in embedded C/C++ or Linux kernel development. Familiarity with RTOS, BLE, or Wi-Fi stack a plus. Enthusiasm for connected devices and smart home technology." },
      { biz: "biz_mediatek", title: "R&D Intern — AI on Edge Devices", type: "Internship", salary: "30,000–40,000 TWD/month", loc: "MediaTek AI Labs, Hsinchu", hours: 40, visa: true, chinese: "None", district: "Hsinchu Science Park", deadline: "2026-04-30", benefits: "Mentorship by senior engineers, housing allowance, shuttle bus, meal subsidy", requirements: "Pursuing Master or PhD in CS/EE. Experience with model compression, quantization, or on-device inference. TensorFlow Lite or ONNX experience preferred." },
      // Garena
      { biz: "biz_garena", title: "Live Operations Specialist — Free Fire", type: "Full-time", salary: "45,000–60,000 TWD/month", loc: "Garena Taiwan, Da'an District, Taipei", hours: 40, visa: true, chinese: "Conversational", district: "Da'an District, Taipei", deadline: "2026-05-15", benefits: "Free games & in-game currency, team gaming events, annual bonus, health insurance", requirements: "Passion for mobile gaming, especially battle royale games. English and Mandarin communication skills. Analytical ability to track KPIs and player behavior data." },
      { biz: "biz_garena", title: "Esports Event Coordinator", type: "Part-time", salary: "180–230 TWD/hour", loc: "Garena Esports Hub, Taipei", hours: 20, visa: true, chinese: "Conversational", district: "Zhongzheng District, Taipei", deadline: "2026-05-01", benefits: "Free event access, networking with esports professionals, flexible schedule", requirements: "Background or strong interest in esports production or event management. Good bilingual (English/Chinese) communication. Ability to work on weekends during events." },
      { biz: "biz_garena", title: "Community Manager — SEA Gaming Community", type: "Full-time", salary: "42,000–55,000 TWD/month", loc: "Garena Taiwan, Taipei", hours: 40, visa: true, chinese: "None", district: "Da'an District, Taipei", deadline: "2026-06-01", benefits: "Remote work 2 days/week, gaming equipment allowance, team events", requirements: "Native-level English. Experience managing Discord, Reddit, or social media communities. Background in gaming or digital content creation. Knowledge of SEA gaming culture a plus." },
    ];

    for (const j of jobsData) {
      try {
        const bizId = bizIds[j.biz];
        if (!bizId) continue;
        const ex = await databases.listDocuments(DB_ID, "Jobs", [
          Query.equal("businessId", bizId),
          Query.equal("title", j.title),
        ]);
        if (ex.total === 0) {
          await databases.createDocument(DB_ID, "Jobs", ID.unique(), {
            businessId: bizId,
            title: j.title,
            jobType: j.type,
            salaryRange: j.salary,
            location: j.loc,
            hoursPerWeek: j.hours,
            allowsStudentVisa: j.visa,
            chineseRequired: j.chinese,
            district: j.district,
            benefits: j.benefits,
            requirements: j.requirements,
            deadline: j.deadline,
            isActive: true,
          });
        }
      } catch (e) { console.error("Job error:", e); }
    }

    // ─── 8. COMMUNITY POSTS ───────────────────────────────────────────────────
    const now = new Date();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

    const postsData = [
      {
        authorName: "Minh Tuan Nguyen",
        authorRole: "student",
        title: "How I Got the MOE Taiwan Scholarship — Complete Guide for Vietnamese Students",
        slug: `moe-scholarship-guide-vietnamese-${Date.now() - 10000}`,
        excerpt: "I applied 3 times before finally getting the MOE Taiwan Scholarship to study at NTU. Here's everything I wish I knew from the start — documents, interview tips, and what really matters.",
        tags: ["scholarship", "MOE", "NTU", "Vietnam", "tips"],
        content: `## My MOE Taiwan Scholarship Journey

After **3 attempts**, I finally secured the MOE Taiwan Scholarship to pursue my Master's in Computer Science at NTU. I'm writing this guide so you don't have to make the same mistakes I did.

### What the MOE Scholarship Covers

The MOE Taiwan Scholarship is one of the most generous study abroad packages available:
- **Full tuition waiver** for your entire degree
- **40,000 TWD/month** living stipend (enough to live comfortably in Taipei)
- **Round-trip airfare** reimbursement
- **Dormitory fee subsidy** at most universities

### Application Timeline

The key dates you CANNOT miss:
1. **November–January**: Research target universities and programs
2. **January–February**: Contact professors (this is crucial!)
3. **March 31**: MOE application deadline (usually)
4. **April–May**: Interview rounds at MOFA office in your country
5. **June**: Results announced

### My #1 Tip: Contact Professors First

This is where most applicants fail. The MOE scholarship review panel gives significant weight to whether a professor at your target school is willing to supervise you.

**Email format that worked for me:**

> Dear Professor [Name],
> I am applying to [University] for Fall 2026 and am very interested in your research on [specific topic]. I read your paper "[Paper Title]" and believe my background in [field] could contribute to [specific aspect of their research]. I am applying for the MOE Taiwan Scholarship. Would you be open to a brief video call to discuss potential supervision?

I sent 15 emails. 4 responded. 1 agreed. That 1 response made all the difference.

### Documents Checklist

- ✅ Official transcripts (notarized + translated)
- ✅ Language scores (IELTS 6.0+ or TOEFL 80+)
- ✅ Research proposal (2,000–3,000 words)
- ✅ 3 recommendation letters (1 must be from current/recent supervisor)
- ✅ Personal statement (why Taiwan, why this field, why now)
- ✅ Copy of passport
- ✅ Professor acceptance letter (unofficial email printout is fine)

### The Interview

The MOFA interview is 20–30 minutes, conducted in English. Common questions:
- Why Taiwan and not other countries?
- What will you bring back to Vietnam after completing your studies?
- Describe your research proposal in 2 minutes.
- How do you plan to handle living independently in Taiwan?

**Be honest. Be specific. Show you know Taiwan.**

Good luck — Taiwan is worth every bit of effort. Feel free to ask me anything in the comments!`,
        publishedAt: daysAgo(45),
        viewCount: 2340,
      },
      {
        authorName: "Sarah Chen",
        authorRole: "student",
        title: "Life as an International Student in Taipei: 6-Month Reality Check",
        slug: `taipei-international-student-6months-${Date.now() - 20000}`,
        excerpt: "Six months in, here's my honest take on studying in Taipei — the good, the challenging, and everything in between. From budget tips to finding your community.",
        tags: ["taipei", "student life", "budget", "food", "community"],
        content: `## Six Months in Taipei: An Honest Review

I'm a Malaysian student doing my Master's in Global MBA at NTU, and I've now been in Taipei for exactly 6 months. Here's my most honest take.

### What's Actually Great

**The food is incredible — and cheap.**
A full meal at a local restaurant or night market stall costs 60–100 TWD ($2–3 USD). I spend about 6,000–8,000 TWD/month on food without even trying to save. The Shida Night Market near NTU is my go-to spot.

**Public transport is world-class.**
The MRT (metro) is clean, punctual, and extensive. A monthly student pass is only 1,280 TWD. YouBike (city bike sharing) costs 5 TWD for the first 30 minutes. I've almost stopped taking Ubers entirely.

**Safety.**
I cannot stress this enough: Taipei is one of the safest cities in Asia. I walk home at 2 AM and never feel unsafe. Lost your phone? Someone will return it. This alone adds so much to the quality of life.

### Budget Breakdown (Monthly)

| Item | Cost (TWD) |
|------|-----------|
| Room rent (near NTU) | 8,000–12,000 |
| Food | 6,000–8,000 |
| Transport | 1,500 |
| Phone plan | 499 |
| Entertainment | 2,000–3,000 |
| **Total** | **~18,000–24,500** |

If you have the MOE stipend (40,000 TWD), you'll have a comfortable surplus. Even with a part-time campus job (~15,000 TWD/month), it's manageable.

### The Challenges

**The language barrier is real.**
Even though many signs have English, daily life outside campus requires basic Mandarin. The hawker aunties at the market don't speak English. Your landlord might not speak English. Download Google Translate's offline Chinese pack — use it daily.

**Finding housing is stressful.**
University dorms are competitive and not guaranteed. I spent 3 weeks apartment hunting before arriving. Join the NTU International Students Facebook group — people post housing leads there frequently.

**Social circles take time.**
Taiwanese students can be reserved initially. The international community is large but fragmented. I found my closest friends through department activities and the campus hiking club, not orientation events.

### My 3 Recommendations

1. **Learn 50 basic Mandarin phrases** before you arrive
2. **Get the EasyCard** (transport + convenience store payments) on Day 1
3. **Join at least one club or activity** in your first month — it changes everything

Taiwan is genuinely wonderful. Ask me anything!`,
        publishedAt: daysAgo(32),
        viewCount: 1870,
      },
      {
        authorName: "Aditya Sharma",
        authorRole: "student",
        title: "NTHU vs NCKU for Engineering: Which Should You Choose?",
        slug: `nthu-vs-ncku-engineering-comparison-${Date.now() - 30000}`,
        excerpt: "Both are world-class engineering universities with MOE scholarship pipelines. I got accepted to both and had to choose. Here's the comparison that helped me decide.",
        tags: ["NTHU", "NCKU", "engineering", "comparison", "Hsinchu", "Tainan"],
        content: `## NTHU vs NCKU for Engineering: My Decision Framework

I received acceptance offers from both National Tsing Hua University (NTHU, Hsinchu) and National Cheng Kung University (NCKU, Tainan) for Electrical Engineering Master's programs. Both came with scholarship prospects. Here's how I thought through the decision.

### Academic Reputation

| Factor | NTHU | NCKU |
|--------|------|------|
| QS World Ranking | ~200 | ~250 |
| EE Department | Top 5 in Asia | Top 10 in Asia |
| CS Department | Exceptional | Strong |
| Research Output | Very High | High |
| Industry Connections | TSMC, MediaTek (nearby) | TSMC Fab, Chi Mei |

Both are outstanding. For pure EE research, NTHU has a slight edge. NCKU's semiconductor engineering program, however, is world-renowned.

### Location: Hsinchu vs Tainan

**Hsinchu (NTHU, NYCU)**
- Taiwan's "Silicon Valley"
- TSMC, MediaTek, Acer headquarters nearby
- Internship opportunities within 15 minutes
- Smaller city — quieter, lower entertainment options
- Rent: 5,000–9,000 TWD/month (lower than Taipei)

**Tainan (NCKU)**
- Taiwan's cultural and historical capital
- Beautiful temples, old city streets, incredible local food
- Lower living costs than any other major city
- Rent: 4,000–7,000 TWD/month
- Less "tech bubble" feel — more balanced lifestyle

### My Final Decision: NTHU

I chose NTHU primarily because:
1. My research topic (RF IC design) aligns more with NTHU faculty
2. Internship at MediaTek during the program was possible
3. My advisor has direct collaboration with TSMC

But honestly? If I'd been going for any program other than very specialized EE research, I might have chosen Tainan. NCKU's lifestyle, food scene, and relaxed pace are genuinely appealing.

**Choose NTHU if:** You're in CS or hardcore EE, want tech-industry proximity, and prioritize career placement.
**Choose NCKU if:** You want world-class engineering education with a higher quality of daily life and cultural richness.

Both are excellent choices. You cannot go wrong.`,
        publishedAt: daysAgo(21),
        viewCount: 1425,
      },
      {
        authorName: "Linh Pham",
        authorRole: "student",
        title: "Working Part-Time as an International Student in Taiwan: What You Need to Know",
        slug: `part-time-work-taiwan-international-student-${Date.now() - 40000}`,
        excerpt: "Taiwan law allows international students to work up to 20 hours per week. Here's how to get your work permit, find jobs, and balance study with income — from someone doing it.",
        tags: ["part-time", "work permit", "jobs", "income", "visa"],
        content: `## Working Part-Time in Taiwan: The Complete Guide

One of the best-kept secrets about studying in Taiwan is that it's genuinely possible to support yourself with part-time work — if you do it right. Here's my experience and what I've learned.

### The Legal Framework

International students in Taiwan (on a Student ARC) are allowed to work **up to 20 hours per week** during semester and **full-time during holidays**.

**Getting your work permit:**
1. Apply at your university's international office
2. Provide your ARC, enrollment certificate, and passport
3. Processing time: 2–4 weeks
4. Cost: Free

Without this permit, working is illegal and could risk your visa status. Don't skip this step.

### Where to Find Part-Time Jobs

**On UniLink (obviously!)** — The Jobs section filters for "Allows Student Visa" so you only see verified opportunities.

**Other sources:**
- University job boards (校內工讀)
- 104.com.tw — Taiwan's largest job platform (use Google Translate)
- Cheers 快樂工作人 for part-time listings
- Facebook groups: "International Students Taiwan Jobs"

### Most Common Jobs for International Students

| Job Type | Hourly Rate | Chinese Required? |
|----------|-------------|------------------|
| Convenience store (7-11, FamilyMart) | 176–200 TWD | Basic |
| Restaurant service | 176–220 TWD | Conversational |
| Language tutor (English) | 400–800 TWD | None |
| University research assistant | 200–280 TWD | None |
| Tech company intern | 200–350 TWD | None–Basic |
| Online English teacher | 600–1,200 TWD | None |

### My Personal Setup

I currently do two things:
1. **Research assistant at NCKU** (15 hrs/week) — 230 TWD/hr = 13,800 TWD/month
2. **Online English tutoring** (4–6 hrs/week) — ~800 TWD/hr = 3,200–4,800 TWD/month

Total monthly income: ~17,000–18,600 TWD, enough to cover rent, food, and transport.

### Tips for Success

- **Start with RA positions at your university** — they're flexible around your class schedule and pay reasonably well
- **Don't overwork** in your first semester — your GPA matters for scholarship renewal
- **English tutoring** is the most lucrative option if you're a native or near-native speaker
- Minimum wage in Taiwan is **176 TWD/hour** (2025) — never accept below this

Good luck! Feel free to ask questions.`,
        publishedAt: daysAgo(18),
        viewCount: 2105,
      },
      {
        authorName: "National Taiwan University",
        authorRole: "school",
        title: "NTU Fall 2026 Admissions: What We Look For in International Applicants",
        slug: `ntu-fall-2026-admissions-guide-${Date.now() - 50000}`,
        excerpt: "From the NTU Office of International Affairs — an honest breakdown of what makes a strong international applicant, straight from the admissions team.",
        tags: ["NTU", "admissions", "tips", "application", "Fall 2026"],
        content: `## NTU Fall 2026: What Makes a Strong Application

As the NTU Office of International Affairs, we receive thousands of applications each cycle and want to share what genuinely makes candidates stand out.

### What We Actually Prioritize

Many applicants believe GPA is everything. It matters — but it's rarely the deciding factor. Here's our real weighting for graduate admissions:

1. **Research fit with faculty** (most important)
2. **Quality of research proposal**
3. **Recommendation letters** (specificity matters over prestige)
4. **English proficiency** (threshold requirement, not differentiator)
5. **Academic GPA** (context-dependent)

### The Research Proposal

Your research proposal should:
- Be **2,000–3,000 words**, not longer
- Clearly state a **specific problem**, not a general topic
- Reference **recent NTU faculty publications** (this shows you've done homework)
- Describe your **preliminary work or relevant experience**
- Outline a realistic **timeline and methodology**

We see many proposals that say "I want to research AI." That tells us nothing. Show us you understand the landscape, have identified a gap, and have a credible plan.

### Recommendation Letters

The most impactful letters come from supervisors who worked directly with you on a project. We can immediately tell when a letter is generic vs. specific.

A letter saying *"I supervised [Name] on a 6-month project developing X, during which she demonstrated [specific skill] by solving [specific problem]"* is worth 10 generic letters.

### English Proficiency

Our minimums:
- **IELTS 6.5** (most programs)
- **TOEFL iBT 90** (most programs)
- **GMAT/GRE** required for MBA and some business programs

Meeting the minimum does not make you competitive — it makes you eligible. Strong applicants typically score 7.0+ IELTS.

### Contacting Professors

We strongly recommend emailing potential supervisors **before** submitting your formal application. A brief, personalized email asking about their current research and potential supervision availability takes 10 minutes and can significantly boost your application.

Do not send mass emails. Do not ask "Are you accepting students?" in the first message. Show genuine interest in their specific work.

### Open Days 2026

We are hosting virtual information sessions on:
- **January 15, 2026** — Graduate Programs Overview
- **February 12, 2026** — Scholarship Q&A
- **March 5, 2026** — Lab Tours and Faculty Introductions

Register at oia.ntu.edu.tw. We hope to see you at NTU in September!`,
        publishedAt: daysAgo(14),
        viewCount: 3210,
      },
      {
        authorName: "TSMC Human Resources",
        authorRole: "business",
        title: "What TSMC Looks for in International Intern Candidates",
        slug: `tsmc-intern-hiring-international-students-${Date.now() - 60000}`,
        excerpt: "TSMC welcomed over 200 international interns in 2025. Our HR team shares what makes candidates stand out and how to prepare for the TSMC technical interview process.",
        tags: ["TSMC", "internship", "semiconductor", "career", "hiring"],
        content: `## How to Stand Out as a TSMC International Intern Candidate

TSMC's internship program is one of the most competitive in Asia's tech industry. In 2025, we received over 8,000 applications for 200 international intern slots. Here's what our recruitment team looks for.

### Roles We Recruit Internationally

**Engineering tracks:**
- Process Integration & Development
- Device Engineering
- Quality & Reliability
- Software Engineering (EDA, Automation, AI/ML)
- Data Science & Analytics

**Non-engineering tracks:**
- Supply Chain Management
- HR & Talent Development (rare)

For international students, **EDA Software** and **AI/ML Research** roles have the most English-friendly environments.

### What Makes a Strong Candidate

**Technical depth over breadth.** We don't need someone who has touched 15 technologies. We need someone who understands one area deeply. A candidate who has written a thesis on process variation modeling is more compelling than someone who has "exposure" to 10 semiconductor topics.

**Research track record.** Papers published or conference presentations carry significant weight — especially for PhD intern candidates.

**Problem-solving clarity.** In interviews, we focus heavily on how you approach problems. We ask open-ended questions like "How would you design an experiment to measure X?" We want to see structured thinking.

### The Interview Process

1. **CV screening** — 2 weeks after application close
2. **Technical phone screen** — 45 minutes, 1 engineer
3. **On-site or virtual technical interview** — 90 minutes, 2 engineers
4. **HR fit interview** — 30 minutes
5. **Offer** — typically 2–3 weeks after final round

Technical interviews for software/AI roles include:
- Coding questions (LeetCode medium difficulty)
- System design (for experienced candidates)
- Technical knowledge in your specialty

For engineering (process/device) roles:
- Semiconductor physics fundamentals
- Design of experiments
- Failure analysis case studies

### Salary & Benefits (2025 data)

- **AI/ML Research Intern:** 35,000–45,000 TWD/month
- **Process Integration Intern:** 30,000–38,000 TWD/month
- **Software Engineering Intern:** 38,000–48,000 TWD/month
- Plus: shuttle bus, meal subsidy 150 TWD/day, housing allowance 5,000 TWD/month

We look forward to reviewing your application. For TSMC internship openings, search UniLink Jobs for "TSMC" or visit tsmc.com/careers.`,
        publishedAt: daysAgo(10),
        viewCount: 1654,
      },
      {
        authorName: "Kevin Wu",
        authorRole: "student",
        title: "Learning Mandarin in Taiwan: My 1-Year Progress (From Zero to HSK 3)",
        slug: `learning-mandarin-taiwan-one-year-progress-${Date.now() - 70000}`,
        excerpt: "I arrived in Taiwan knowing absolutely zero Mandarin. One year later, I passed HSK 3 and can hold real conversations. Here's the exact method I used — including free resources.",
        tags: ["Mandarin", "language", "HSK", "study tips", "Taiwan"],
        content: `## From Zero to HSK 3 in 12 Months: My Exact Method

When I arrived in Taiwan for my Master's program, I genuinely knew zero Mandarin. Not even 你好. One year later, I passed HSK 3 (intermediate) and can navigate daily life, shop at markets, and have basic conversations with Taiwanese colleagues.

Here's exactly what I did.

### Month 1–2: Survival Mode

I focused exclusively on practical survival phrases. Not tones, not grammar — just raw communication.

**Week 1 priority list:**
- Numbers 1–100
- Days of the week
- "How much?" (多少錢?)
- "Where is...?" (在哪裡?)
- Common food names at night markets
- "Excuse me / Sorry" (不好意思)

I used **Pimsleur Mandarin** (30 min/day audio) because I could do it on my commute. It's not free but worth it for the first 2 months.

### Month 3–6: Building a Foundation

I started formal study with these free resources:

1. **Pleco app** — Best Chinese dictionary. Use it constantly.
2. **ChinesePod** (free tier) — Excellent listening practice
3. **HelloChinese app** — Gamified app, good for characters
4. **iTalki** — Found a language exchange partner (free — trade English lessons)

My routine (1 hour/day):
- 20 min: Anki flashcards (I used a pre-made HSK 2 deck)
- 20 min: ChinesePod podcast
- 20 min: iTalki language exchange

### Month 6–12: Immersion and Acceleration

Living in Taiwan is the biggest cheat code. Here's how I maximized immersion:

- **Changed my phone to Traditional Chinese** — painful but effective
- **Stopped going to English-menu restaurants** — ordered by pointing and speaking
- **Joined a Taiwanese hiking group** — forced Chinese conversation
- **Watched Taiwanese variety shows** with Chinese subtitles (愛奇藝 app)

By month 9, I was dreaming in Mandarin occasionally.

### HSK 3 Preparation (Final 3 months)

HSK 3 requires ~600 vocabulary words. I used:
- Official HSK 3 vocabulary list (free PDF online)
- Anki deck for HSK 3 words
- 3 practice tests before the exam

I passed with 247/300 (passing is 180/300).

### My Honest Assessment

Mandarin is hard. The tones will frustrate you. The characters seem impossible at first. But Taiwan is the **best possible environment** to learn — locals are incredibly patient, willing to practice with you, and genuinely appreciative of your effort.

Start day one. Even 15 minutes a day compounds into fluency faster than you think.`,
        publishedAt: daysAgo(8),
        viewCount: 987,
      },
      {
        authorName: "Priya Nair",
        authorRole: "student",
        title: "FCU International College Review: Is It Worth It for an Indian Student?",
        slug: `fcu-international-college-review-indian-student-${Date.now() - 80000}`,
        excerpt: "After 2 years at Feng Chia University's International College, here's my completely honest review for prospective students from India and South Asia.",
        tags: ["FCU", "Feng Chia", "Taichung", "India", "review", "international college"],
        content: `## FCU International College: 2-Year Review

I completed my Master's in Data Science at Feng Chia University's International College (FCU IC) and want to share an honest perspective for prospective students — especially from South Asia.

### Why I Chose FCU Over Higher-Ranked Universities

I was also accepted to NCKU. I chose FCU because:
- **Significant scholarship** (40% tuition reduction) vs. NCKU's waitlist
- **Fully English-taught** — FCU IC is one of the only universities in Taiwan where EVERY course in my program was in English
- **Class size** — My cohort was 24 students from 12 countries. I got individualized attention from professors.
- **Location** — Taichung has amazing food, warm weather, and a relaxed pace

### Academic Quality

FCU's Data Science program is **solid but not research-intensive**. This is important to understand. If you want to publish papers and go into academia, NTHU or NTU are better fits. FCU IC is ideal for:
- Building practical skills (Python, ML, data engineering)
- Industry-oriented thesis projects
- Getting Taiwanese industry experience through internships

My professors had industry backgrounds (one was a former ASUS data scientist), which I found more valuable than pure academics for my career goals.

### The International College Advantage

FCU IC is specifically designed for international students:
- English-only administration and support
- Dedicated IC career center (helped me get a Shopee internship)
- 30+ nationalities in my program — genuine diversity
- Housing assistance and airport pickup for new students

### Taichung as a City

I loved living in Taichung. It's Taiwan's third-largest city with:
- Lower rent than Taipei (I paid 7,500 TWD for a private room near campus)
- Incredible food — Taichung has the most varied night market scene in Taiwan
- Warmer climate (less rain than Taipei)
- Easy HSR access to Taipei (35 minutes, 700 TWD)

Downsides: public transport is worse than Taipei (you need a scooter or bicycle), and the tech industry is smaller than Taipei/Hsinchu.

### Post-Graduation

I'm now working at a data analytics firm in Taipei. FCU's career network in Taichung is limited, but my skills and the internship experience I got through FCU IC were sufficient to land a job in Taipei.

**Overall:** FCU IC delivers what it promises — a genuinely international, English-taught, affordable education in a great city. It's not NTU, but for many students (especially those on scholarships or with career-focused goals), it's the right choice.

Happy to answer questions from prospective Indian/South Asian students!`,
        publishedAt: daysAgo(5),
        viewCount: 763,
      },
      {
        authorName: "MediaTek Inc.",
        authorRole: "business",
        title: "MediaTek Internship Program 2026: Applications Now Open",
        slug: `mediatek-internship-program-2026-${Date.now() - 90000}`,
        excerpt: "MediaTek's 2026 International Student Internship Program is now accepting applications. Roles in IC design, AI on edge devices, and software engineering. 35,000–45,000 TWD/month.",
        tags: ["MediaTek", "internship", "semiconductor", "IC design", "Hsinchu", "2026"],
        content: `## MediaTek 2026 International Internship Program

MediaTek is excited to announce that our 2026 International Student Internship Program is now open. We are actively recruiting Master's and PhD students for 3–6 month internships at our Hsinchu headquarters.

### Open Positions

**1. AI on Edge Devices Research Intern**
*Team: AI Labs | Duration: 4–6 months | Salary: 38,000–45,000 TWD/month*

Work directly with our AI inference team on optimizing neural network models for deployment on MediaTek's Dimensity and Kompanio chipsets. You'll work on model compression, quantization-aware training, and on-device inference benchmarking.

Requirements: Master/PhD in CS or EE; experience with PyTorch, TensorFlow Lite, or ONNX; published work a plus.

**2. IC Design Intern — 5G Modem Frontend**
*Team: Wireless Communications | Duration: 3–6 months | Salary: 35,000–42,000 TWD/month*

Join the 5G NR baseband development team. Work on RTL design and verification, synthesis, or power optimization for our next-generation modem architecture.

Requirements: Master/PhD in EE; proficiency in VHDL or Verilog; familiarity with 5G NR standards or RF systems.

**3. Software Engineering Intern — Cloud & IoT Platform**
*Team: IoT Business Unit | Duration: 3–6 months | Salary: 32,000–40,000 TWD/month*

Build cloud-connected features for MediaTek's smart home and IoT device platform. Work with Golang, AWS, and embedded Linux to create scalable device management systems.

Requirements: Bachelor/Master in CS; experience in Go, Python, or Linux systems; understanding of MQTT, BLE, or Wi-Fi protocols a plus.

### Benefits for International Interns

- Housing allowance: **5,000 TWD/month**
- Free shuttle from Hsinchu Station to MediaTek campus
- Meal subsidy: **100 TWD/day**
- Access to internal tech talks and hackathons
- Full-time conversion consideration for outstanding interns

### Application Process

1. Apply via UniLink Jobs (search "MediaTek") or careers.mediatek.com
2. Technical screening call (45 minutes)
3. On-site or virtual technical interview
4. Offer decision within 3 weeks

**Application Deadline: April 30, 2026**

We look forward to welcoming the next generation of semiconductor innovators to Hsinchu. Questions? Contact our campus recruitment team at campus.recruit@mediatek.com.`,
        publishedAt: daysAgo(3),
        viewCount: 1102,
      },
      {
        authorName: "James Okafor",
        authorRole: "student",
        title: "Coming to Taiwan from Nigeria: Visa, Culture Shock, and Building a New Life",
        slug: `taiwan-from-nigeria-visa-culture-life-${Date.now() - 100000}`,
        excerpt: "I'm one of the few Nigerian students at NCKU. The journey from Lagos to Tainan involved multiple visa rejections, culture shock, and eventually — one of the best decisions of my life.",
        tags: ["Nigeria", "Africa", "visa", "culture", "NCKU", "Tainan"],
        content: `## Taiwan From Nigeria: My Honest Story

I want to write this post because when I was researching Taiwan as a study destination, I found almost nothing written by African students. This post is for every Nigerian, Ghanaian, Kenyan, or South African student considering Taiwan.

### Why Taiwan? Why Not Europe or North America?

The question everyone asks me. My honest answers:

**Cost.** An MSc at a UK university costs £25,000–35,000 per year in tuition alone. At NCKU with the MOE scholarship, I pay zero tuition and receive 40,000 TWD/month. I'm saving money while studying.

**Quality.** NCKU's engineering ranking is competitive with many European universities. My degree is recognized globally.

**Safety.** Taiwan is consistently ranked among the top 5 safest countries in the world. As a Black man, I feel safer walking in Tainan at night than I do in many Western cities.

### The Visa Struggle

This is where I need to be honest: getting a Taiwan student visa from Nigeria is harder than from ASEAN countries. I was rejected twice before getting accepted.

**What helped me finally succeed:**
- A formal acceptance letter from NCKU (not conditional acceptance)
- Bank statement showing 200,000+ TWD equivalent in savings
- Scholarship award letter from MOE
- Flight booking (refundable) to show intention to travel
- Detailed study plan document

The MOFA in Abuja processes applications slowly. Apply **at least 3 months before** your intended travel date. Hire a visa consultant if you can — it was worth the 50,000 Naira I spent.

### Culture Shock: What Actually Surprised Me

**Food.** I was worried about this. Tainan has amazing food but almost no African or Nigerian food. I now cook Nigerian food on weekends — the ingredients are surprisingly available at foreign grocery stores in Taipei (takes 2 hours by HSR, worth a monthly trip).

**Staring.** In Tainan especially, people stare. It's mostly curiosity, not hostility. Most Taiwanese people have never met an African person. I've learned to treat it as an opportunity to represent my country well.

**Helpfulness.** Taiwanese people are extraordinarily helpful when you're lost or confused. I've had complete strangers walk me to my destination for 10 minutes without being asked.

### Building a Life

Eighteen months in, Tainan is home. I have a research assistant position, a Taiwanese-Nigerian friend group, and a favorite beef noodle spot on Zhongshan Road.

Taiwan wasn't my first choice. It is now my best choice.

If you're an African student considering Taiwan, please reach out to me. I'm happy to share contact information for the Nigerian community in Tainan and provide any guidance I wish I had.`,
        publishedAt: daysAgo(1),
        viewCount: 445,
      },
    ];

    const authorId = createdUsers.student || "seed_author";
    for (const p of postsData) {
      try {
        const ex = await databases.listDocuments(DB_ID, "Posts", [Query.equal("slug", p.slug)]);
        if (ex.total === 0) {
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
      } catch (e) { console.error("Post error:", e); }
    }

    // ─── 9. STUDENT PROFILE ───────────────────────────────────────────────────
    try {
      const ex = await databases.listDocuments(DB_ID, "Students", [
        Query.equal("accountId", createdUsers.student),
      ]);
      if (ex.total === 0 && createdUsers.student) {
        await databases.createDocument(DB_ID, "Students", ID.unique(), {
          accountId: createdUsers.student,
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
      }
    } catch (e) { console.error("Student profile error:", e); }

    // Revalidate
    revalidatePath("/");
    revalidatePath("/schools");
    revalidatePath("/scholarships");
    revalidatePath("/jobs");
    revalidatePath("/community");
    revalidatePath("/student-portal");
    revalidatePath("/school-portal");
    revalidatePath("/dashboard");
    revalidatePath("/portal");

    console.log("✅ Rich Seeding Complete!");
    return { success: true };
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    return { success: false, error: String(error) };
  }
}

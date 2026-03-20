"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../server";
import { revalidatePath } from "next/cache";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

export async function seedPlatformData() {
  const { users, databases } = await createAdminClient();

  try {
    console.log("🚀 Starting Seeding Process...");

    // ─── 1. USER ACCOUNTS ───────────────────────────────────────────────────
    const usersData = [
      { email: "admin@unilink.com", password: "Unilink123!", name: "UniLink Admin", role: "admin" },
      { email: "student@unilink.com", password: "Unilink123!", name: "Manh Hung", role: "student" },
      { email: "school@unilink.com", password: "Unilink123!", name: "NTU Administrator", role: "school" },
      { email: "business@unilink.com", password: "Unilink123!", name: "TSMC HR", role: "business" },
    ];

    const createdUsers: Record<string, string> = {};

    for (const u of usersData) {
      try {
        // Check if user exists
        const existing = await users.list([Query.equal("email", u.email)]);
        let userId;
        if (existing.total > 0) {
          userId = existing.users[0].$id;
          console.log(`User ${u.email} already exists.`);
        } else {
          const newUser = await users.create(ID.unique(), u.email, undefined, u.password, u.name);
          userId = newUser.$id;
          await users.updatePrefs(userId, { role: u.role });
          console.log(`User ${u.email} created.`);
        }
        createdUsers[u.role] = userId;
      } catch (e) {
        console.error(`Error with user ${u.email}:`, e);
      }
    }

    // ─── 2. SCHOOLS ────────────────────────────────────────────────────────
    console.log("Populating Schools...");
    const ntuId = ID.unique();
    console.log(`[SEED] Creating NTU: ${ntuId}`);
    await databases.createDocument(DB_ID, "Schools", ntuId, {
      ownerId: createdUsers.school,
      schoolName: "National Taiwan University (NTU)",
      website: "https://www.ntu.edu.tw",
      contactEmail: "admission@ntu.edu.tw",
      city: "Taipei",
      description: "National Taiwan University is the most prestigious university in Taiwan, ranked in the top 1% globally. It offers a diverse range of programs and state-of-the-art research facilities in the heart of Taipei.",
      ranking: "#1 in Taiwan",
      hasDorm: true,
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/National_Taiwan_University_logo.svg/1200px-National_Taiwan_University_logo.svg.png"
    });

    // NCKU (Tainan)
    const nckuId = ID.unique();
    await databases.createDocument(DB_ID, "Schools", nckuId, {
      ownerId: createdUsers.school, // Shared owner for demo simplicity
      schoolName: "National Cheng Kung University (NCKU)",
      website: "https://www.ncku.edu.tw",
      contactEmail: "admission@ncku.edu.tw",
      city: "Tainan",
      description: "Located in the historical city of Tainan, NCKU is a leading research university known for its excellence in Engineering, Science, and Medicine. It is a key driver of the Southern Taiwan Science Park ecosystem.",
      ranking: "#2 in Taiwan",
      hasDorm: true,
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/National_Cheng_Kung_University_Logo.svg/1024px-National_Cheng_Kung_University_Logo.svg.png"
    });

    // Feng Chia (Taichung)
    const fcuId = ID.unique();
    await databases.createDocument(DB_ID, "Schools", fcuId, {
      ownerId: createdUsers.school,
      schoolName: "Feng Chia University (FCU)",
      website: "https://www.fcu.edu.tw",
      contactEmail: "admission@fcu.edu.tw",
      city: "Taichung",
      description: "Feng Chia University is one of the top private universities in Taiwan, renowned for its Business, Engineering, and Information Technology programs. It is located near the bustling Fengjia Night Market corridor.",
      ranking: "Top Private University",
      hasDorm: true,
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/zh/thumb/3/36/Feng_Chia_University_logo.svg/1200px-Feng_Chia_University_logo.svg.png"
    });

    // ─── 3. PROGRAMS & TERMS ────────────────────────────────────────────────
    console.log("Populating Programs...");
    
    // NTU Fall Term
    const ntuTermId = ID.unique();
    await databases.createDocument(DB_ID, "Admission_Terms", ntuTermId, {
      schoolId: ntuId,
      termName: "Fall 2025 Graduate Admissions",
      applyStartDate: "2024-12-01",
      applyEndDate: "2025-03-15",
      intakeMonth: "September"
    });

    const programs = [
      { termId: ntuTermId, dept: "CS & Information Engineering", degree: "Master", tuition: "60k TWD", reqs: "IELTS 6.5" },
      { termId: ntuTermId, dept: "Global MBA", degree: "Master", tuition: "120k TWD", reqs: "GMAT/GRE" },
      { termId: ntuTermId, dept: "Electrical Engineering", degree: "PhD", tuition: "55k TWD", reqs: "IELTS 7.0" }
    ];

    for (const p of programs) {
      await databases.createDocument(DB_ID, "Programs", ID.unique(), {
        termId: p.termId,
        departmentName: p.dept,
        degreeLevel: p.degree,
        languageInstruction: "English",
        tuitionFee: p.tuition,
        minEnglishReq: p.reqs,
        dormAvailable: true
      });
    }

    // NCKU Fall Term
    const nckuTermId = ID.unique();
    await databases.createDocument(DB_ID, "Admission_Terms", nckuTermId, {
      schoolId: nckuId,
      termName: "International Admissions Fall 2025",
      applyStartDate: "2025-01-20",
      applyEndDate: "2025-04-10",
      intakeMonth: "September"
    });

    await databases.createDocument(DB_ID, "Programs", ID.unique(), {
      termId: nckuTermId,
      departmentName: "Semiconductor Manufacturing",
      degreeLevel: "Master",
      languageInstruction: "English",
      tuitionFee: "58k TWD",
      minEnglishReq: "IELTS 6.0",
      dormAvailable: true
    });

    // ─── 4. SCHOLARSHIPS ───────────────────────────────────────────────────
    console.log("Populating Scholarships...");
    const scholarships = [
      { name: "MOE Taiwan Scholarship", source: "Government", amount: "Full Ride + Stipend", deadline: "2025-03-31" },
      { name: "ICDF Higher Education Scholarship", source: "Government", amount: "Full Tuition + Airfare", deadline: "2025-03-15" },
      { name: "NTU International Excellence", source: "University", schoolId: ntuId, amount: "50-100% Tuition Waiver", deadline: "2025-03-15" },
      { name: "NCKU Distinguished Student Scholarship", source: "University", schoolId: nckuId, amount: "250,000 TWD Total", deadline: "2025-04-10" }
    ];

    for (const s of scholarships) {
      await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
        ...s,
        isActive: true,
        eligibleDegrees: ["Bachelor", "Master", "PhD"]
      });
    }

    // ─── 5. BUSINESSES ─────────────────────────────────────────────────────
    console.log("Populating Businesses...");
    
    // TSMC
    const tsmcId = ID.unique();
    await databases.createDocument(DB_ID, "Businesses", tsmcId, {
      ownerId: createdUsers.business,
      companyName: "Taiwan Semiconductor Manufacturing Company (TSMC)",
      industry: "Semiconductors",
      city: "Hsinchu",
      description: "TSMC is the world's most valuable semiconductor foundry and a key player in the global technology landscape.",
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/TSMC_logo.svg/1200px-TSMC_logo.svg.png"
    });

    // ASUS
    const asusId = ID.unique();
    await databases.createDocument(DB_ID, "Businesses", asusId, {
      ownerId: createdUsers.business,
      companyName: "ASUSTeK Computer Inc. (ASUS)",
      industry: "Electronics / IT",
      city: "Taipei",
      description: "ASUS is a multinational computer and phone hardware and electronics company headquartered in Beitou District, Taipei, Taiwan.",
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/ASUS_Logo.svg/1200px-ASUS_Logo.svg.png"
    });

    // Shopee
    const shopeeId = ID.unique();
    await databases.createDocument(DB_ID, "Businesses", shopeeId, {
      ownerId: createdUsers.business,
      companyName: "Shopee Taiwan",
      industry: "E-commerce",
      city: "Taipei",
      description: "Shopee is the leading e-commerce platform in Southeast Asia and Taiwan, offering a seamless and secure shopping experience.",
      isApproved: true,
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/1200px-Shopee.svg.png"
    });

    // ─── 6. JOBS ───────────────────────────────────────────────────────────
    console.log("Populating Jobs...");
    const jobs = [
      { biz: tsmcId, title: "AI & ML Research Intern", loc: "Hsinchu Science Park", type: "Internship", visa: true },
      { biz: asusId, title: "Hardware Design Engineer", loc: "Taipei, Beitou", type: "Full-time", visa: true },
      { biz: shopeeId, title: "Backend Developer (Go/Python)", loc: "Taipei, Xinyi", type: "Full-time", visa: true },
      { biz: shopeeId, title: "Operations Analyst (Southeast Asia)", loc: "Taipei, Xinyi", type: "Part-time", visa: true }
    ];

    let tsmcJobId = "";
    for (const j of jobs) {
      const id = ID.unique();
      if (j.biz === tsmcId) tsmcJobId = id;
      await databases.createDocument(DB_ID, "Jobs", id, {
        businessId: j.biz,
        title: j.title,
        jobType: j.type,
        location: j.loc,
        requirements: "Requires high proficiency in relevant technical stack and English communication.",
        deadline: "2025-06-30",
        isActive: true,
        allowsStudentVisa: j.visa
      });
    }

    // ─── 7. STUDENT PROFILE ────────────────────────────────────────────────
    console.log("Populating Student Profile...");
    const studentDocId = ID.unique();
    await databases.createDocument(DB_ID, "Students", studentDocId, {
      accountId: createdUsers.student,
      fullName: "Nguyễn Mạnh Hùng",
      nationality: "Vietnam",
      highestEducation: "Bachelor of Engineering (HUST)",
      englishLevel: "IELTS 7.5",
      chineseLevel: "TOCFL 3",
      skills: ["Machine Learning", "React", "Next.js", "TypeScript"],
      gpa: "3.82/4.0",
      targetDegree: "Master",
      targetCityTaiwan: "Taipei",
      hasPassport: true,
      workPermitStatus: "Eligible"
    });

    // ─── 8. ACTIVITY ───────────────────────────────────────────────────────
    console.log("Simulating Activity...");
    await databases.createDocument(DB_ID, "Applications", ID.unique(), {
      studentId: studentDocId,
      targetId: tsmcJobId,
      targetType: "job",
      status: "pending",
      appliedAt: new Date().toISOString(),
      notes: "Extremely interested in semiconductor AI research."
    });

    await databases.createDocument(DB_ID, "Saved_Items", ID.unique(), {
      studentId: studentDocId,
      itemType: "scholarship",
      itemId: "MOE_REF_2025",
      savedAt: new Date().toISOString()
    });

    console.log("♻️ Revalidating Paths...");
    revalidatePath("/");
    revalidatePath("/schools");
    revalidatePath("/scholarships");
    revalidatePath("/jobs");
    revalidatePath("/student-portal");
    revalidatePath("/school-portal");
    revalidatePath("/dashboard");
    revalidatePath("/portal");

    console.log("✅ Seeding Completed Successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    return { success: false, error: String(error) };
  }
}

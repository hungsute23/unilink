import { Client, Databases, ID, Users, Query } from "node-appwrite";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const auth = new Users(client);
const DB_ID = process.env.APPWRITE_DATABASE_ID!;

async function runDirectSeed() {
  console.log("🚀 Starting Full Direct API Seed...");

  try {
    // 1. Users
    console.log("Syncing Users...");
    const userEmails = {
      admin: "admin@unilink.com",
      student: "student@unilink.com",
      school: "school@unilink.com",
      business: "business@unilink.com"
    };
    const createdUsers: Record<string, string> = {};
    for (const [role, email] of Object.entries(userEmails)) {
      try {
        const list = await auth.list([Query.equal("email", email)]);
        if (list.total > 0) {
            createdUsers[role] = list.users[0].$id;
        } else {
            const user = await auth.create(ID.unique(), email, undefined, "Unilink123!", role.charAt(0).toUpperCase() + role.slice(1));
            createdUsers[role] = user.$id;
        }
      } catch (e) { console.log(`User ${role} sync...`); }
    }

    // 2. Schools
    console.log("Creating Schools...");
    const schools = [
      { name: "National Taiwan University (NTU)", city: "Taipei", ranking: "#1", email: "admission@ntu.edu.tw" },
      { name: "National Cheng Kung University (NCKU)", city: "Tainan", ranking: "#2", email: "admission@ncku.edu.tw" },
      { name: "Feng Chia University (FCU)", city: "Taichung", ranking: "Top Private", email: "admission@fcu.edu.tw" }
    ];
    const schoolIds: string[] = [];
    for (const s of schools) {
      const id = ID.unique();
      schoolIds.push(id);
      await databases.createDocument(DB_ID, "Schools", id, {
        ownerId: createdUsers.school,
        schoolName: s.name,
        contactEmail: s.email,
        city: s.city,
        ranking: s.ranking,
        description: `${s.name} is a premier institution.`,
        hasDorm: true
      });
      
      // Admission Term for each school
      const termId = ID.unique();
      await databases.createDocument(DB_ID, "Admission_Terms", termId, {
        schoolId: id,
        termName: "Fall 2025 Intake",
        applyStartDate: "2025-01-01",
        applyEndDate: "2025-05-30"
      });

      // Programs
      await databases.createDocument(DB_ID, "Programs", ID.unique(), {
        termId: termId,
        departmentName: "Computer Science",
        degreeLevel: "Undergraduate",
        languageInstruction: "English"
      });
      console.log(`✅ Created School & Academic data for: ${s.name}`);
    }

    // 3. Scholarships
    console.log("Creating Scholarships...");
    const scholarships = [
      { name: "MOE Taiwan Scholarship", source: "Government", deadline: "2025-03-31" },
      { name: "NTU International Excellence", source: "University", deadline: "2025-05-15", schoolId: schoolIds[0] }
    ];
    for (const s of scholarships) {
      await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
        ...s,
        isActive: true,
        eligibleDegrees: ["Bachelor", "Master", "PhD"]
      });
    }

    // 4. Businesses & Jobs
    console.log("Creating Businesses & Jobs...");
    const businesses = [
      { name: "TSMC", ind: "Semiconductors", city: "Hsinchu" },
      { name: "ASUS", ind: "Electronics", city: "Taipei" }
    ];
    for (const b of businesses) {
      const bizId = ID.unique();
      await databases.createDocument(DB_ID, "Businesses", bizId, {
        ownerId: createdUsers.business,
        companyName: b.name,
        industry: b.ind,
        city: b.city
      });
      
      await databases.createDocument(DB_ID, "Jobs", ID.unique(), {
        businessId: bizId,
        title: `${b.name} Tech Graduate Program`,
        jobType: "Full-time",
        location: b.city,
        requirements: "Excellent technical skills.",
        deadline: "2025-12-31",
        isActive: true
      });
    }

    console.log("🥳 FULL Seeding Success via Direct API!");
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
  }
}

runDirectSeed();

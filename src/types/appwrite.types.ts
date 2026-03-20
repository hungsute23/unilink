import { Models } from "appwrite";

// ─── Base Documents ──────────────────────────────────────────────────────────

export interface SystemConfig extends Models.Document {
  key: string;
  value: string;
}

export interface Student extends Models.Document {
  accountId: string;
  fullName: string;
  avatarUrl?: string;
  nationality?: string;
  highestEducation?: string;
  englishLevel?: string;
  chineseLevel?: string;
  skills?: string[];
  dateOfBirth?: Date | string;
  gpa?: string;
  targetDegree?: string;
  targetCityTaiwan?: string;
  hasPassport?: boolean;
  workPermitStatus?: string;
  vietnameseId?: string;
}

export interface School extends Models.Document {
  ownerId: string;
  schoolName: string;
  website?: string;
  contactEmail: string;
  description?: string;
  city?: string;
  logoUrl?: string;
  ranking?: string;
  hasDorm?: boolean;
  isApproved?: boolean;
}

export interface AdmissionTerm extends Models.Document {
  schoolId: string;
  termName: string;
  applyStartDate: Date | string;
  applyEndDate: Date | string;
  intakeMonth?: string;
  notes?: string;
}

export interface Program extends Models.Document {
  termId: string;
  departmentName: string;
  degreeLevel: string;
  languageInstruction: string;
  tuitionFee?: string;
  minEnglishReq?: string;
  minChineseReq?: string;
  requiredDocs?: string[];
  campusCity?: string;
  dormAvailable?: boolean;
  applicationFee?: string;
  scholarshipIds?: string[];
  programUrl?: string;
}

export interface Scholarship extends Models.Document {
  name: string;
  source: string;
  schoolId?: string;
  amount?: string;
  duration?: string;
  coversTuition?: boolean;
  coversDorm?: boolean;
  coversStipend?: boolean;
  minGpa?: string;
  minEnglishReq?: string;
  minChineseReq?: string;
  eligibleDegrees?: string[];
  eligibleCountries?: string[];
  requirements?: string;
  deadline: Date | string;
  applicationUrl?: string;
  isActive?: boolean;
}

export interface Business extends Models.Document {
  ownerId: string;
  companyName: string;
  industry: string;
  website?: string;
  description?: string;
  city?: string;
  logoUrl?: string;
  isApproved?: boolean;
}

export interface Job extends Models.Document {
  businessId: string;
  title: string;
  jobType: string;
  salaryRange?: string;
  location: string;
  requirements: string;
  deadline: Date | string;
  isActive?: boolean;
  hoursPerWeek?: number;
  allowsStudentVisa?: boolean;
  chineseRequired?: string;
  district?: string;
  benefits?: string;
}

export interface Application extends Models.Document {
  studentId: string;
  targetId: string;
  targetType: string;
  status?: string;
  appliedAt: Date | string;
  documentUrls?: string[];
  notes?: string;
  reviewNote?: string;
}

export interface SavedItem extends Models.Document {
  studentId: string;
  itemType: string;
  itemId: string;
  savedAt: Date | string;
}

export interface Post extends Models.Document {
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags?: string[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  publishedAt?: Date | string;
  viewCount?: number;
}

// ─── Utility Types ──────────────────────────────────────────────────────────

export type UserRole = "student" | "school" | "business" | "admin";
export type PostStatus = "pending" | "approved" | "rejected";

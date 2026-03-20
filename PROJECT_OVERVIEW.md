# 🚀 UniLink Project Overview (AI-Ready)

Welcome, Agent. **UniLink** is a comprehensive EdTech & Career platform designed to connect international students with universities and job opportunities in **Taiwan**. It uses a multi-portal architecture to serve Students, Schools, Businesses, and Admins.

---

## 🛠 Tech Stack & Core Systems

- **Frontend**: Next.js 16 (Turbopack), React 19, Tailwind CSS (Vanilla).
- **Backend**: Appwrite (BaaS) for Auth, Database, Storage, and Teams.
- **State & Theme**: `next-themes` (Light/Dark/System), React Transitions.
- **Typography**: Standard **Inter** font (Professional & Clean).
- **Icons**: `lucide-react`.

---

## 📂 Architecture: Multi-Portal System

The project uses Next.js **Route Groups** to isolate different user experiences:

| Path Group | Purpose | Key Routes |
| :--- | :--- | :--- |
| `(public)` | SEO-friendly landing & discovery | `/`, `/schools`, `/scholarships`, `/jobs` |
| `(auth)` | Standardized login/registration | `/login`, `/register` |
| `(student)` | Personal workspace for candidates | `/student-portal`, `/applications`, `/saved` |
| `(school)` | University management dashboard | `/school-portal`, `/terms`, `/programs` |
| `(partner)` | Business/Employer dashboard | `/dashboard` (Jobs, Applicants) |
| `(admin)` | Super Admin controls | `/portal` (Users, Moderation, Config) |

---

## 🔐 Authentication & Role Redirection

Authentication is cookie-based via Appwrite sessions.

### **Server-Side Auth (`src/lib/appwrite/server.ts`)**
- `createSessionClient()`: Uses the logged-in user's session cookie. **Requires a session!**
- `createAdminClient()`: Uses the `APPWRITE_API_KEY` for background/privileged tasks.

### **Smart Redirection (`src/lib/appwrite/actions/auth.actions.ts`)**
- User roles are stored in `user.prefs.role`.
- **Login/Register Flow**: Both actions return the `role` to the client.
- **Redirection Logic**:
    - `student` → `/student-portal`
    - `school` → `/school-portal`
    - `business` → `/dashboard`
    - `admin` → `/portal`

---

## 📊 Data Model & Collections

The system consists of the following key entities:
- **Schools**: University profiles, logos, descriptions.
- **Admission Terms**: Recruitment cycles (Fall/Spring).
- **Programs**: Academic degrees (CS, MBA, etc.) linked to a school.
- **Jobs**: Work opportunities linked to a business profile.
- **Scholarships**: University or Government funded aid.
- **Applications**: Linking students to programs or jobs.

---

## 🚀 Key Implementation Details

1. **Header System**: `src/components/public/Header.tsx` is dynamic. It checks for `loggedInUser` and shows appropriate links based on the role preference.
2. **Form Handling**: Auth forms (`LoginForm`, `RegisterForm`) use an explicit `onSubmit` pattern with `useTransition` for high-fidelity state management.
3. **Seeding Environment**: Access `/seed` to populate the Appwrite instance with rich, high-fidelity demo data (NTU, TSMC, ASUS, etc.).
4. **Theme Stabilization**: `ThemeProvider` is optimized for React 19 with explicit props to prevent script-tag warnings.

---

## 💡 Important Rules for New Agents

1. **Always use `createAdminClient` for role-fetching** or profile creation tasks.
2. **Do NOT import `node-appwrite` in Client Components** (`use client`). Use clean interfaces or the client SDK if necessary.
3. **Pathnaming**: Be careful with `(partner)` folder mapping to `/dashboard` and `(admin)` folder mapping to `/portal`.
4. **Typography**: Stick to the **Inter** font. Remove any `italic` or `font-black` (900) unless explicitly requested for branding.

---
*Created by Antigravity (Advanced Agentic Coding)*

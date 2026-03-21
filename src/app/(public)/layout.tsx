import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";

export const metadata: Metadata = {
  title: "Public Portal | UniLink",
};

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const rawUser = await getLoggedInUser();
  const user = rawUser
    ? { $id: rawUser.$id, name: rawUser.name, email: rawUser.email, prefs: { ...rawUser.prefs } }
    : null;

  return (
    <>
      <Header user={user} />
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-[100]">
        <ThemeToggle />
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}

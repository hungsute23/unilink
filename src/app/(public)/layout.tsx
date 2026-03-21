import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
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
      <main>{children}</main>
      <Footer />
    </>
  );
}

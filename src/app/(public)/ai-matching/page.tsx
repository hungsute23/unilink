import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { AIMatchingClient } from "./AIMatchingClient";

export const metadata: Metadata = {
  title: "AI Matching – UniLink",
  description: "Let our AI find the best universities, scholarships, and jobs for your profile.",
};

export default async function AIMatchingPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login?redirect=/ai-matching");
  return <AIMatchingClient />;
}

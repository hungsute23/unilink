import type { Metadata } from "next";
import { AIMatchingClient } from "./AIMatchingClient";

export const metadata: Metadata = {
  title: "AI Matching – UniLink",
  description: "Let our AI find the best universities, scholarships, and jobs for your profile.",
};

export default function AIMatchingPage() {
  return <AIMatchingClient />;
}

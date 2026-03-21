import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { getBusinessProfile } from "@/lib/appwrite/queries/business.queries";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { BusinessProfileForm } from "./BusinessProfileForm";

export const metadata = { title: "Company Profile | Partner Dashboard" };

export default async function BusinessProfilePage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const raw = await getBusinessProfile(user.$id);
  if (!raw) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
        <p className="text-muted-foreground">No business profile found for your account.</p>
      </div>
    );
  }

  const business = JSON.parse(JSON.stringify(raw));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
          <Building2 className="w-4 h-4" />
          Business Portal
        </div>
        <h1 className="text-4xl font-black tracking-tighter">Company Profile</h1>
        <p className="text-muted-foreground font-medium mt-1">
          Keep your company information up-to-date for students browsing jobs.
        </p>
      </div>
      <BusinessProfileForm business={business} />
    </div>
  );
}

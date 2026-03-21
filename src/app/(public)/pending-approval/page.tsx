import { getLoggedInUser } from "@/lib/appwrite/queries/auth.queries";
import { redirect } from "next/navigation";
import { Clock, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/appwrite/actions/auth.actions";

export const metadata = { title: "Pending Approval - UniLink" };

export default async function PendingApprovalPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const role = (user.prefs as any)?.role;
  const isPartner = role === "school" || role === "business";
  if (!isPartner) redirect("/");

  const entityLabel = role === "school" ? "institution" : "company";

  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tighter">Account Under Review</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your {entityLabel} account is currently being reviewed by the UniLink team.
            We typically process new partner applications within <span className="font-semibold text-foreground">1–2 business days</span>.
          </p>
        </div>

        {/* Steps */}
        <div className="glass-card border-none rounded-3xl p-6 text-left space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">What happens next</p>
          {[
            { icon: CheckCircle2, text: "Our team verifies your organization details" },
            { icon: Mail,         text: `You'll receive an email at ${user.email} once approved` },
            { icon: CheckCircle2, text: "Log back in to access your full partner dashboard" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <step.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline" className="rounded-2xl h-12 px-8 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <form action={logoutUser}>
            <Button type="submit" variant="ghost" className="rounded-2xl h-12 px-8 text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:support@unilink.tw" className="underline hover:text-foreground">
            support@unilink.tw
          </a>
        </p>
      </div>
    </div>
  );
}

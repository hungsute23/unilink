"use client";

import React from "react";
import { seedPlatformData } from "@/lib/appwrite/actions/seed.actions";
import { seedContentData } from "@/lib/appwrite/actions/seed-content.actions";
import { resetAndSeed } from "@/lib/appwrite/actions/seed-reset.actions";
import { setupStorageBuckets } from "@/lib/appwrite/actions/setup-storage.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  RotateCcw,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = React.useState(false);
  const [loadingContent, setLoadingContent] = React.useState(false);
  const [loadingReset, setLoadingReset] = React.useState(false);
  const [loadingStorage, setLoadingStorage] = React.useState(false);
  const [complete, setComplete] = React.useState(false);
  const [completeContent, setCompleteContent] = React.useState(false);
  const [completeReset, setCompleteReset] = React.useState(false);
  const [completeStorage, setCompleteStorage] = React.useState(false);
  const [storageResults, setStorageResults] = React.useState<{ name: string; id: string; status: string }[]>([]);
  const [lastResult, setLastResult] = React.useState<{ ok: boolean; msg: string } | null>(null);

  const handleSetupStorage = async () => {
    setLoadingStorage(true);
    try {
      const result = await setupStorageBuckets();
      if (result.success || (result as any).results?.length > 0) {
        setStorageResults((result as any).results ?? []);
        setCompleteStorage(true);
        toast.success("Storage buckets ready!");
      } else {
        toast.error(`Storage setup failed: ${(result as any).error}`);
      }
    } catch (error) {
      toast.error("Unexpected error during storage setup.");
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedPlatformData();
      if (result.success) {
        toast.success("Platform data seeded successfully!");
        setComplete(true);
      } else {
        toast.error(`Seeding failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during seeding.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedContent = async () => {
    setLoadingContent(true);
    try {
      const result = await seedContentData();
      if (result.success) {
        toast.success("Rich content data seeded successfully!");
        setCompleteContent(true);
      } else {
        toast.error(`Content seeding failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("⚠️ This will DELETE all data and re-seed from scratch. Continue?")) return;
    setLoadingReset(true);
    setLastResult(null);
    try {
      const result = await resetAndSeed();
      if (result.success) {
        setLastResult({ ok: true, msg: "✅ Full reset & re-seed complete!" });
        setCompleteReset(true);
        setComplete(true);
        setCompleteContent(true);
      } else {
        setLastResult({ ok: false, msg: `❌ Failed: ${result.error}` });
      }
    } catch (error: any) {
      setLastResult({ ok: false, msg: `❌ Exception: ${error?.message ?? String(error)}` });
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background p-6">
      <div className="w-full max-w-md">
        <div className="bg-background/50 backdrop-blur-3xl border border-primary/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
          
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-2">
              <Database className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Intelligence <span className="text-primary italic">Seeding</span>
            </h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-60">
              Dev Deployment Module v1.0
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Step 1 — 6 Schools, 7 Terms, 18 Programs
              </p>
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Step 1 — 6 Businesses, 4 User Accounts
              </p>
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Step 2 — 18 Detailed Jobs + 8 Scholarships
              </p>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-amber-600/80 leading-relaxed uppercase tracking-wider">
                 Caution: This will create new records. Ensure your collection attributes are pre-configured before execution.
               </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Storage Setup */}
            {!completeStorage ? (
              <Button
                onClick={handleSetupStorage}
                disabled={loadingStorage}
                variant="outline"
                className="w-full h-14 rounded-2xl border-sky-500/30 hover:bg-sky-500/5 text-sky-600 group transition-all duration-500"
              >
                {loadingStorage ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5" />
                    <span className="font-black italic uppercase">Step 0 — Setup Storage Buckets</span>
                  </div>
                )}
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1.5">
                <p className="text-sky-600 font-black italic uppercase text-sm text-center">✓ Storage Ready</p>
                {storageResults.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-xs font-mono px-2">
                    <span className="text-muted-foreground">{r.name}</span>
                    <span className={r.status === "error" ? "text-red-500" : "text-emerald-600"}>
                      {r.status === "created" ? "✓ created" : r.status === "exists" ? "✓ exists" : "✗ error"}
                      {" "}<span className="opacity-60">{r.id}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!complete ? (
              <Button
                onClick={handleSeed}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group transition-all duration-500"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <span className="font-black italic uppercase">Step 1 — Seed Base Data</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-500 font-black italic uppercase text-sm">✓ Step 1 Complete</p>
              </div>
            )}

            {!completeContent ? (
              <Button
                onClick={handleSeedContent}
                disabled={loadingContent}
                variant="outline"
                className="w-full h-14 rounded-2xl border-primary/30 hover:bg-primary/5 group transition-all duration-500"
              >
                {loadingContent ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <span className="font-black italic uppercase">Step 2 — Seed Rich Content</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-500 font-black italic uppercase text-sm">✓ Step 2 Complete</p>
              </div>
            )}

            <div className="pt-2 border-t border-border/40">
              {!completeReset ? (
                <Button
                  onClick={handleReset}
                  disabled={loadingReset}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-red-500/30 hover:bg-red-500/5 text-red-500 group transition-all duration-500"
                >
                  {loadingReset ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <div className="flex items-center gap-3">
                      <RotateCcw className="w-5 h-5" />
                      <span className="font-black italic uppercase">Force Reset &amp; Re-seed All</span>
                    </div>
                  )}
                </Button>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-emerald-500 font-black italic uppercase text-sm">✓ Reset Complete — Fresh Data Loaded</p>
                </div>
              )}
            </div>

            {complete && completeContent && (
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5">
                  <span className="font-black italic uppercase">Access Portals</span>
                </Button>
              </Link>
            )}
          </div>

          {lastResult && (
            <div className={`p-4 rounded-2xl border text-xs font-mono break-all leading-relaxed ${lastResult.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-red-500/10 border-red-500/30 text-red-600"}`}>
              {lastResult.msg}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground/40 cursor-not-allowed">
            <Lock className="w-3 h-3" />
            <span>Developer Permission Locked</span>
          </div>

        </div>
      </div>
    </div>
  );
}

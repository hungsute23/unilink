"use client";

import React from "react";
import { seedPlatformData } from "@/lib/appwrite/actions/seed.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const result = await seedPlatformData();
      if (result.success) {
        toast.success("Platform successfully seeded with premium data!");
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
                Master Records (NTU & TSMC)
              </p>
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Cross-Portal Identities
              </p>
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Simulated Applications
              </p>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-amber-600/80 leading-relaxed uppercase tracking-wider">
                 Caution: This will create new records. Ensure your collection attributes are pre-configured before execution.
               </p>
            </div>
          </div>

          {!complete ? (
            <Button 
               onClick={handleSeed}
               disabled={loading}
               className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group transition-all duration-500"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-black italic uppercase text-lg">Ignite Environment</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-emerald-500 font-black italic uppercase">Deployment Completed</p>
               </div>
               <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-primary/20 hover:bg-primary/5">
                    <span className="font-black italic uppercase">Access Intelligence Portals</span>
                  </Button>
               </Link>
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

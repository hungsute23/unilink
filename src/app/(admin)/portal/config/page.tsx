import { getSystemConfigs } from "@/lib/appwrite/actions/admin.actions";
import { 
  Settings2, 
  Search,
  AlertCircle,
  Save,
  RotateCcw,
  Zap,
  Globe,
  Database,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function SystemConfigPage() {
  const result = await getSystemConfigs();
  
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card border-none rounded-3xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Failed to load system configs</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">{result.error}</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12">Try Again</Button>
      </div>
    );
  }

  const configs = JSON.parse(JSON.stringify(result.configs!));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
            <Settings2 className="w-4 h-4" />
            Core Configuration
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient">
            System Control
          </h1>
          <p className="text-muted-foreground font-medium mt-2 max-w-xl">
            Global variables that dictate platform behavior. Manage maintenance windows, enrollment semesters, and API rate limits.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-black border-primary/20 hover:bg-primary/5 transition-all gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
          <Button className="h-14 px-8 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card border-none rounded-[32px] p-8 shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Live Variables
                </h3>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                  {configs.length} Active Configs
                </Badge>
             </div>

             <div className="space-y-4">
                {configs.map((config: any) => (
                  <div key={config.$id} className="group relative flex items-center justify-between p-6 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{config.key}</p>
                        <Input 
                          defaultValue={config.value} 
                          className="h-8 p-0 bg-transparent border-none text-base font-bold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:opacity-20"
                          placeholder="Empty value..."
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {configs.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium italic">No system configurations found in the database.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-rose-500 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-rose-500/20">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Lock className="w-6 h-6" />
                  </div>
                  <Switch className="data-[state=checked]:bg-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2 uppercase tracking-tighter">Maintenance Mode</h3>
                <p className="text-xs font-medium text-white/70">Enable to lock the platform and display a maintenance message to all non-admin users.</p>
             </div>
             <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          </div>

          <div className="glass-card border-none rounded-[32px] p-8 shadow-xl">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">
                <Globe className="w-3 h-3" />
                Regional Settings
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-60">System Language</label>
                  <div className="flex gap-2">
                    {["English", "Traditional Chinese", "Vietnamese"].map((lang) => (
                      <Badge key={lang} variant="outline" className={cn(
                        "rounded-lg px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors",
                        lang === "English" && "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold opacity-60">Session Timeout (min)</label>
                  <Input defaultValue="1440" className="h-10 bg-muted/30 border-none rounded-xl font-bold" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getGlobalScholarships } from "@/lib/appwrite/actions/admin.actions";
import { 
  GraduationCap, 
  Plus, 
  Search,
  Filter,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  Globe,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { ScholarshipForm } from "@/components/admin/ScholarshipForm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default async function ScholarshipsManagementPage() {
  const result = await getGlobalScholarships();
  
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card border-none rounded-3xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Failed to load scholarships</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">{result.error}</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12">Try Again</Button>
      </div>
    );
  }

  const scholarships = JSON.parse(JSON.stringify(result.documents!));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
            <GraduationCap className="w-4 h-4" />
            Funding Management
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient">
            Scholarship Hub
          </h1>
          <p className="text-muted-foreground font-medium mt-2 max-w-xl">
            Centralized control for government (MOE, ICDF) and school-specific funding. Manage visibility, deadlines, and global eligibility.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group w-64 hidden xl:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search programs..." 
              className="pl-11 h-14 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all gap-2">
                <Plus className="w-5 h-5" />
                New Scholarship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[18px] glass-card border-none p-0 overflow-hidden shadow-2xl">
              <div className="p-8 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tight">Create Global Program</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium">Add a new government or organization-level scholarship.</DialogDescription>
                </DialogHeader>
                <div className="mt-8">
                  <ScholarshipForm />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-card border-none rounded-3xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-primary/5">
              <TableHead className="py-6 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Scholarship Details</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Provider / Source</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Deadline</TableHead>
              <TableHead className="py-6 px-8 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scholarships.map((s: any) => (
              <TableRow key={s.$id} className="group hover:bg-primary/[0.02] border-primary/5 transition-colors">
                <TableCell className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-tight">{s.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter opacity-60 rounded-md py-0 px-1 border-primary/20">{s.amount || "Variable"}</Badge>
                        <span className="text-[10px] font-medium opacity-40">{s.duration || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-6 px-4">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    {s.source}
                  </div>
                </TableCell>

                <TableCell className="py-6 px-4">
                  {s.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg font-black text-[9px] tracking-widest uppercase">Live</Badge>
                  ) : (
                    <Badge variant="outline" className="opacity-40 font-black text-[9px] tracking-widest uppercase">Draft</Badge>
                  )}
                </TableCell>

                <TableCell className="py-6 px-4">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(s.deadline).toLocaleDateString()}
                  </div>
                </TableCell>

                <TableCell className="py-6 px-8 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 glass-card border-none shadow-2xl">
                       <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/10">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-xs font-bold">Edit Details</span>
                       </DropdownMenuItem>
                       {s.applicationUrl && (
                         <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/10">
                            <Globe className="mr-2 h-4 w-4 text-blue-500" />
                            <a href={s.applicationUrl} target="_blank" className="text-xs font-bold">External Link</a>
                         </DropdownMenuItem>
                       )}
                       <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                       <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors text-rose-500 focus:bg-rose-500/10">
                          <XCircle className="mr-2 h-4 w-4" />
                          <span className="text-xs font-bold">Delete Program</span>
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MapPin, 
  Mail,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Building2,
  School
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { updatePartnerStatus } from "@/lib/appwrite/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Partner {
  $id: string;
  isApproved?: boolean;
  schoolName?: string;
  companyName?: string;
  contactEmail?: string;
  city?: string;
  website?: string;
  $createdAt: string;
}

interface ModerationTableProps {
  partners: Partner[];
  type: "Schools" | "Businesses";
}

export function ModerationTable({ partners, type }: ModerationTableProps) {
  const [data, setData] = useState<Partner[]>(partners);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusUpdate = async (docId: string, approve: boolean) => {
    setIsUpdating(docId);
    try {
      const result = await updatePartnerStatus(type, docId, approve);
      if (result.success) {
        setData(data.map(p => 
          p.$id === docId ? { ...p, isApproved: approve } : p
        ));
        toast.success(approve ? "Partner approved" : "Partner rejected");
        router.refresh();
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="glass-card border-none rounded-3xl overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-primary/5">
            <TableHead className="py-6 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Partner Details</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Location & Contact</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Requested On</TableHead>
            <TableHead className="py-6 px-8 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Decision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((partner) => (
            <TableRow key={partner.$id} className="group hover:bg-primary/[0.02] border-primary/5 transition-colors">
              <TableCell className="py-6 px-8">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                    type === "Schools" ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {type === "Schools" ? <School className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-black text-base tracking-tight">{partner.schoolName || partner.companyName}</p>
                    {partner.website && (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 mt-1 uppercase tracking-widest">
                        Visit Website <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="py-6 px-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                    <MapPin className="w-3 h-3 text-primary" />
                    {partner.city || "Not specified"}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium opacity-50">
                    <Mail className="w-3 h-3" />
                    {partner.contactEmail || "No email"}
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-6 px-4">
                {partner.isApproved === true && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                    Approved
                  </Badge>
                )}
                {partner.isApproved === false && (
                  <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                    Rejected
                  </Badge>
                )}
                {partner.isApproved === undefined && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest animate-pulse">
                    Pending Review
                  </Badge>
                )}
              </TableCell>

              <TableCell className="py-6 px-4">
                <p className="text-xs font-bold opacity-50">{new Date(partner.$createdAt).toLocaleDateString()}</p>
              </TableCell>

              <TableCell className="py-6 px-8 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isUpdating === partner.$id}
                    onClick={() => handleStatusUpdate(partner.$id, true)}
                    className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isUpdating === partner.$id}
                    onClick={() => handleStatusUpdate(partner.$id, false)}
                    className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                  <div className="w-[1px] h-6 bg-border mx-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 glass-card border-none shadow-2xl">
                       <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3 py-2">Moderation Options</DropdownMenuLabel>
                       <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/10">
                          <Globe className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-xs font-bold text-primary">View Public Profile</span>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                       <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors text-rose-500 focus:bg-rose-500/10">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span className="text-xs font-bold">Delete Permanent</span>
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-20 text-center">
                <p className="text-muted-foreground font-medium italic">No partners found in this category.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

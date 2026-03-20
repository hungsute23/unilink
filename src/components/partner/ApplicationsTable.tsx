"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Calendar, 
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationReviewModal } from "./ApplicationReviewModal";

interface ApplicationsTableProps {
  applications: any[];
}

const statusStyles: Record<string, { color: string, icon: any }> = {
  pending: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  reviewing: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Search },
  interviewing: { color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: User },
  accepted: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: XCircle },
};

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  if (applications.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-40">
        <User className="w-12 h-12 mx-auto mb-4" />
        <p className="font-bold">No applications received yet.</p>
        <p className="text-sm">Once students apply to your jobs, they'll appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border bg-card/30 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-black h-14 pl-6 uppercase tracking-widest text-[10px]">Candidate</TableHead>
              <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Applied Job</TableHead>
              <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Date</TableHead>
              <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-black h-14 pr-6 text-right uppercase tracking-widest text-[10px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const statusStyle = statusStyles[app.status] || statusStyles.pending;
              const StatusIcon = statusStyle.icon;

              return (
                <TableRow key={app.$id} className="group transition-colors hover:bg-muted/30">
                  <TableCell className="pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm group-hover:text-primary transition-colors">
                          {app.student?.fullName || "Anonymous Student"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {app.student?.nationality || "Global"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />
                      <span className="font-bold text-xs truncate max-w-[150px]">{app.job?.title || "Unknown Job"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(app.$createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 w-fit border shadow-sm",
                        statusStyle.color
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                      onClick={() => setSelectedApplication(app)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ApplicationReviewModal 
        application={selectedApplication} 
        isOpen={!!selectedApplication} 
        onClose={() => setSelectedApplication(null)} 
      />
    </>
  );
}

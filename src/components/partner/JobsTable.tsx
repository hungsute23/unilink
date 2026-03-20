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
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink
} from "lucide-react";
import { toggleJobStatus, deleteJob } from "@/lib/appwrite/actions/business.actions";
import { cn } from "@/lib/utils";

interface JobsTableProps {
  jobs: any[];
  onEdit: (job: any) => void;
}

export function JobsTable({ jobs, onEdit }: JobsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function handleToggleStatus(jobId: string, currentStatus: boolean) {
    await toggleJobStatus(jobId, currentStatus);
  }

  async function handleDelete(jobId: string) {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    setIsDeleting(jobId);
    await deleteJob(jobId);
    setIsDeleting(null);
  }

  if (jobs.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-40">
        <Briefcase className="w-12 h-12 mx-auto mb-4" />
        <p className="font-bold">No job postings found.</p>
        <p className="text-sm">Click "Post New Job" to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-card/30 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-black h-14 pl-6 uppercase tracking-widest text-[10px]">Job Details</TableHead>
            <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Hours</TableHead>
            <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Status</TableHead>
            <TableHead className="font-black h-14 uppercase tracking-widest text-[10px]">Features</TableHead>
            <TableHead className="font-black h-14 pr-6 text-right uppercase tracking-widest text-[10px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.$id} className="group transition-colors hover:bg-muted/30">
              <TableCell className="pl-6 py-5">
                <div className="flex flex-col">
                  <span className="font-black text-lg group-hover:text-primary transition-colors">{job.title}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium italic">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {job.hoursPerWeek}h/wk
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={job.isActive ? "default" : "secondary"}
                  className={cn(
                    "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-wider transition-all",
                    job.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm shadow-emerald-500/10" : "opacity-60"
                  )}
                >
                  {job.isActive ? "Active" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {job.allowsStudentVisa && (
                    <Badge variant="outline" className="rounded-md px-1.5 py-0 font-black text-[8px] border-primary/20 text-primary uppercase">Visa</Badge>
                  )}
                  {job.chineseRequired && (
                    <Badge variant="outline" className="rounded-md px-1.5 py-0 font-black text-[8px] border-amber-500/20 text-amber-600 uppercase">CN Req</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => onEdit(job)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-9 h-9 rounded-xl transition-all",
                      job.isActive ? "hover:bg-amber-100 text-amber-600" : "hover:bg-emerald-100 text-emerald-600"
                    )}
                    onClick={() => handleToggleStatus(job.$id, job.isActive)}
                  >
                    {job.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting === job.$id}
                    className="w-9 h-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-50"
                    onClick={() => handleDelete(job.$id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

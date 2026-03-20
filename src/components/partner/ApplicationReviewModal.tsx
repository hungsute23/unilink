"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Languages, 
  FileText, 
  Calendar,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { updateApplicationStatus } from "@/lib/appwrite/actions/business.actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/GlassCard";

interface ApplicationReviewModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pending Review", icon: Clock, color: "text-amber-500" },
  { value: "reviewing", label: "In Review", icon: User, color: "text-blue-500" },
  { value: "interviewing", label: "Interviewing", icon: Briefcase, color: "text-purple-500" },
  { value: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-emerald-500" },
  { value: "rejected", label: "Not Proceeding", icon: XCircle, color: "text-rose-500" },
];

export function ApplicationReviewModal({ application, isOpen, onClose }: ApplicationReviewModalProps) {
  const [status, setStatus] = useState(application?.status || "pending");
  const [reviewNote, setReviewNote] = useState(application?.reviewNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const student = application.student;
  const job = application.job;

  async function handleUpdate() {
    setIsSubmitting(true);
    try {
      const result = await updateApplicationStatus(application.$id, status, reviewNote);
      if (result.success) {
        toast.success("Application status updated!");
        onClose();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none glass-card shadow-2xl">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black">{student?.fullName || "Student Name"}</h2>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  Applying for <span className="text-primary font-bold">{job?.title}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Current Status</p>
                <Badge className="rounded-full px-4 py-1.5 font-black uppercase text-[10px] tracking-wider">
                  {application.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Info */}
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                  <User className="w-4 h-4" /> Student Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassCard className="p-4 space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-50">Nationality</p>
                    <p className="font-bold">{student?.nationality || "Not specified"}</p>
                  </GlassCard>
                  <GlassCard className="p-4 space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-50">Education</p>
                    <p className="font-bold">{student?.highestEducation || "Not specified"}</p>
                  </GlassCard>
                  <GlassCard className="p-4 space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-50">Mandarin Proficiency</p>
                    <p className="font-bold text-amber-600">{student?.chineseLevel || "None"}</p>
                  </GlassCard>
                  <GlassCard className="p-4 space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-50">English Level</p>
                    <p className="font-bold text-blue-600">{student?.englishLevel || "None"}</p>
                  </GlassCard>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Application Documents
                </h3>
                <div className="p-6 rounded-3xl bg-muted/20 border-2 border-dashed flex flex-col items-center justify-center text-center opacity-60">
                  <FileText className="w-10 h-10 mb-2" />
                  <p className="font-bold text-sm">Resume / CV</p>
                  <Button variant="link" className="text-primary font-black text-xs h-auto p-0 mt-1">
                    <ExternalLink className="w-3 h-3 mr-1" /> View Original Document
                  </Button>
                </div>
              </section>
            </div>

            {/* Review Actions */}
            <div className="space-y-6">
              <section className="space-y-4 bg-muted/30 p-6 rounded-3xl border">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Review Action
                </h3>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Set Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-12 rounded-2xl border-none bg-background shadow-sm font-bold">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-none">
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="h-12 rounded-xl focus:bg-primary/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <opt.icon className={`w-4 h-4 ${opt.color}`} />
                              <span className="font-bold">{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1" htmlFor="reviewNote">Review Notes (Private)</label>
                    <Textarea 
                      id="reviewNote"
                      placeholder="Add internal notes about this candidate..."
                      className="min-h-[120px] rounded-2xl border-none bg-background shadow-sm p-4 text-sm font-medium"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full h-12 rounded-2xl font-black text-sm bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Review"}
                  </Button>
                </div>
              </section>

              <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
                <div className="flex gap-4">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-600 mb-1">Applied Date</h4>
                    <p className="text-sm font-bold">
                      {new Date(application.$createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Application, Student } from "@/types/appwrite.types";
import { updateApplicationStatus } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  User, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";

interface ApplicationDetailsModalProps {
  application: Application & { student?: Student };
  onClose: () => void;
}

export function ApplicationDetailsModal({ application, onClose }: ApplicationDetailsModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [reviewNote, setReviewNote] = useState(application.reviewNote || "");
  const [message, setMessage] = useState("");

  const student = application.student;

  async function handleUpdateStatus(status: string) {
    setIsPending(true);
    setMessage("");

    const result = await updateApplicationStatus(application.$id, status, reviewNote);

    if (result.success) {
      setMessage(`Status updated to ${status} successfully!`);
      setTimeout(onClose, 1500);
    } else {
      setMessage(`Error: ${result.error}`);
      setIsPending(false);
    }
  }

  function getStatusIcon(status?: string) {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "under_review": return <AlertCircle className="w-4 h-4" />;
      case "accepted": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
             </div>
             <div>
                <h2 className="text-xl font-bold leading-tight">Ref: {application.$id.slice(-6).toUpperCase()}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-primary/30 text-primary">
                      {application.targetType}
                   </Badge>
                   <span className="text-[10px] text-muted-foreground font-medium">Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Student Profile Section */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Applicant Details
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-dashed">
                <div className="flex gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-muted border overflow-hidden shrink-0 shadow-inner">
                      {student?.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary font-bold text-xl uppercase">
                           {student?.fullName?.charAt(0) || "U"}
                        </div>
                      )}
                   </div>
                   <div>
                      <h4 className="font-bold text-lg leading-tight">{student?.fullName || "Anonymous Student"}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{student?.nationality || "N/A Nationality"}</p>
                      <Badge variant="secondary" className="mt-2 text-[10px] uppercase font-bold">{student?.highestEducation || "Student"}</Badge>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">GPA</p>
                      <p className="font-semibold text-foreground">{student?.gpa || "N/A"}</p>
                   </div>
                   <div>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">English</p>
                      <p className="font-semibold text-foreground">{student?.englishLevel || "N/A"}</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Student Note */}
          {application.notes && (
             <section className="space-y-3">
                <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Cover Letter / Note</h3>
                <div className="p-4 bg-muted/30 rounded-xl text-sm italic border-l-4 border-primary/30">
                   "{application.notes}"
                </div>
             </section>
          )}

          {/* Documents Section */}
          <section className="space-y-3">
             <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Attached Documents
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.documentUrls && application.documentUrls.length > 0 ? (
                  application.documentUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                             <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-xs font-semibold truncate max-w-[150px]">Document #{i+1}</span>
                       </div>
                       <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic col-span-2 py-4 text-center border rounded-xl bg-muted/10">No documents attached.</p>
                )}
             </div>
          </section>

          {/* Review Section */}
          <section className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Evaluation & Review
             </h3>
             <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Internal / Review Notes</label>
                <Textarea 
                   value={reviewNote}
                   onChange={(e) => setReviewNote(e.target.value)}
                   placeholder="Add notes for other reviewers or feedback for the student..."
                   rows={3}
                   className="bg-background rounded-xl text-sm"
                />
             </div>
             
             {message && (
                <div className={`p-4 rounded-xl text-xs font-bold ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                   {message}
                </div>
             )}

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <Button 
                   onClick={() => handleUpdateStatus("pending")} 
                   disabled={isPending} 
                   variant="outline" 
                   size="sm" 
                   className="rounded-xl border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 uppercase text-[10px] font-bold"
                >
                   Pending
                </Button>
                <Button 
                   onClick={() => handleUpdateStatus("under_review")} 
                   disabled={isPending} 
                   variant="outline" 
                   size="sm" 
                   className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 uppercase text-[10px] font-bold"
                >
                   Review
                </Button>
                <Button 
                   onClick={() => handleUpdateStatus("accepted")} 
                   disabled={isPending} 
                   size="sm" 
                   className="rounded-xl bg-green-600 hover:bg-green-700 uppercase text-[10px] font-bold shadow-lg shadow-green-200/50"
                >
                   Accept
                </Button>
                <Button 
                   onClick={() => handleUpdateStatus("rejected")} 
                   disabled={isPending} 
                   variant="destructive" 
                   size="sm" 
                   className="rounded-xl uppercase text-[10px] font-bold shadow-lg shadow-destructive/20"
                >
                   Reject
                </Button>
             </div>
          </section>
        </div>
        
        <div className="p-4 bg-muted/30 border-t flex justify-between items-center px-6">
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Current Status: 
              <Badge variant="outline" className={`ml-1 flex items-center gap-1.5 py-1 px-3 border-none bg-background shadow-sm`}>
                 {getStatusIcon(application.status)}
                 {application.status?.replace("_", " ")}
              </Badge>
           </div>
           <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending} className="font-bold text-xs uppercase">Close Panel</Button>
        </div>
      </div>
    </div>
  );
}

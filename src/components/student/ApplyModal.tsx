"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createApplication } from "@/lib/appwrite/actions/student.actions";

interface ApplyModalProps {
  targetId: string;
  targetType: "school" | "job" | "scholarship";
  targetName: string;
  studentId?: string;
}

export function ApplyModal({ targetId, targetType, targetName, studentId }: ApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  if (!isOpen) {
    return (
      <Button size="lg" className="w-full py-6 text-lg" onClick={() => {
        if (!studentId) {
          router.push("/login");
          return;
        }
        setIsOpen(true);
      }}>
        Apply Now
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("studentId", studentId!);
    formData.append("targetId", targetId);
    formData.append("targetType", targetType);

    const result = await createApplication(formData);

    if (result.success) {
      setMessage("Application submitted successfully!");
      setTimeout(() => setIsOpen(false), 2000);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setIsPending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Apply for: {targetName}</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-semibold">Attachments (CV, Transcript, etc.)</label>
             <p className="text-xs text-muted-foreground">You can select multiple files.</p>
             <input 
               type="file" 
               name="documents" 
               multiple 
               required
               className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
             />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold">Message / Cover Letter</label>
             <textarea 
               name="notes" 
               rows={4}
               placeholder="Introduce yourself and explain why you're a good fit..."
               className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
             ></textarea>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes("successfully") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

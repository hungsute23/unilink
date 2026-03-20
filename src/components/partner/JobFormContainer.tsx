"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Briefcase } from "lucide-react";
import { JobForm } from "./JobForm";
import { JobsTable } from "./JobsTable";

interface JobFormContainerProps {
  businessId: string;
  jobs: any[];
}

export function JobFormContainer({ businessId, jobs }: JobFormContainerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingJob(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingJob(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] rounded-3xl p-8 glass-card border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black flex items-center gap-3 border-b pb-6">
                <Briefcase className="w-8 h-8 text-primary" />
                {editingJob ? "Edit Job Posting" : "Publish New Job"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 max-h-[70vh] overflow-y-auto px-1 scrollbar-thin">
              <JobForm 
                businessId={businessId} 
                job={editingJob} 
                onSuccess={handleSuccess} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <JobsTable jobs={jobs} onEdit={handleEdit} />
    </div>
  );
}

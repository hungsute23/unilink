"use client";

import { useState } from "react";
import { AdmissionTerm } from "@/types/appwrite.types";
import { createAdmissionTerm, updateAdmissionTerm } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TermFormProps {
  schoolId: string;
  term?: AdmissionTerm;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TermForm({ schoolId, term, onSuccess, onCancel }: TermFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("schoolId", schoolId);

    const result = term 
      ? await updateAdmissionTerm(term.$id, formData)
      : await createAdmissionTerm(formData);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "An error occurred");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="termName">Term Name</Label>
        <Input 
          id="termName" 
          name="termName" 
          defaultValue={term?.termName} 
          placeholder="e.g. Fall 2026, Spring 2026" 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applyStartDate">Apply Start Date</Label>
          <Input 
            id="applyStartDate" 
            name="applyStartDate" 
            type="date" 
            defaultValue={term?.applyStartDate ? new Date(term.applyStartDate).toISOString().split('T')[0] : ""} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applyEndDate">Apply End Date</Label>
          <Input 
            id="applyEndDate" 
            name="applyEndDate" 
            type="date" 
            defaultValue={term?.applyEndDate ? new Date(term.applyEndDate).toISOString().split('T')[0] : ""} 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intakeMonth">Intake Month</Label>
        <Input 
          id="intakeMonth" 
          name="intakeMonth" 
          defaultValue={term?.intakeMonth} 
          placeholder="e.g. September, February" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea 
          id="notes" 
          name="notes" 
          defaultValue={term?.notes} 
          placeholder="Special instructions or details for this term..." 
          rows={3}
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : term ? "Update Term" : "Create Term"}
        </Button>
      </div>
    </form>
  );
}

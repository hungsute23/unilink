"use client";

import { useState } from "react";
import { Scholarship } from "@/types/appwrite.types";
import { createScholarship, updateScholarship } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ScholarshipFormProps {
  schoolId: string;
  scholarship?: Scholarship;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScholarshipForm({ schoolId, scholarship, onSuccess, onCancel }: ScholarshipFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("schoolId", schoolId);

    const result = scholarship 
      ? await updateScholarship(scholarship.$id, formData)
      : await createScholarship(formData);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "An error occurred");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="name">Scholarship Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={scholarship?.name} 
          placeholder="e.g. International Student Excellence Scholarship" 
          required 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input 
            id="source" 
            name="source" 
            defaultValue={scholarship?.source || "University"} 
            placeholder="e.g. MOE, University, etc." 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount / Value Description</Label>
          <Input 
            id="amount" 
            name="amount" 
            defaultValue={scholarship?.amount} 
            placeholder="e.g. Full Tuition + 10k Monthly" 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border rounded-xl p-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <input type="checkbox" name="coversTuition" value="true" defaultChecked={scholarship?.coversTuition} id="coversTuition" className="w-4 h-4" />
          <Label htmlFor="coversTuition" className="text-xs font-bold uppercase">Covers Tuition</Label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="coversDorm" value="true" defaultChecked={scholarship?.coversDorm} id="coversDorm" className="w-4 h-4" />
          <Label htmlFor="coversDorm" className="text-xs font-bold uppercase">Covers Dorm</Label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="coversStipend" value="true" defaultChecked={scholarship?.coversStipend} id="coversStipend" className="w-4 h-4" />
          <Label htmlFor="coversStipend" className="text-xs font-bold uppercase">Monthly Stipend</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input 
            id="duration" 
            name="duration" 
            defaultValue={scholarship?.duration} 
            placeholder="e.g. 4 years (Bachelor), 2 years (Master)" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input 
            id="deadline" 
            name="deadline" 
            type="date"
            defaultValue={scholarship?.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : ""} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minGpa">Min. GPA Req.</Label>
          <Input id="minGpa" name="minGpa" defaultValue={scholarship?.minGpa} placeholder="e.g. 3.0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minEnglishReq">Min. English Req.</Label>
          <Input id="minEnglishReq" name="minEnglishReq" defaultValue={scholarship?.minEnglishReq} placeholder="IELTS 5.5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minChineseReq">Min. Chinese Req.</Label>
          <Input id="minChineseReq" name="minChineseReq" defaultValue={scholarship?.minChineseReq} placeholder="TOCFL A2" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements / Eligibility (one per line)</Label>
        <Textarea 
          id="requirements" 
          name="requirements" 
          defaultValue={scholarship?.requirements} 
          placeholder="Must be an international student&#10;Maintain 3.0 GPA every semester" 
          rows={4}
        />
      </div>

      {scholarship && (
        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" name="isActive" value="true" defaultChecked={scholarship.isActive} id="isActive" className="w-4 h-4" />
          <Label htmlFor="isActive">Active / Visible to students</Label>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : scholarship ? "Update Scholarship" : "Create Scholarship"}
        </Button>
      </div>
    </form>
  );
}

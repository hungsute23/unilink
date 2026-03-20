"use client";

import { useState } from "react";
import { Program, AdmissionTerm } from "@/types/appwrite.types";
import { createProgram, updateProgram } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProgramFormProps {
  schoolId: string;
  terms: AdmissionTerm[];
  program?: Program;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProgramForm({ schoolId, terms, program, onSuccess, onCancel }: ProgramFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("schoolId", schoolId);

    const result = program 
      ? await updateProgram(program.$id, formData)
      : await createProgram(formData);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "An error occurred");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="termId">Admission Term</Label>
          <Select name="termId" defaultValue={program?.termId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map(term => (
                <SelectItem key={term.$id} value={term.$id}>
                  {term.termName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentName">Program Name / Department</Label>
          <Input 
            id="departmentName" 
            name="departmentName" 
            defaultValue={program?.departmentName} 
            placeholder="e.g. Computer Science and Engineering" 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degreeLevel">Degree Level</Label>
          <Select name="degreeLevel" defaultValue={program?.degreeLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select degree level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Language">Language Program</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="languageInstruction">Language of Instruction</Label>
          <Select name="languageInstruction" defaultValue={program?.languageInstruction}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tuitionFee">Tuition Fee (per semester/year)</Label>
          <Input 
            id="tuitionFee" 
            name="tuitionFee" 
            defaultValue={program?.tuitionFee} 
            placeholder="e.g. 50,000 TWD" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applicationFee">Application Fee</Label>
          <Input 
            id="applicationFee" 
            name="applicationFee" 
            defaultValue={program?.applicationFee} 
            placeholder="e.g. Free or 2,000 TWD" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minEnglishReq">Min. English Requirement</Label>
          <Input 
            id="minEnglishReq" 
            name="minEnglishReq" 
            defaultValue={program?.minEnglishReq} 
            placeholder="e.g. IELTS 6.0" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minChineseReq">Min. Chinese Requirement</Label>
          <Input 
            id="minChineseReq" 
            name="minChineseReq" 
            defaultValue={program?.minChineseReq} 
            placeholder="e.g. TOCFL A2" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="programUrl">Program Website URL</Label>
        <Input 
          id="programUrl" 
          name="programUrl" 
          type="url"
          defaultValue={program?.programUrl} 
          placeholder="https://www.example.edu/cs" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requiredDocs">Required Documents (one per line)</Label>
        <Textarea 
          id="requiredDocs" 
          name="requiredDocs" 
          defaultValue={program?.requiredDocs?.join("\n")} 
          placeholder="CV&#10;Study Plan&#10;Two Recommendation Letters" 
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scholarshipIds">Scholarship IDs (comma separated)</Label>
        <Input 
          id="scholarshipIds" 
          name="scholarshipIds" 
          defaultValue={program?.scholarshipIds?.join(",")} 
          placeholder="id1, id2, id3" 
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-2">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : program ? "Update Program" : "Create Program"}
        </Button>
      </div>
    </form>
  );
}

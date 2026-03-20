"use client";

import { useState } from "react";
import { Program, AdmissionTerm } from "@/types/appwrite.types";
import { deleteProgram } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { ProgramForm } from "./ProgramForm";
import { 
  BookOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  GraduationCap,
  Globe,
  Tag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProgramsTableProps {
  schoolId: string;
  initialPrograms: Program[];
  terms: AdmissionTerm[];
}

export function ProgramsTable({ schoolId, initialPrograms, terms }: ProgramsTableProps) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>(undefined);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this program?")) return;
    
    const result = await deleteProgram(id);
    if (result.success) {
      setPrograms(programs.filter(p => p.$id !== id));
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function handleSuccess() {
    setIsFormOpen(false);
    setEditingProgram(undefined);
    window.location.reload(); 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Active Programs
        </h2>
        <Button onClick={() => { setEditingProgram(undefined); setIsFormOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add New Program
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-2xl rounded-2xl shadow-xl border p-6">
            <h3 className="text-lg font-bold mb-2">
              {editingProgram ? "Edit Program" : "Create New Program"}
            </h3>
            <ProgramForm 
              schoolId={schoolId} 
              terms={terms}
              program={editingProgram} 
              onSuccess={handleSuccess} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}

      {programs.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/10">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium">No programs listed</p>
          <p className="text-sm text-muted-foreground mb-4">Add your academic programs to showcase them to potential students.</p>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>Add Program</Button>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Department / Program</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Degree & Language</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Term</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.map((program) => {
                const term = terms.find(t => t.$id === program.termId);
                return (
                  <tr key={program.$id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-base leading-tight mb-1">{program.departmentName}</div>
                      <div className="flex gap-2 text-xs">
                         <span className="text-muted-foreground flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {program.tuitionFee || "N/A Fee"}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                         <Badge variant="outline" className="gap-1 font-semibold text-[10px]">
                            <GraduationCap className="w-3 h-3" />
                            {program.degreeLevel}
                         </Badge>
                         <Badge variant="secondary" className="gap-1 font-semibold text-[10px]">
                            <Globe className="w-3 h-3" />
                            {program.languageInstruction}
                         </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium">{term?.termName || "Unknown Term"}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Intake: {term?.intakeMonth || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => { setEditingProgram(program); setIsFormOpen(true); }} className="gap-2 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                            Edit Program
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(program.$id)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                            Delete Program
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

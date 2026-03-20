"use client";

import { useState } from "react";
import { Scholarship } from "@/types/appwrite.types";
import { deleteScholarship } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { ScholarshipForm } from "./ScholarshipForm";
import { 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ScholarshipsTableProps {
  schoolId: string;
  initialScholarships: Scholarship[];
}

export function ScholarshipsTable({ schoolId, initialScholarships }: ScholarshipsTableProps) {
  const [scholarships, setScholarships] = useState<Scholarship[]>(initialScholarships);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | undefined>(undefined);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this scholarship?")) return;
    
    const result = await deleteScholarship(id);
    if (result.success) {
      setScholarships(scholarships.filter(s => s.$id !== id));
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function handleSuccess() {
    setIsFormOpen(false);
    setEditingScholarship(undefined);
    window.location.reload(); 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Offered Scholarships
        </h2>
        <Button onClick={() => { setEditingScholarship(undefined); setIsFormOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Create Scholarship
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-2xl rounded-2xl shadow-xl border p-6">
            <h3 className="text-lg font-bold mb-2">
              {editingScholarship ? "Edit Scholarship" : "Create New Scholarship"}
            </h3>
            <ScholarshipForm 
              schoolId={schoolId} 
              scholarship={editingScholarship} 
              onSuccess={handleSuccess} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}

      {scholarships.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/10">
          <Award className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium">No scholarships listed</p>
          <p className="text-sm text-muted-foreground mb-4">You haven't added any scholarships for your institution yet.</p>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>Add Scholarship</Button>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Scholarship Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Value / Benefits</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Deadline</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scholarships.map((scholarship) => (
                <tr key={scholarship.$id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-base leading-tight mb-1">{scholarship.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{scholarship.source}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-primary">{scholarship.amount}</div>
                    <div className="flex gap-1 mt-1.5">
                       {scholarship.coversTuition && <Badge variant="secondary" className="px-1 py-0 text-[8px] bg-green-50 text-green-700 border-green-100 uppercase">Tuition</Badge>}
                       {scholarship.coversDorm && <Badge variant="secondary" className="px-1 py-0 text-[8px] bg-blue-50 text-blue-700 border-blue-100 uppercase">Dorm</Badge>}
                       {scholarship.coversStipend && <Badge variant="secondary" className="px-1 py-0 text-[8px] bg-purple-50 text-purple-700 border-purple-100 uppercase">Stipend</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                       <Clock className="w-3 h-3 text-muted-foreground" />
                       {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "No Deadline"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {scholarship.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0 text-[10px] uppercase font-bold">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground px-2 py-0 text-[10px] uppercase font-bold">Draft</Badge>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => { setEditingScholarship(scholarship); setIsFormOpen(true); }} className="gap-2 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(scholarship.$id)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

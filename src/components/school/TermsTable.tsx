"use client";

import { useState } from "react";
import { AdmissionTerm } from "@/types/appwrite.types";
import { deleteAdmissionTerm } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";
import { TermForm } from "./TermForm";
import { 
  CalendarDays, 
  Plus, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TermsTableProps {
  schoolId: string;
  initialTerms: AdmissionTerm[];
}

export function TermsTable({ schoolId, initialTerms }: TermsTableProps) {
  const [terms, setTerms] = useState<AdmissionTerm[]>(initialTerms);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AdmissionTerm | undefined>(undefined);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this admission term? This action cannot be undone.")) return;
    
    const result = await deleteAdmissionTerm(id);
    if (result.success) {
      setTerms(terms.filter(t => t.$id !== id));
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function handleSuccess() {
    setIsFormOpen(false);
    setEditingTerm(undefined);
    // In a real app, we'd probably re-fetch or use the result, 
    // but for now, we'll let Next.js revalidatePath handle the server-side,
    // and the user can refresh or we could implement a local update.
    window.location.reload(); 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Active Terms
        </h2>
        <Button onClick={() => { setEditingTerm(undefined); setIsFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Term
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl border p-6">
            <h3 className="text-lg font-bold mb-2">
              {editingTerm ? "Edit Admission Term" : "Create Admission Term"}
            </h3>
            <TermForm 
              schoolId={schoolId} 
              term={editingTerm} 
              onSuccess={handleSuccess} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}

      {terms.length === 0 ? (
        <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/10">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium">No admission terms yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first application period to start receiving applications.</p>
          <Button variant="outline" onClick={() => setIsFormOpen(true)}>Create Term</Button>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Term Name</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Application Period</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Intake</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {terms.map((term) => (
                <tr key={term.$id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-base">{term.termName}</div>
                    {term.notes && <div className="text-xs text-muted-foreground line-clamp-1 mt-1">{term.notes}</div>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium text-[10px]">START</span>
                      <span className="font-medium">{new Date(term.applyStartDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-medium text-[10px]">END</span>
                      <span className="font-medium">{new Date(term.applyEndDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {term.intakeMonth || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => { setEditingTerm(term); setIsFormOpen(true); }} className="gap-2 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                          Edit Term
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(term.$id)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                          Delete Term
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

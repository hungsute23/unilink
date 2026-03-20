"use client";

import { useState } from "react";
import { School } from "@/types/appwrite.types";
import { updateSchoolProfile } from "@/lib/appwrite/actions/school.actions";
import { Button } from "@/components/ui/button";

export function SchoolProfileForm({ school }: { school: School }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("currentLogoUrl", school.logoUrl || "");

    const result = await updateSchoolProfile(school.$id, formData);

    if (result.success) {
      setMessage("School profile updated successfully!");
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl bg-card p-8 rounded-2xl shadow-sm border">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b pb-3">Institution Details</h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
           {/* Logo Preview */}
           <div className="shrink-0 flex flex-col items-center gap-3">
             <div className="w-32 h-32 rounded-2xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center relative group">
               {school.logoUrl ? (
                 <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
               ) : (
                 <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">No Logo</span>
               )}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                 <span className="text-white text-[10px] font-bold">CHANGE</span>
               </div>
             </div>
             <div className="w-full">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Update Logo</label>
                <input type="file" name="logoFile" accept="image/*" className="text-xs w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
             </div>
           </div>

           <div className="flex-1 w-full space-y-5">
             <div className="space-y-2">
                <label className="text-sm font-semibold">School Name</label>
                <input 
                  name="schoolName" 
                  defaultValue={school.schoolName} 
                  required 
                  placeholder="e.g. National Taiwan University"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">City</label>
                  <input 
                    name="city" 
                    defaultValue={school.city} 
                    placeholder="e.g. Taipei"
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Website</label>
                  <input 
                    name="website" 
                    defaultValue={school.website} 
                    placeholder="https://www.example.edu"
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-semibold">Contact Email</label>
                <input 
                  name="contactEmail" 
                  type="email"
                  defaultValue={school.contactEmail} 
                  required
                  placeholder="admissions@example.edu"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                />
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-6 mt-8">
         <h2 className="text-xl font-bold border-b pb-3">Additional Information</h2>
         <div className="space-y-5">
            <div className="space-y-2">
               <label className="text-sm font-semibold">Description</label>
               <textarea 
                  name="description" 
                  defaultValue={school.description} 
                  rows={5}
                  placeholder="Briefly describe your institution's history, mission, and unique features..."
                  className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
               ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2">
                  <label className="text-sm font-semibold">Global/Local Ranking</label>
                  <input 
                    name="ranking" 
                    defaultValue={school.ranking} 
                    placeholder="e.g. Top 100 QS"
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" 
                  />
               </div>
               <div className="flex items-center space-x-3 pt-8">
                  <input 
                    type="checkbox" 
                    name="hasDorm" 
                    value="true" 
                    defaultChecked={school.hasDorm} 
                    id="hasDorm" 
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  />
                  <label htmlFor="hasDorm" className="text-sm font-semibold cursor-pointer">On-campus Dormitory Available</label>
               </div>
            </div>
         </div>
      </div>

      <div className="pt-6 border-t flex flex-col items-end gap-4 mt-8">
        {message && (
          <div className={`text-sm font-bold px-4 py-2 rounded-lg ${message.includes("Error") ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
            {message}
          </div>
        )}
        <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto px-10 rounded-xl shadow-lg shadow-primary/20">
          {isPending ? "Saving changes..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}

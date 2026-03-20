"use client";

import { useState } from "react";
import { Student } from "@/types/appwrite.types";
import { updateStudentProfile } from "@/lib/appwrite/actions/student.actions";
import { Button } from "@/components/ui/button";

export function ProfileForm({ student }: { student: Student }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("currentAvatarUrl", student.avatarUrl || "");

    const result = await updateStudentProfile(student.$id, formData);

    if (result.success) {
      setMessage("Profile updated successfully!");
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-card p-6 rounded-xl shadow-sm border">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
           {/* Avatar Preview */}
           <div className="shrink-0 flex flex-col items-center gap-2">
             <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border flex items-center justify-center">
               {student.avatarUrl ? (
                 <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-muted-foreground text-xs">No Avatar</span>
               )}
             </div>
             <input type="file" name="avatarFile" accept="image/*" className="text-xs w-full max-w-xs" />
           </div>

           <div className="flex-1 space-y-4">
             <div className="space-y-1">
               <label className="text-sm font-medium">Full Name</label>
               <input 
                 name="fullName" 
                 defaultValue={student.fullName} 
                 required 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-sm font-medium">Nationality</label>
                 <input 
                   name="nationality" 
                   defaultValue={student.nationality} 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-sm font-medium">Vietnamese ID</label>
                 <input 
                   name="vietnameseId" 
                   defaultValue={student.vietnameseId} 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                 />
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
         <h2 className="text-xl font-semibold border-b pb-2">Academic Profile</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Highest Education</label>
              <input name="highestEducation" defaultValue={student.highestEducation} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">GPA</label>
              <input name="gpa" defaultValue={student.gpa} placeholder="e.g. 3.8/4.0 or 8.5/10" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">English Level (IELTS/TOEFL)</label>
              <input name="englishLevel" defaultValue={student.englishLevel} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Chinese Level (TOCFL)</label>
              <input name="chineseLevel" defaultValue={student.chineseLevel} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Target Degree</label>
              <input name="targetDegree" defaultValue={student.targetDegree} placeholder="e.g. Master, Bachelor" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Target City in Taiwan</label>
              <input name="targetCityTaiwan" defaultValue={student.targetCityTaiwan} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
         </div>
      </div>

      <div className="space-y-4 mt-6">
         <h2 className="text-xl font-semibold border-b pb-2">Immigration Status</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center space-x-2 pt-8">
               <input 
                 type="checkbox" 
                 name="hasPassport" 
                 value="true" 
                 defaultChecked={student.hasPassport} 
                 id="hasPassport" 
                 className="w-5 h-5"
               />
               <label htmlFor="hasPassport" className="text-sm font-medium">I have a valid Passport</label>
             </div>
             <div className="space-y-1">
               <label className="text-sm font-medium">ARC / Work Permit Status</label>
               <input name="workPermitStatus" defaultValue={student.workPermitStatus} placeholder="Are you currently in Taiwan?" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
             </div>
         </div>
      </div>

      <div className="pt-4 border-t flex flex-col items-end">
        {message && (
          <p className={`text-sm font-medium mb-3 ${message.includes("Error") ? "text-destructive" : "text-green-600"}`}>
            {message}
          </p>
        )}
        <Button type="submit" disabled={isPending} className="w-full md:w-auto">
          {isPending ? "Saving changes..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}

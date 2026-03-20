"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Globe, 
  Mail, 
  MapPin, 
  Briefcase,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { updateBusinessProfile } from "@/lib/appwrite/actions/business.actions";
import { GlassCard } from "@/components/shared/GlassCard";

const formSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  industry: z.string().min(2, "Industry is required"),
  city: z.string().min(2, "City is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  contactEmail: z.string().email("Invalid email address"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

interface BusinessProfileFormProps {
  business: any;
}

export function BusinessProfileForm({ business }: BusinessProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: business.name || "",
      industry: business.industry || "",
      city: business.city || "",
      website: business.website || "",
      contactEmail: business.contactEmail || "",
      description: business.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSuccess(false);
    
    const formData = new FormData();
    formData.append("businessId", business.$id);
    formData.append("name", values.name);
    formData.append("industry", values.industry);
    formData.append("city", values.city);
    formData.append("website", values.website || "");
    formData.append("contactEmail", values.contactEmail);
    formData.append("description", values.description);
    formData.append("existingLogoUrl", business.logoUrl || "");

    const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("logo", fileInput.files[0]);
    }

    const result = await updateBusinessProfile(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
    
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Company Name</FormLabel>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <FormControl>
                      <Input {...field} placeholder="TechNova Solutions" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Industry</FormLabel>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <FormControl>
                      <Input {...field} placeholder="Software Development" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Headquarters City</FormLabel>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <FormControl>
                      <Input {...field} placeholder="Taipei, Taiwan" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Website URL</FormLabel>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <FormControl>
                      <Input {...field} placeholder="https://technova.io" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Contact Email</FormLabel>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <FormControl>
                      <Input {...field} placeholder="hr@technova.io" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Company Logo</FormLabel>
              <div className="h-12 flex items-center gap-4 px-4 bg-muted/30 rounded-2xl border-none">
                <input type="file" id="logo-upload" accept="image/*" className="text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all" />
              </div>
              {business.logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={business.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border" />
                  <span className="text-[10px] text-muted-foreground font-black uppercase opacity-60">Current Logo</span>
                </div>
              )}
            </FormItem>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Company Bio & Culture</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={6} placeholder="Tell applicants about your company..." className="bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 p-4 min-h-[160px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="flex items-center gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : "Save Changes"}
          </Button>

          {success && (
            <div className="flex items-center gap-2 text-emerald-500 font-bold animate-in fade-in slide-in-from-left-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

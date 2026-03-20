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
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  GraduationCap, 
  Globe, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  Building
} from "lucide-react";
import { createGlobalScholarship } from "@/lib/appwrite/actions/admin.actions";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  source: z.string().min(2, "Source is required (e.g., MOE, ICDF)"),
  amount: z.string().optional(),
  duration: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  requirements: z.string().min(10, "Requirements are required"),
  applicationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coversTuition: z.boolean().default(true),
  coversDorm: z.boolean().default(false),
  coversStipend: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ScholarshipFormValues = z.infer<typeof formSchema>;

interface ScholarshipFormProps {
  onSuccess?: () => void;
}

export function ScholarshipForm({ onSuccess }: ScholarshipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      source: "Taiwan MOE",
      amount: "Full Tuition + Stipend",
      duration: "4 Years",
      deadline: "",
      requirements: "",
      applicationUrl: "",
      coversTuition: true,
      coversDorm: false,
      coversStipend: false,
      isActive: true,
    },
  });

  async function onSubmit(values: ScholarshipFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createGlobalScholarship(values);
      if (result.success) {
        toast.success("Global Scholarship published!");
        onSuccess?.();
        form.reset();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Scholarship Title</FormLabel>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="MOE Taiwan Scholarship 2026" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Issuing Body / Source</FormLabel>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="Ministry of Education (MOE)" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Application Deadline</FormLabel>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input type="date" {...field} className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Funding Amount</FormLabel>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="NT$ 30,000 / month" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">External Application URL</FormLabel>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="https://taiwanscholarship.moe.gov.tw" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-xs font-black uppercase tracking-widest opacity-60">Eligibility & Requirements</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="List eligibility criteria, required documents, etc..." className="min-h-[120px] bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 p-4" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="coversTuition"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-muted-foreground/10 p-4 bg-muted/5">
                <FormLabel className="text-[10px] font-black uppercase">Tuition Cover</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coversStipend"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-muted-foreground/10 p-4 bg-muted/5">
                <FormLabel className="text-[10px] font-black uppercase">Monthly Stipend</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-primary/20 p-4 bg-primary/5">
                <FormLabel className="text-[10px] font-black uppercase text-primary">Visible to Public</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
        >
          {isSubmitting ? "Publishing..." : "Launch Government Scholarship"}
        </Button>
      </form>
    </Form>
  );
}

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
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Languages,
  ShieldCheck,
  Globe
} from "lucide-react";
import { createJob, updateJob } from "@/lib/appwrite/actions/business.actions";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  salary: z.string().min(1, "Salary info is required"),
  hoursPerWeek: z.coerce.number().min(1, "Hours must be at least 1"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  allowsStudentVisa: z.boolean().default(true),
  chineseRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof formSchema>;

interface JobFormProps {
  businessId: string;
  job?: any;
  onSuccess?: () => void;
}

export function JobForm({ businessId, job, onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: job?.title || "",
      location: job?.location || "",
      salary: job?.salary || "",
      hoursPerWeek: job?.hoursPerWeek || 20,
      description: job?.description || "",
      allowsStudentVisa: job?.allowsStudentVisa ?? true,
      chineseRequired: job?.chineseRequired ?? false,
      isActive: job?.isActive ?? true,
    },
  });

  async function onSubmit(values: JobFormValues) {
    setIsSubmitting(true);
    try {
      const result = job 
        ? await updateJob(job.$id, values)
        : await createJob({ ...values, businessId });

      if (result.success) {
        toast.success(job ? "Job updated!" : "Job published!");
        onSuccess?.();
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
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Job Title</FormLabel>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="Software Engineer Intern" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Location</FormLabel>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="Hsinchu, Taiwan" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Salary / Compensation</FormLabel>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input {...field} placeholder="NT$ 200 - 250 / hour" className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Hours per Week</FormLabel>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20" 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="text-sm font-black uppercase tracking-widest opacity-70">Job Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe the role, responsibilities, and requirements..." 
                    className="min-h-[150px] bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 p-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allowsStudentVisa"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-muted-foreground/10 p-4 bg-muted/5">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs font-black uppercase flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    Student Visa
                  </FormLabel>
                  <FormDescription className="text-[10px]">Allows student visa holders</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chineseRequired"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-muted-foreground/10 p-4 bg-muted/5">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs font-black uppercase flex items-center gap-2">
                    <Languages className="w-3 h-3 text-primary" />
                    Mandarin
                  </FormLabel>
                  <FormDescription className="text-[10px]">Chinese Fluency Required</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex col-span-1 md:col-span-2 items-center justify-between rounded-2xl border border-primary/20 p-4 bg-primary/5">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs font-black uppercase flex items-center gap-2 text-primary">
                    <Globe className="w-3 h-3" />
                    Visibility
                  </FormLabel>
                  <FormDescription className="text-[10px]">Show in public job board</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
        >
          {isSubmitting ? "Processing..." : job ? "Update Posting" : "Publish Opportunity"}
        </Button>
      </form>
    </Form>
  );
}

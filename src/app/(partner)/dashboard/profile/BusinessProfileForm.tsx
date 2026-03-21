"use client";

import { useState, useTransition, useRef } from "react";
import { updateBusinessProfile } from "@/lib/appwrite/actions/business.actions";
import { Building2, Globe, Mail, MapPin, ImagePlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

const INDUSTRIES = [
  "Semiconductors / Chip Fabrication",
  "Semiconductors / IC Design",
  "Consumer Electronics / PCs",
  "E-Commerce / Tech",
  "Messaging / Social Media / Fintech",
  "Gaming / Digital Entertainment",
  "Software / SaaS",
  "Finance / Banking",
  "Manufacturing",
  "Education / EdTech",
  "Healthcare / Biotech",
  "Logistics / Supply Chain",
  "Other",
];

export function BusinessProfileForm({ business }: { business: any }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    formData.set("businessId", business.$id);
    formData.set("existingLogoUrl", business.logoUrl ?? "");

    startTransition(async () => {
      const res = await updateBusinessProfile(formData);
      setStatus({
        success: res.success,
        message: res.success ? "Profile updated successfully." : (res.error ?? "Failed to update."),
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Company Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0">
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" width={80} height={80} className="w-full h-full object-contain" unoptimized />
            ) : (
              <Building2 className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
              Upload Logo
            </Button>
            <p className="text-xs text-muted-foreground">JPEG, PNG, WebP · Max 5MB</p>
            <input
              ref={fileInputRef}
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Basic Information</h2>

        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="companyName"
              name="companyName"
              defaultValue={business.companyName}
              required
              placeholder="Your company name"
              className="pl-10 h-11 rounded-xl bg-muted/30 border-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            name="industry"
            defaultValue={business.industry ?? ""}
            className="w-full h-11 rounded-xl bg-muted/30 border-none px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-white/5"
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="city"
                name="city"
                defaultValue={business.city}
                placeholder="e.g. Taipei"
                className="pl-10 h-11 rounded-xl bg-muted/30 border-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={business.contactEmail}
                placeholder="hr@company.com"
                className="pl-10 h-11 rounded-xl bg-muted/30 border-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={business.website}
              placeholder="https://yourcompany.com"
              className="pl-10 h-11 rounded-xl bg-muted/30 border-none"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">About the Company</h2>
        <Textarea
          name="description"
          defaultValue={business.description}
          placeholder="Describe your company, culture, and what makes it a great place to work for international students..."
          rows={6}
          className="rounded-xl bg-muted/30 border-none resize-none focus:ring-2 focus:ring-primary/20"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-right">Max 2,000 characters</p>
      </div>

      {status && (
        <div className={`flex items-center gap-2 text-sm ${status.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
          {status.success
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {status.message}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="h-12 px-10 rounded-2xl font-black gap-2">
        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save Changes"}
      </Button>
    </form>
  );
}

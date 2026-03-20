"use client";

import React from "react";
import { 
  Search, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Filter,
  Check,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
}

function FilterSection({ title, options, selectedValues, onChange }: FilterSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{title}</h4>
      </div>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <div 
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                isSelected 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-muted/10 border-transparent hover:border-primary/10 hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  isSelected ? "bg-primary border-primary text-white" : "border-primary/20 bg-background"
                )}>
                  {isSelected && <Check className="w-3 h-3 font-bold" />}
                </div>
                <span className={cn(
                  "text-xs font-semibold transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {option.label}
                </span>
              </div>
              {option.count !== undefined && (
                <span className="text-[10px] font-bold opacity-30 group-hover:opacity-60 transition-opacity">
                  {option.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FilterSidebarProps {
  type: "schools" | "scholarships" | "jobs";
  className?: string;
}

export function FilterSidebar({ type, className }: FilterSidebarProps) {
  // Mock data for UI representation
  const sections = {
    schools: [
      {
        title: "City",
        options: [
          { label: "Taipei", value: "taipei", count: 42 },
          { label: "Taichung", value: "taichung", count: 28 },
          { label: "Kaohsiung", value: "kaohsiung", count: 19 },
          { label: "Tainan", value: "tainan", count: 12 },
        ]
      },
      {
        title: "Institution Type",
        options: [
          { label: "Public University", value: "public", count: 35 },
          { label: "Private University", value: "private", count: 48 },
          { label: "Vocational", value: "vocational", count: 15 },
        ]
      }
    ],
    scholarships: [
      {
        title: "Level",
        options: [
          { label: "Bachelor", value: "bachelor", count: 124 },
          { label: "Master", value: "master", count: 85 },
          { label: "PhD", value: "phd", count: 42 },
        ]
      },
      {
        title: "Coverage",
        options: [
          { label: "Full Tuition", value: "tuition", count: 64 },
          { label: "Stipend Only", value: "stipend", count: 28 },
          { label: "Dormitory", value: "dorm", count: 15 },
        ]
      }
    ],
    jobs: [
      {
        title: "Employment",
        options: [
          { label: "Part-time", value: "part_time", count: 52 },
          { label: "Internship", value: "internship", count: 38 },
          { label: "Full-time", value: "full_time", count: 12 },
        ]
      },
      {
        title: "Chinese Level",
        options: [
          { label: "No Requirement", value: "none", count: 24 },
          { label: "Basic (A2)", value: "basic", count: 45 },
          { label: "Fluent (B2+)", value: "fluent", count: 18 },
        ]
      }
    ]
  };

  return (
    <aside className={cn("space-y-10 w-full max-w-xs", className)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground/90 uppercase">Filter System</h2>
          <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase gap-1 text-muted-foreground hover:text-primary">
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder={`Search ${type}...`} 
            className="pl-11 h-12 bg-muted/20 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 transition-all font-semibold placeholder:font-medium"
          />
        </div>
      </div>

      <div className="space-y-8 pb-10">
        {sections[type].map((section, idx) => (
          <FilterSection 
            key={idx}
            title={section.title}
            options={section.options}
            selectedValues={[]}
            onChange={() => {}}
          />
        ))}

        <div className="pt-6">
          <Button className="w-full h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-bold text-sm uppercase hover:scale-[1.02] active:scale-[0.98] transition-all">
            Apply Selection
          </Button>
        </div>
      </div>
    </aside>
  );
}

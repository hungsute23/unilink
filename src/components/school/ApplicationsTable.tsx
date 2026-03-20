"use client";

import { useState } from "react";
import { Application, Student } from "@/types/appwrite.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationDetailsModal } from "./ApplicationDetailsModal";
import { 
  Users, 
  Search, 
  ChevronRight, 
  Filter,
  ArrowUpDown
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ApplicationsTableProps {
  initialApplications: (Application & { student?: Student })[];
}

export function ApplicationsTable({ initialApplications }: ApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedApp, setSelectedApp] = useState<(Application & { student?: Student }) | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = applications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = !searchTerm || 
      app.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.$id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  function getStatusStyle(status?: string) {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review": return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-muted-foreground/20";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by student name or ID..." 
            className="pl-10 rounded-xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-muted/30 p-1 rounded-xl border">
            {["all", "pending", "under_review", "accepted", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterStatus === status ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-3xl overflow-hidden bg-card shadow-xl shadow-muted/20 border-muted/30">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground w-12">REF</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">STUDENT</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground hidden sm:table-cell">APPLIED ON</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">STATUS</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/30">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-lg font-bold text-muted-foreground/50">No applications matched your criteria.</p>
                      <Button variant="link" onClick={() => {setFilterStatus("all"); setSearchTerm(""); }}>Clear all filters</Button>
                   </div>
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr 
                  key={app.$id} 
                  className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedApp(app)}
                >
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs text-muted-foreground font-bold group-hover:text-primary">
                      #{app.$id.slice(-4).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-muted border overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                          {app.student?.avatarUrl ? (
                            <img src={app.student.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xs font-bold uppercase">
                               {app.student?.fullName?.charAt(0) || "?"}
                            </div>
                          )}
                       </div>
                       <div>
                          <div className="font-bold text-base group-hover:text-primary transition-colors">{app.student?.fullName || "Unknown Applicant"}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{app.student?.nationality || "Global Citizen"}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="text-xs font-medium text-foreground/80">{new Date(app.appliedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">{new Date(app.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="outline" className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm ${getStatusStyle(app.status)}`}>
                      {app.status?.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-transparent group-hover:shadow-primary/30">
                       <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <ApplicationDetailsModal 
          application={selectedApp} 
          onClose={() => {
            setSelectedApp(null);
            // Optionally refresh window to show updated statuses from modal
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}

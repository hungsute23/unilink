"use client";

import React, { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  ShieldAlert, 
  UserX, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  MoreVertical,
  Filter
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleUserStatus } from "@/lib/appwrite/actions/admin.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  $id: string;
  name: string;
  email: string;
  status: boolean; // active = true
  registration: string;
  prefs: {
    role?: string;
  };
}

interface UsersTableProps {
  initialUsers: User[];
  total: number;
}

export function UsersTable({ initialUsers, total }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsUpdating(userId);
    try {
      const result = await toggleUserStatus(userId, currentStatus);
      if (result.success) {
        setUsers(users.map(u => 
          u.$id === userId ? { ...u, status: !currentStatus } : u
        ));
        toast.success(currentStatus ? "User banned" : "User unbanned");
        router.refresh();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-lg">Admin</Badge>;
      case "school": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-lg">Partner School</Badge>;
      case "business": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg">Business</Badge>;
      case "student": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-lg">Student</Badge>;
      default: return <Badge variant="outline" className="opacity-50 rounded-lg">User</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-11 h-12 bg-muted/30 border-none rounded-2xl focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-12 px-6 rounded-2xl font-black gap-2 opacity-60 hover:opacity-100">
              <Filter className="w-4 h-4" />
              Filters
           </Button>
           <Button className="h-12 px-6 rounded-2xl font-black bg-primary">Add New User</Button>
        </div>
      </div>

      <div className="glass-card border-none rounded-3xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-primary/5">
              <TableHead className="w-[300px] py-6 px-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">User Information</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Assigned Role</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Account Status</TableHead>
              <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Joined At</TableHead>
              <TableHead className="py-6 px-8 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.$id} className="group hover:bg-primary/[0.02] border-primary/5 transition-colors">
                <TableCell className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{user.name}</p>
                      <p className="text-xs text-muted-foreground opacity-60 font-medium">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4">
                  {getRoleBadge(user.prefs?.role)}
                </TableCell>
                <TableCell className="py-5 px-4">
                  {user.status ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                      <UserX className="w-3.5 h-3.5" />
                      Banned
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-5 px-4">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs opacity-60">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(user.registration).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="py-5 px-8 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 glass-card border-none shadow-2xl">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3 py-2">Account Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/10">
                        <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-xs font-bold">Edit Permissions</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-primary/5 mx-2" />
                      <DropdownMenuItem 
                        disabled={isUpdating === user.$id}
                        onClick={() => handleToggleStatus(user.$id, user.status)}
                        className={cn(
                          "rounded-xl px-3 py-2 cursor-pointer transition-colors",
                          user.status ? "focus:bg-rose-500/10 text-rose-500" : "focus:bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {user.status ? (
                          <><UserX className="mr-2 h-4 w-4" /><span className="text-xs font-bold">Ban Account</span></>
                        ) : (
                          <><CheckCircle2 className="mr-2 h-4 w-4" /><span className="text-xs font-bold">Activate Account</span></>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground opacity-60">
        <p>Showing {users.length} of {total} users</p>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-lg h-8 px-4" disabled>Previous</Button>
           <Button variant="outline" size="sm" className="rounded-lg h-8 px-4" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}

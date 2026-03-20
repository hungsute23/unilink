import { getAllUsers } from "@/lib/appwrite/actions/admin.actions";
import { UsersTable } from "@/components/admin/UsersTable";
import { 
  Users, 
  UserPlus, 
  Download,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function UsersPage() {
  const result = await getAllUsers();
  
  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card border-none rounded-3xl p-12 text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Failed to load users</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">{result.error}</p>
        <Button variant="outline" className="rounded-2xl px-8 h-12">Try Again</Button>
      </div>
    );
  }

  // Map Appwrite User type to our UI User type and ensure plain objects
  const users = JSON.parse(JSON.stringify(result.users!)).map((user: any) => ({
    $id: user.$id,
    name: user.name,
    email: user.email,
    status: user.status,
    registration: user.registration,
    prefs: user.prefs || {}
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
            <Users className="w-4 h-4" />
            Identity Management
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-gradient">
            User Accounts
          </h1>
          <p className="text-muted-foreground font-medium mt-2 max-w-xl">
            Monitor and manage all platform participants. Audit permissions, assign roles, and handle account moderation.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-black border-primary/20 hover:bg-primary/5 transition-all gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button className="h-14 px-8 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all gap-2">
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      <UsersTable initialUsers={users} total={result.total!} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Settings, User, Lock, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccountName, updateAccountPassword, updateAccountEmail } from "@/lib/appwrite/actions/auth.actions";

function StatusMessage({ success, message }: { success: boolean; message: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm mt-3 ${success ? "text-emerald-500" : "text-destructive"}`}>
      {success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  );
}

function SettingsCard({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card border-none rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6 ml-[52px]">{description}</p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  // Name
  const [name, setName] = useState("");
  const [nameMsg, setNameMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Password
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ success: boolean; message: string } | null>(null);

  function handleName() {
    setNameMsg(null);
    startTransition(async () => {
      const res = await updateAccountName(name);
      setNameMsg({ success: res.success, message: res.success ? "Display name updated." : (res.error ?? "Failed.") });
      if (res.success) setName("");
    });
  }

  function handleEmail() {
    setEmailMsg(null);
    startTransition(async () => {
      const res = await updateAccountEmail(newEmail, emailPassword);
      setEmailMsg({ success: res.success, message: res.success ? "Email updated successfully." : (res.error ?? "Failed.") });
      if (res.success) { setNewEmail(""); setEmailPassword(""); }
    });
  }

  function handlePassword() {
    setPwdMsg(null);
    startTransition(async () => {
      const res = await updateAccountPassword(currentPwd, newPwd);
      setPwdMsg({ success: res.success, message: res.success ? "Password changed successfully." : (res.error ?? "Failed.") });
      if (res.success) { setCurrentPwd(""); setNewPwd(""); }
    });
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
          <Settings className="w-4 h-4" />
          Account
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-gradient">Settings</h1>
        <p className="text-muted-foreground font-medium mt-2">Manage your account information and security.</p>
      </div>

      {/* Display Name */}
      <SettingsCard
        icon={<User className="w-5 h-5" />}
        title="Display Name"
        description="This is the name other users see on your posts and profile."
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">New display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new name"
              className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {nameMsg && <StatusMessage {...nameMsg} />}
          <Button
            onClick={handleName}
            disabled={isPending || !name.trim()}
            className="h-11 px-8 rounded-2xl font-black"
          >
            Update Name
          </Button>
        </div>
      </SettingsCard>

      {/* Email */}
      <SettingsCard
        icon={<Mail className="w-5 h-5" />}
        title="Email Address"
        description="Changing your email requires your current password for verification."
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New email address</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email-password">Current password</Label>
            <Input
              id="email-password"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Confirm with your password"
              className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {emailMsg && <StatusMessage {...emailMsg} />}
          <Button
            onClick={handleEmail}
            disabled={isPending || !newEmail.trim() || !emailPassword}
            className="h-11 px-8 rounded-2xl font-black"
          >
            Update Email
          </Button>
        </div>
      </SettingsCard>

      {/* Password */}
      <SettingsCard
        icon={<Lock className="w-5 h-5" />}
        title="Password"
        description="Use a strong password of at least 8 characters."
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-pwd">Current password</Label>
            <div className="relative">
              <Input
                id="current-pwd"
                type={showCurrentPwd ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Enter current password"
                className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd">New password</Label>
            <div className="relative">
              <Input
                id="new-pwd"
                type={showNewPwd ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="At least 8 characters"
                className="h-12 rounded-2xl bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {pwdMsg && <StatusMessage {...pwdMsg} />}
          <Button
            onClick={handlePassword}
            disabled={isPending || !currentPwd || !newPwd}
            className="h-11 px-8 rounded-2xl font-black"
          >
            Change Password
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
}

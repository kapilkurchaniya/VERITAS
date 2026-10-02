"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, ChevronDown, UserSquare2, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, error } = useAuthStore();
  const [role, setRole] = useState<'admin' | 'planner' | 'supervisor'>('admin');
  const [submitting, setSubmitting] = useState(false);

  // Map roles to dev credentials
  const getEmailForRole = (r: string) => {
    if (r === 'admin') return 'admin@nexus.dev';
    if (r === 'planner') return 'planner@nexus.dev';
    if (r === 'supervisor') return 'supervisor@nexus.dev';
    return '';
  };

  const getPasswordForRole = (r: string) => {
    if (r === 'admin') return 'admin123';
    if (r === 'planner') return 'planner123';
    if (r === 'supervisor') return 'supervisor123';
    return '';
  };

  const [email, setEmail] = useState(getEmailForRole('admin'));
  const [password, setPassword] = useState(getPasswordForRole('admin'));

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'admin' | 'planner' | 'supervisor';
    setRole(newRole);
    setEmail(getEmailForRole(newRole));
    setPassword(getPasswordForRole(newRole));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background font-['IBM_Plex_Sans'] text-foreground flex flex-col items-center justify-center p-8">
      <div className="w-[420px] flex flex-col gap-6">
        
        {/* Main Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-8 pb-6 flex flex-col gap-4 text-center border-b border-border">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-semibold tracking-[0.28em] text-foreground">VERITAS</span>
              <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to VERITAS</h1>
              <p className="text-sm text-muted-foreground">Verified execution intelligence platform.</p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">

            {/* Role Demo Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground flex items-center gap-2">
                <UserSquare2 className="w-4 h-4" /> Sign in as (Dev Account)
              </label>
              <div className="relative">
                <select 
                  id="role" 
                  value={role}
                  onChange={handleRoleChange}
                  className="input cursor-pointer appearance-none pr-10 border-primary/30 focus:border-primary bg-primary/5 text-primary font-medium"
                >
                  <option value="admin">System Admin</option>
                  <option value="planner">Project Planner</option>
                  <option value="supervisor">Field Supervisor</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Work email</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input" 
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input" 
                required
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20 mt-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Keep Signed In */}
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="keep-signed-in" 
                defaultChecked 
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" 
              />
              <label htmlFor="keep-signed-in" className="text-sm text-muted-foreground cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <button 
                type="submit" 
                disabled={submitting || !email || !password}
                className="btn btn-primary w-full shadow-sm text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                  </>
                ) : "Sign in"}
              </button>
              
              <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  SSO and external authentication coming soon
                </span>
              </div>
            </div>
            
          </form>

          {/* Security Strip */}
          <div className="bg-background/50 border-t border-border px-6 py-4 flex items-center justify-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-foreground">Secure project workspace</span>
              <span className="text-[11px] text-muted-foreground">Encrypted access for authorized teams</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Environment: Production Backend
        </p>

      </div>
    </div>
  );
}

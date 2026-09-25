import { CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';

export default function LoginScreen() {
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
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to VERITAS</h1>
              <p className="text-sm text-muted-foreground">Verified execution data for Northline Civic Center.</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 flex flex-col gap-5">
            
            {/* Project Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="project" className="text-sm font-medium text-foreground">Project or organization</label>
              <div className="relative">
                <select id="project" className="input cursor-pointer appearance-none pr-10" defaultValue="northline">
                  <option value="northline">Northline Civic Center</option>
                  <option value="southline">Southline Medical Hub</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Work email</label>
              <input 
                id="email" 
                type="email" 
                defaultValue="maya.chen@northlinebuild.com" 
                className="input" 
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <input 
                id="password" 
                type="password" 
                defaultValue="northline2024" 
                className="input" 
              />
            </div>

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
              <button className="btn btn-primary w-full shadow-sm text-sm py-2.5">
                Sign in
              </button>
              
              <div className="flex flex-col items-center gap-2 mt-2">
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Use company SSO
                </a>
                <a href="#" className="text-xs text-muted-foreground hover:underline">
                  Need access? Contact your workspace admin
                </a>
              </div>
            </div>
            
          </div>

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
          Environment: Production
        </p>

      </div>
    </div>
  );
}

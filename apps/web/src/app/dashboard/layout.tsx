"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarDays,
  ChartNoAxesCombined,
  TriangleAlert,
  BrainCircuit,
  History,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  CheckCircle2,
  Settings,
  Users,
  Mic,
  FileText
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
             <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const tabs = [
    { id: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "/dashboard/projects", name: "Projects", icon: CalendarDays },
    { id: "/dashboard/capture", name: "Capture", icon: Mic, roles: ["SUPERVISOR", "ADMIN"] },
    { id: "/dashboard/events", name: "Events", icon: FileText },
    { id: "/dashboard/governance", name: "Review Queue", icon: ClipboardCheck, roles: ["PLANNER", "PROJECT_MANAGER", "ADMIN"] },
    { id: "/dashboard/variances", name: "Variance", icon: ChartNoAxesCombined, roles: ["PLANNER", "PROJECT_MANAGER", "ADMIN", "AUDITOR"] },
    { id: "/dashboard/alerts", name: "Risks & Alerts", icon: TriangleAlert, roles: ["PLANNER", "PROJECT_MANAGER", "ADMIN", "AUDITOR"] },
    { id: "/dashboard/memory", name: "Project Memory", icon: BrainCircuit, roles: ["PLANNER", "PROJECT_MANAGER", "ADMIN", "AUDITOR"] },
    { id: "/dashboard/audit", name: "Audit Trail", icon: History, roles: ["AUDITOR", "ADMIN"] },
    { id: "/dashboard/admin/users", name: "Users", icon: Users, roles: ["ADMIN"] },
    { id: "/dashboard/admin/settings", name: "Settings", icon: Settings, roles: ["ADMIN"] }
  ];

  const visibleTabs = tabs.filter(tab => !tab.roles || tab.roles.some(r => user.roles.includes(r)));

  return (
    <div className="min-h-screen bg-background font-['IBM_Plex_Sans'] text-foreground">
      {/* Sidebar Shell */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[236px] flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold tracking-[0.18em] text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
            </span>
            VERITAS
          </span>
        </div>

        <div className="border-b border-border p-4">
          <button type="button" className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left shadow-sm hover:border-primary/50 transition-colors">
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Workspace</span>
              <span className="mt-1 block truncate text-sm font-medium text-foreground">VERITAS Platform</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Primary navigation">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            // Precise active matching
            const isActive = pathname === tab.id || (tab.id !== '/dashboard' && pathname.startsWith(tab.id));
            return (
              <Link
                href={tab.id}
                key={tab.id}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-white border border-border text-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted border border-transparent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Header Shell */}
      <header className="fixed inset-x-0 top-0 z-10 ml-[236px] flex h-16 items-center justify-between border-b border-border bg-card px-8 shadow-sm">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground">Workspace</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">VERITAS Platform</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">
            {visibleTabs.find(t => t.id === pathname || (t.id !== '/dashboard' && pathname.startsWith(t.id)))?.name || "Dashboard"}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search" className="h-9 w-56 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all" />
          </label>
          <button type="button" aria-label="Notifications" className="relative rounded-md p-2 text-muted-foreground hover:bg-muted transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <button type="button" className="flex items-center gap-3 border-l border-border pl-5 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary uppercase">
              {user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
            <span className="hidden min-w-0 lg:block">
              <span className="block text-sm font-medium text-foreground">{user.full_name}</span>
              <span className="block text-[11px] text-muted-foreground">{user.roles.join(', ')}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 border-l border-border pl-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-[236px] pt-16 min-h-screen bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-[1140px] px-8 py-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

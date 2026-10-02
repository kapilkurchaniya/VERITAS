"use client";

import { useEffect, useState, useRef } from "react";
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
  FileText,
  Sun,
  Moon,
  X,
  Clock,
  ShieldAlert,
  FolderKanban,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useThemeStore } from "@/lib/theme-store";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  type: "variance" | "governance" | "event";
  title: string;
  description: string;
  time: string;
  severity?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initialize, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme, initialize: initTheme } = useThemeStore();

  // UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Data state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any>(null);

  // Refs for click-outside
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const projectSwitcherRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    initTheme();
  }, [initialize, initTheme]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Load projects and notifications when user is ready
  useEffect(() => {
    if (user) {
      loadProjects();
      loadNotifications();
    }
  }, [user]);

  // Click-outside handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (projectSwitcherRef.current && !projectSwitcherRef.current.contains(e.target as Node)) setShowProjectSwitcher(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadProjects = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0 && !activeProject) {
        setActiveProject(projs[0]);
      }
    } catch {}
  };

  const loadNotifications = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      const items: NotificationItem[] = [];

      for (const proj of projs.slice(0, 3)) {
        try {
          const queue: any = await api(`/api/v1/governance/queue?project_id=${proj.id}`);
          if (queue.length > 0) {
            items.push({
              id: `gov-${proj.id}`,
              type: "governance",
              title: `${queue.length} pending review${queue.length > 1 ? "s" : ""}`,
              description: `${proj.name} — submissions awaiting planner validation`,
              time: "Now",
              severity: "warning",
            });
          }
        } catch {}

        try {
          const vSummary: any = await api(`/api/v1/governance/variances/summary?project_id=${proj.id}`);
          if (vSummary.critical > 0) {
            items.push({
              id: `var-${proj.id}`,
              type: "variance",
              title: `${vSummary.critical} critical variance${vSummary.critical > 1 ? "s" : ""}`,
              description: `${proj.name} — schedule at risk`,
              time: "Recent",
              severity: "critical",
            });
          }
        } catch {}
      }

      setNotifications(items);
    } catch {}
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    // Search across projects, events
    const results: any[] = [];
    for (const proj of projects) {
      if (proj.name.toLowerCase().includes(query.toLowerCase()) || proj.code.toLowerCase().includes(query.toLowerCase())) {
        results.push({ type: "project", label: proj.name, sub: proj.code, href: `/dashboard/projects/${proj.id}` });
      }
    }
    // Add static pages as search results
    const pages = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Capture", href: "/dashboard/capture" },
      { label: "Events", href: "/dashboard/events" },
      { label: "Review Queue", href: "/dashboard/governance" },
      { label: "Variance Analysis", href: "/dashboard/variances" },
      { label: "Alerts & Risks", href: "/dashboard/alerts" },
      { label: "Project Memory & Ask", href: "/dashboard/memory" },
      { label: "Audit Trail", href: "/dashboard/audit" },
    ];
    for (const p of pages) {
      if (p.label.toLowerCase().includes(query.toLowerCase())) {
        results.push({ type: "page", label: p.label, sub: "Page", href: p.href });
      }
    }
    setSearchResults(results.slice(0, 8));
    setShowSearch(true);
  };

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
    { id: "/dashboard/memory", name: "Memory & Ask", icon: BrainCircuit, roles: ["PLANNER", "PROJECT_MANAGER", "ADMIN", "AUDITOR"] },
    { id: "/dashboard/audit", name: "Audit Trail", icon: History, roles: ["AUDITOR", "ADMIN"] },
    { id: "/dashboard/admin/users", name: "Users", icon: Users, roles: ["ADMIN"] },
    { id: "/dashboard/admin/settings", name: "Settings", icon: Settings, roles: ["ADMIN"] }
  ];

  const visibleTabs = tabs.filter(tab => !tab.roles || tab.roles.some(r => user.roles.includes(r)));

  const getNotifIcon = (type: string, severity?: string) => {
    if (severity === "critical") return <ShieldAlert className="w-4 h-4 text-destructive" />;
    if (type === "governance") return <ClipboardCheck className="w-4 h-4 text-warning" />;
    return <Bell className="w-4 h-4 text-primary" />;
  };

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

        {/* Project Switcher */}
        <div className="border-b border-border p-4" ref={projectSwitcherRef}>
          <button
            type="button"
            onClick={() => setShowProjectSwitcher(!showProjectSwitcher)}
            className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left shadow-sm hover:border-primary/50 transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Workspace</span>
              <span className="mt-1 block truncate text-sm font-medium text-foreground">
                {activeProject ? activeProject.name : "Select Project"}
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${showProjectSwitcher ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showProjectSwitcher && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 rounded-md border border-border bg-card shadow-lg overflow-hidden"
              >
                {projects.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground text-center">No projects available</div>
                ) : (
                  projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProject(proj);
                        setShowProjectSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                        activeProject?.id === proj.id ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      <span className="truncate">{proj.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{proj.code}</span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                    ? 'bg-card border border-border text-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted border border-transparent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle at bottom */}
        <div className="p-4 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </aside>

      {/* Header Shell */}
      <header className="fixed inset-x-0 top-0 z-10 ml-[236px] flex h-16 items-center justify-between border-b border-border bg-card px-8 shadow-sm">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground">Workspace</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">{activeProject?.name || "VERITAS"}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">
            {visibleTabs.find(t => t.id === pathname || (t.id !== '/dashboard' && pathname.startsWith(t.id)))?.name || "Dashboard"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div ref={searchRef} className="relative">
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search pages, projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearch(true)}
                className="h-9 w-56 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all"
              />
            </label>

            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 right-0 w-72 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
                >
                  {searchResults.map((r, i) => (
                    <Link
                      key={i}
                      href={r.href}
                      onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm"
                    >
                      {r.type === "project" ? <FolderKanban className="w-4 h-4 text-primary shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.sub}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-md p-2 text-muted-foreground hover:bg-muted transition-all"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {notifications.length} active
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      All clear — no alerts
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.type === "governance" ? "/dashboard/governance" : "/dashboard/alerts"}
                          onClick={() => setShowNotifications(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-0.5">{getNotifIcon(n.type, n.severity)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border px-4 py-2">
                    <Link
                      href="/dashboard/alerts"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      View all alerts →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 border-l border-border pl-4 text-left"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary uppercase">
                {user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </span>
              <span className="hidden min-w-0 lg:block">
                <span className="block text-sm font-medium text-foreground">{user.full_name}</span>
                <span className="block text-[11px] text-muted-foreground">{user.roles.join(', ')}</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-2 right-0 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                    </Link>
                    <button
                      onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors w-full text-left"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hexagon,
  LayoutDashboard,
  FolderKanban,
  Mic,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  ScrollText,
  Brain,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  Bell,
} from "lucide-react";
import { useAuthStore, type UserInfo } from "@/lib/auth-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Projects", href: "/dashboard/projects", icon: <FolderKanban size={18} /> },
    ],
  },
  {
    title: "Field Operations",
    items: [
      {
        label: "Capture",
        href: "/dashboard/capture",
        icon: <Mic size={18} />,
        roles: ["SUPERVISOR", "ADMIN"],
      },
      { label: "Events", href: "/dashboard/events", icon: <FileText size={18} /> },
      {
        label: "Review",
        href: "/dashboard/review",
        icon: <ClipboardCheck size={18} />,
        roles: ["PLANNER", "ADMIN"],
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Alerts", href: "/dashboard/alerts", icon: <AlertTriangle size={18} /> },
      { label: "Audit", href: "/dashboard/audit", icon: <ScrollText size={18} /> },
      { label: "Memory", href: "/dashboard/memory", icon: <Brain size={18} /> },
      { label: "Ask NEXUS", href: "/dashboard/ask", icon: <MessageSquare size={18} /> },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        label: "Users",
        href: "/dashboard/admin/users",
        icon: <Users size={18} />,
        roles: ["ADMIN"],
      },
      {
        label: "Settings",
        href: "/dashboard/admin/settings",
        icon: <Settings size={18} />,
        roles: ["ADMIN"],
      },
    ],
  },
];

function SidebarContent({
  user,
  collapsed,
  pathname,
}: {
  user: UserInfo;
  collapsed: boolean;
  pathname: string;
}) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-14 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-border)" }}
        >
          <Hexagon size={16} style={{ color: "var(--accent)" }} />
        </div>
        {!collapsed && (
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            NEXUS
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              !item.roles || item.roles.some((r) => user.roles.includes(r))
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              {!collapsed && (
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 h-9 px-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                        collapsed ? "justify-center" : ""
                      }`}
                      style={{
                        background: isActive ? "var(--accent-muted)" : "transparent",
                        color: isActive ? "var(--accent)" : "var(--text-secondary)",
                        border: isActive
                          ? "1px solid var(--accent-border)"
                          : "1px solid transparent",
                      }}
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon}
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
            style={{
              background: "var(--accent-muted)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
            }}
          >
            {user.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user.full_name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {user.roles.join(", ")}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initialize } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Hexagon size={32} style={{ color: "var(--accent)" }} />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-40 shrink-0"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-subtle)",
        }}
        animate={{ width: collapsed ? 60 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <SidebarContent user={user} collapsed={collapsed} pathname={pathname} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-50"
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-muted)",
          }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft size={12} />
          </motion.div>
        </button>
      </motion.aside>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{
          marginLeft: collapsed ? 60 : 260,
        }}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 shrink-0 backdrop-blur-sm"
          style={{
            background: "rgba(10, 14, 23, 0.8)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h2
              className="text-sm font-semibold capitalize"
              style={{ color: "var(--text-primary)" }}
            >
              {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-md transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

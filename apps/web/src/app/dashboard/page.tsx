"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  status: string;
  member_count: number;
}

function StatCard({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {value}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  useEffect(() => {
    api<ProjectSummary[]>("/api/v1/projects")
      .then(setProjects)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Welcome back, {user?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Here&apos;s your project execution overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban size={18} />}
          label="Active Projects"
          value={projects.filter((p) => p.status === "ACTIVE").length}
          accentColor="var(--accent)"
        />
        <StatCard
          icon={<ClipboardCheck size={18} />}
          label="Pending Reviews"
          value={0}
          accentColor="var(--warning)"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Open Alerts"
          value={0}
          accentColor="var(--danger)"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Verified Events"
          value={0}
          accentColor="var(--success)"
        />
      </div>

      {/* Projects list */}
      <div>
        <h2
          className="text-sm font-semibold mb-3 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <FolderKanban size={16} />
          Your Projects
        </h2>
        {projects.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <LayoutDashboard
              size={32}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No projects found. Contact an admin to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg p-4 transition-colors duration-150 cursor-pointer"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.name}
                    </h3>
                    <p
                      className="text-xs font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {project.code}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background:
                        project.status === "ACTIVE"
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(100, 116, 139, 0.1)",
                      color:
                        project.status === "ACTIVE"
                          ? "var(--success)"
                          : "var(--text-muted)",
                      border: `1px solid ${
                        project.status === "ACTIVE"
                          ? "rgba(34, 197, 94, 0.2)"
                          : "var(--border-subtle)"
                      }`,
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {project.member_count} members
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    -- activities
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

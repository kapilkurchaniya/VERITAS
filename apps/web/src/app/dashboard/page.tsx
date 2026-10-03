"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Loader2,
  ArrowRight,
  Activity
} from "lucide-react";
import Link from "next/link";
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
  href,
  colorClass
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string;
  colorClass: string;
}) {
  const inner = (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm transition-all duration-200 hover:shadow-md group flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted ${colorClass}`}>
          {icon}
        </div>
        {href && (
          <ArrowRight
            size={14}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
          />
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
          {label}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [stats, setStats] = useState({
    pendingReviews: 0,
    criticalVariances: 0,
    verifiedEvents: 0,
    avgDelta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);

      let pendingReviews = 0;
      let criticalVariances = 0;
      let verifiedEvents = 0;
      let totalDelta = 0;
      let deltaCount = 0;

      for (const proj of projs) {
        try {
          const queue: any = await api(`/api/v1/governance/queue?project_id=${proj.id}`);
          pendingReviews += queue.length;

          const vSummary: any = await api(`/api/v1/governance/variances/summary?project_id=${proj.id}`);
          criticalVariances += vSummary.critical || 0;
          if (vSummary.avg_schedule_delta_days) {
            totalDelta += vSummary.avg_schedule_delta_days;
            deltaCount++;
          }

          const events: any = await api(`/api/v1/execution-records?project_id=${proj.id}&status=APPROVED`);
          verifiedEvents += events.length;
        } catch {
          // Individual project stats may fail, continue
        }
      }

      setStats({
        pendingReviews,
        criticalVariances,
        verifiedEvents,
        avgDelta: deltaCount > 0 ? totalDelta / deltaCount : 0,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-10 h-10 mb-3 opacity-80" />
        <h2 className="text-lg font-semibold">Connection Error</h2>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadData} className="btn btn-outline mt-4">Try Again</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Welcome */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Here's your project execution overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadData} className="btn btn-outline shadow-sm text-sm font-medium px-4 py-2 rounded-md">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stat cards — LIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban size={20} />}
          label="Active Projects"
          value={projects.filter((p) => p.status === "ACTIVE").length}
          colorClass="text-primary"
          href="/dashboard/projects"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          label="Pending Reviews"
          value={stats.pendingReviews}
          colorClass="text-warning"
          href="/dashboard/governance"
        />
        <StatCard
          icon={<ShieldAlert size={20} />}
          label="Critical Variances"
          value={stats.criticalVariances}
          colorClass="text-destructive"
          href="/dashboard/variances"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Verified Events"
          value={stats.verifiedEvents}
          colorClass="text-success"
          href="/dashboard/events"
        />
      </div>

      {/* Schedule Health Indicator */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground uppercase tracking-wider">
            <Activity size={16} className="text-primary" />
            Schedule Health
          </h2>
          <Link
            href="/dashboard/variances"
            className="text-xs font-medium flex items-center gap-1 text-primary hover:underline transition-colors"
          >
            View Details <ArrowRight size={12} />
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {stats.avgDelta > 0 ? (
              <TrendingDown size={32} className="text-destructive" />
            ) : (
              <TrendingUp size={32} className="text-success" />
            )}
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {stats.avgDelta > 0 ? "+" : ""}
              {stats.avgDelta.toFixed(1)}d
            </span>
          </div>
          <div className="h-12 w-px bg-border mx-2 hidden sm:block"></div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Average schedule delta across all active projects.
            {stats.avgDelta > 0
              ? " Projects are running behind schedule on average."
              : stats.avgDelta < 0
                ? " Projects are running ahead of schedule."
                : " Projects are exactly on track."}
          </p>
        </div>
      </div>

      {/* Projects list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground uppercase tracking-wider">
            <FolderKanban size={16} className="text-primary" />
            Your Projects
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-xs font-medium flex items-center gap-1 text-primary hover:underline transition-colors"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No projects found.</p>
            <p className="text-xs text-muted-foreground mt-1">Contact an admin to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="bg-card border border-border rounded-lg p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {project.code}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                      project.status === "ACTIVE"
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} />
                    {project.member_count} members
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

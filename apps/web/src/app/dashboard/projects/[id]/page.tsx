"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, FolderKanban, MapPin, Users, Calendar, Activity, Clock, CheckCircle2, AlertTriangle, ListTree, FileSpreadsheet, ChevronRight } from "lucide-react";

interface ProjectDetail {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  member_count: number;
}

export default function ProjectOverviewPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingReviews: 0,
    verifiedEvents: 0,
    criticalVariances: 0,
  });

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load project details
      const projs: any = await api("/api/v1/projects");
      const proj = projs.find((p: any) => p.id === params.id);
      if (proj) setProject(proj);

      // Load stats
      let totalActivities = 0;
      let pendingReviews = 0;
      let verifiedEvents = 0;
      let criticalVariances = 0;

      try {
        const queue: any = await api(`/api/v1/governance/queue?project_id=${params.id}`);
        pendingReviews = queue.length;
      } catch {}

      try {
        const events: any = await api(`/api/v1/events?project_id=${params.id}&status=APPROVED`);
        verifiedEvents = events.length;
      } catch {}

      try {
        const vSummary: any = await api(`/api/v1/governance/variances/summary?project_id=${params.id}`);
        criticalVariances = vSummary.critical || 0;
      } catch {}

      try {
        const scheds: any = await api(`/api/v1/schedules/project/${params.id}`);
        if (scheds.length > 0) {
          const vers: any = await api(`/api/v1/schedules/${scheds[0].id}/versions`);
          const activeVersion = vers.find((v: any) => v.status === "ACTIVE");
          if (activeVersion) {
            const acts: any = await api(`/api/v1/activities?schedule_version_id=${activeVersion.id}`);
            totalActivities = acts.length;
          }
        }
      } catch {}

      setStats({ totalActivities, pendingReviews, verifiedEvents, criticalVariances });
    } catch (err) {
      console.error(err);
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

  if (!project) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 text-center">
        <p className="font-medium">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm">
              {project.code}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-2.5 py-0.5 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {project.status}
                </span>
                {project.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {project.member_count} Members
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Links */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link
          href={`/dashboard/projects/${params.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary border border-primary/20"
        >
          <FolderKanban className="w-4 h-4" />
          Overview
        </Link>
        <Link
          href={`/dashboard/projects/${params.id}/activities`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
        >
          <ListTree className="w-4 h-4" />
          Activities ({stats.totalActivities})
        </Link>
        <Link
          href={`/dashboard/projects/${params.id}/schedule`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Schedule & Import
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/dashboard/projects/${params.id}/activities`} className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.totalActivities}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Total Activities</p>
        </Link>

        <Link href="/dashboard/governance" className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.pendingReviews}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Pending Reviews</p>
        </Link>

        <div className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.verifiedEvents}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Verified Events</p>
        </div>

        <Link href="/dashboard/variances" className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{stats.criticalVariances}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Critical Variances</p>
        </Link>
      </div>
    </div>
  );
}

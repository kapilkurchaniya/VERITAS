"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Clock,
  Package,
  GitBranch,
  Loader2,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldAlert,
} from "lucide-react";

interface VarianceItem {
  id: string;
  activity_code: string | null;
  activity_name: string | null;
  variance_type: string;
  severity: string;
  delta_days: number | null;
  planned_quantity: number | null;
  actual_quantity: number | null;
  quantity_delta: number | null;
  summary: string;
  details: any;
  created_at: string;
}

interface VarianceSummary {
  total_variances: number;
  critical: number;
  warnings: number;
  info: number;
  avg_schedule_delta_days: number;
}

export default function VariancesPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [variances, setVariances] = useState<VarianceItem[]>([]);
  const [summary, setSummary] = useState<VarianceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId, typeFilter, severityFilter]);

  async function loadProjects() {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      let endpoint = `/api/v1/governance/variances?project_id=${projectId}`;
      if (typeFilter !== "ALL") endpoint += `&variance_type=${typeFilter}`;
      if (severityFilter !== "ALL") endpoint += `&severity=${severityFilter}`;

      const [varianceData, summaryData]: any = await Promise.all([
        api(endpoint),
        api(`/api/v1/governance/variances/summary?project_id=${projectId}`),
      ]);
      setVariances(varianceData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SCHEDULE": return <Clock className="w-4 h-4" />;
      case "QUANTITY": return <Package className="w-4 h-4" />;
      case "SEQUENCE": return <GitBranch className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "WARNING":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Variance Analysis</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Automated deviations computed from approved execution events against
          the baseline schedule.
        </p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Total Variances</p>
            <p className="text-3xl font-bold text-foreground">{summary.total_variances}</p>
          </div>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-destructive font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Critical
            </p>
            <p className="text-3xl font-bold text-destructive">{summary.critical}</p>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-warning font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Warnings
            </p>
            <p className="text-3xl font-bold text-warning">{summary.warnings}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Avg Schedule Δ</p>
            <p className="text-3xl font-bold flex items-center gap-2 text-foreground">
              {summary.avg_schedule_delta_days > 0 ? (
                <TrendingDown className="w-6 h-6 text-destructive" />
              ) : (
                <TrendingUp className="w-6 h-6 text-success" />
              )}
              {Math.abs(summary.avg_schedule_delta_days).toFixed(1)}d
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input max-w-[200px]"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input max-w-[150px]"
        >
          <option value="ALL">All Types</option>
          <option value="SCHEDULE">Schedule</option>
          <option value="QUANTITY">Quantity</option>
          <option value="SEQUENCE">Sequence</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input max-w-[150px]"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="WARNING">Warning</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      {/* Variance List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : variances.length === 0 ? (
        <div className="border border-border bg-card shadow-sm rounded-xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No variances detected</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Variances will appear here once events are approved through governance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {variances.map((v) => (
            <div
              key={v.id}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getSeverityStyle(v.severity)}`}
                  >
                    {getTypeIcon(v.variance_type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {v.activity_code && (
                        <span className="font-mono text-sm font-bold text-primary">
                          {v.activity_code}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityStyle(v.severity)}`}
                      >
                        {v.severity}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                        {v.variance_type}
                      </span>
                    </div>

                    <p className="text-foreground text-sm font-medium">{v.summary}</p>

                    {v.activity_name && (
                      <p className="text-muted-foreground text-xs mt-1 font-medium">
                        {v.activity_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delta Display */}
                <div className="text-right shrink-0 ml-4 flex flex-col items-end justify-center">
                  {v.variance_type === "SCHEDULE" && v.delta_days !== null && (
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-bold tracking-tight ${v.delta_days > 0 ? "text-destructive" : "text-success"}`}
                      >
                        {v.delta_days > 0 ? "+" : ""}
                        {v.delta_days.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">days</span>
                    </div>
                  )}
                  {v.variance_type === "QUANTITY" && v.quantity_delta !== null && (
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-bold tracking-tight ${v.quantity_delta! < 0 ? "text-destructive" : "text-success"}`}
                      >
                        {v.quantity_delta! > 0 ? "+" : ""}
                        {v.quantity_delta!.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">units</span>
                    </div>
                  )}
                  {v.variance_type === "SEQUENCE" && v.details?.missing_predecessors && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-warning">
                        {v.details.missing_predecessors.length}
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">skipped</span>
                    </div>
                  )}
                  <p className="text-muted-foreground/60 text-xs mt-2 font-medium">
                    {new Date(v.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

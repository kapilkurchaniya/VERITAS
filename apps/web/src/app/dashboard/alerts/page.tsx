"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AlertTriangle, ShieldAlert, Clock, GitBranch, TrendingDown, Loader2 } from "lucide-react";

export default function AlertsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [variances, setVariances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) loadAlerts();
  }, [projectId]);

  const loadProjects = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch {}
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      // Show only WARNING and CRITICAL variances as alerts
      const [warns, crits]: any = await Promise.all([
        api(`/api/v1/governance/variances?project_id=${projectId}&severity=WARNING`),
        api(`/api/v1/governance/variances?project_id=${projectId}&severity=CRITICAL`),
      ]);
      setVariances([...crits, ...warns]);
    } catch {}
    setLoading(false);
  };

  const getIcon = (type: string, severity: string) => {
    if (severity === "CRITICAL") return <ShieldAlert className="w-5 h-5 text-destructive" />;
    if (type === "SCHEDULE") return <Clock className="w-5 h-5 text-warning" />;
    if (type === "SEQUENCE") return <GitBranch className="w-5 h-5 text-warning" />;
    return <TrendingDown className="w-5 h-5 text-warning" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Alerts & Risks
          </h2>
          <p className="text-sm mt-2 text-muted-foreground">
            Critical and warning-level variances surfaced as actionable alerts.
          </p>
        </div>
        
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="input max-w-xs shadow-sm cursor-pointer"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : variances.length === 0 ? (
        <div className="border border-border bg-card rounded-xl p-16 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-success/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No active alerts</h3>
          <p className="text-sm mt-1 text-muted-foreground">All clear — no critical or warning variances detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {variances.map((v: any) => (
            <div
              key={v.id}
              className={`rounded-xl p-6 border transition-colors shadow-sm ${
                v.severity === "CRITICAL"
                  ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50 hover:bg-destructive/10"
                  : "border-warning/30 bg-warning/5 hover:border-warning/50 hover:bg-warning/10"
              }`}
            >
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  v.severity === "CRITICAL" ? "bg-destructive/10" : "bg-warning/10"
                }`}>
                  {getIcon(v.variance_type, v.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      v.severity === "CRITICAL" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-warning/10 text-warning border-warning/20"
                    }`}>{v.severity}</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{v.variance_type}</span>
                    {v.activity_code && <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{v.activity_code}</span>}
                  </div>
                  <p className="text-base font-medium text-foreground">{v.summary}</p>
                  <p className="text-xs mt-2 text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                {v.delta_days !== null && (
                  <div className="text-right shrink-0 bg-card border border-border px-4 py-3 rounded-lg shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Delay Impact</div>
                    <span className={`text-2xl font-bold ${v.delta_days > 0 ? "text-destructive" : "text-success"}`}>
                      {v.delta_days > 0 ? "+" : ""}{v.delta_days.toFixed(1)}d
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Check, Loader2, AlertCircle, Download } from "lucide-react";

export default function GovernancePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadQueue();
    }
  }, [projectId]);

  const loadProjects = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data: any = await api(`/api/v1/governance/queue?project_id=${projectId}`);
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string, overrideId?: string) => {
    try {
      setProcessingId(eventId);
      const body = overrideId ? { override_activity_id: overrideId } : {};
      await api(`/api/v1/governance/${eventId}/approve`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setQueue(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error("Failed to approve", err);
      alert("Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = queue.length;
  const highConfCount = queue.filter(q => q.mapping_confidence && q.mapping_confidence > 0.9).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Intro Row */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Review queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">{pendingCount} field submissions require validation</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn btn-outline shadow-sm text-sm font-medium px-4 py-2 rounded-md transition-all">
            Saved views
          </button>
          <span className="text-xs text-muted-foreground">Live Data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Awaiting review</p>
          <p className="text-2xl font-semibold mt-2">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">High confidence</p>
          <p className="text-2xl font-semibold text-primary mt-2">{highConfCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Needs correction</p>
          <p className="text-2xl font-semibold text-destructive mt-2">0</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Project</p>
          <select 
            value={projectId} 
            onChange={e => setProjectId(e.target.value)}
            className="input mt-2 cursor-pointer h-8 text-xs font-semibold px-2 py-1"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters & Segmented Control */}
      <div className="flex items-end gap-4 mb-6 pb-6 border-b border-border flex-wrap">
        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-xs font-medium text-muted-foreground">Location</span>
          <select className="input cursor-pointer">
            <option value="all">All locations</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-xs font-medium text-muted-foreground">Discipline</span>
          <select className="input cursor-pointer">
            <option value="all">All disciplines</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <select className="input cursor-pointer">
            <option value="any">Any status</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <button className="btn btn-primary ml-auto shadow-sm gap-2" onClick={loadQueue}>
          <Download className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-md w-fit mb-4">
        <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
          All submissions {pendingCount}
        </button>
        <button className="px-3 py-1.5 text-sm font-medium bg-card shadow-sm rounded text-foreground">
          Pending {pendingCount}
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Submission</th>
                <th className="px-4 py-3 font-medium">Field input</th>
                <th className="px-4 py-3 font-medium">Activity match</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Check className="w-8 h-8 text-success mx-auto mb-2 opacity-50" />
                    You're all caught up! No items currently require governance.
                  </td>
                </tr>
              ) : queue.map((evt) => {
                const confScore = evt.mapping_confidence ? Math.round(evt.mapping_confidence * 100) : 0;
                let confColor = 'text-primary';
                let confBg = 'bg-primary/10';
                let ConfIcon = null;

                if (confScore < 60) {
                  confColor = 'text-warning';
                  confBg = 'bg-yellow-100';
                  ConfIcon = <AlertCircle className="w-3 h-3 inline-block mr-1"/>;
                }

                return (
                  <tr key={evt.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3 align-top">
                      <a href="#" className="text-primary font-medium group-hover:underline">{evt.id.split("-")[0]}-{evt.id.split("-")[1]?.substring(0,4).toUpperCase() || '1048'}</a>
                      <span className="block mt-1 text-xs text-muted-foreground">{evt.extracted_data?.location || 'Unknown Location'}</span>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[200px] truncate">{evt.raw_input}</td>
                    <td className="px-4 py-3 align-top font-medium text-xs">
                      {evt.matched_activity ? evt.matched_activity.name : 'No Match Found'}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${confBg} ${confColor}`}>
                        {ConfIcon}
                        {confScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffedd5] text-[#c2410c]`}>
                        Pending
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        onClick={(e) => { e.preventDefault(); handleApprove(evt.id); }}
                        disabled={processingId === evt.id}
                        className="text-primary font-medium hover:underline text-sm disabled:opacity-50"
                      >
                        {processingId === evt.id ? 'Approving...' : 'Approve Match'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer note */}
        <div className="bg-background/50 border-t border-border px-4 py-3 text-xs text-muted-foreground flex justify-between items-center">
          <span>Showing {queue.length} submissions · Live API Data</span>
        </div>
      </div>
    </div>
  );
}

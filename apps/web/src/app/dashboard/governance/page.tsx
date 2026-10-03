"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Check, Loader2, AlertCircle, RefreshCw, X, MessageSquare, Edit3 } from "lucide-react";
import { SlideDrawer } from "@/app/components/SlideDrawer";

export default function GovernancePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [queue, setQueue] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"pending" | "all">("pending");

  // Reject drawer state
  const [showReject, setShowReject] = useState(false);
  const [rejectEventId, setRejectEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Detail drawer state
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadQueue();
      if (viewMode === "all") loadAllEvents();
    }
  }, [projectId, viewMode]);

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
    if (!projectId) return;
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

  const loadAllEvents = async () => {
    if (!projectId) return;
    try {
      const data: any = await api(`/api/v1/execution-records?project_id=${projectId}`);
      setAllEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (eventId: string, overrideId?: string) => {
    try {
      setProcessingId(eventId);
      const body = overrideId ? { override_activity_id: overrideId } : { override_activity_id: null };
      await api(`/api/v1/governance/${eventId}/approve`, { method: "POST", body });
      setQueue(prev => prev.filter(e => e.id !== eventId));
      if (viewMode === "all") await loadAllEvents();
    } catch (err) {
      console.error("Failed to approve", err);
      alert("Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectEventId) return;
    try {
      setRejecting(true);
      await api(`/api/v1/governance/${rejectEventId}/reject`, { method: "POST" });
      setQueue(prev => prev.filter(e => e.id !== rejectEventId));
      setShowReject(false);
      setRejectEventId(null);
      setRejectReason("");
      if (viewMode === "all") await loadAllEvents();
    } catch (err) {
      console.error("Failed to reject", err);
      alert("Failed to reject");
    } finally {
      setRejecting(false);
    }
  };

  const openReject = (eventId: string) => {
    setRejectEventId(eventId);
    setRejectReason("");
    setShowReject(true);
  };

  const openDetail = (evt: any) => {
    setSelectedEvent(evt);
    setShowDetail(true);
  };

  if (loading && queue.length === 0) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayItems = viewMode === "pending" ? queue : allEvents;
  const pendingCount = queue.length;
  const highConfCount = queue.filter(q => q.mapping_confidence && q.mapping_confidence > 0.9).length;
  const lowConfCount = queue.filter(q => q.mapping_confidence && q.mapping_confidence < 0.6).length;

  const getStatusChip = (status: string) => {
    switch (status) {
      case "MATCHED": case "REVIEW_REQUIRED":
        return <span className="chip bg-[#ffedd5] text-[#c2410c] border-[#fed7aa]">Pending</span>;
      case "APPROVED":
        return <span className="chip bg-success/10 text-success border-success/20">Approved</span>;
      case "REJECTED":
        return <span className="chip bg-destructive/10 text-destructive border-destructive/20">Rejected</span>;
      default:
        return <span className="chip bg-muted text-muted-foreground border-border">{status.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Intro Row */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Review queue</h1>
          <p className="mt-2 text-sm text-muted-foreground">{pendingCount} field submissions require validation</p>
        </div>
        <div className="flex items-center gap-4">
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
          <p className="text-2xl font-semibold text-destructive mt-2">{lowConfCount}</p>
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

      {/* Filters & Refresh */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border flex-wrap">
        <button className="btn btn-primary shadow-sm gap-2" onClick={loadQueue}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>

        {/* Segmented Control */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
          <button
            onClick={() => setViewMode("pending")}
            className={`px-3 py-1.5 text-sm font-medium transition-all rounded ${
              viewMode === "pending"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending {pendingCount}
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 text-sm font-medium transition-all rounded ${
              viewMode === "all"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All submissions
          </button>
        </div>
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
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Check className="w-8 h-8 text-success mx-auto mb-2 opacity-50" />
                    {viewMode === "pending"
                      ? "You're all caught up! No items currently require governance."
                      : "No events found for this project."}
                  </td>
                </tr>
              ) : displayItems.map((evt) => {
                const confScore = evt.mapping_confidence ? Math.round(evt.mapping_confidence * 100) : 0;
                let confColor = 'text-primary';
                let confBg = 'bg-primary/10';
                let ConfIcon = null;

                if (confScore < 60) {
                  confColor = 'text-warning';
                  confBg = 'bg-yellow-100';
                  ConfIcon = <AlertCircle className="w-3 h-3 inline-block mr-1"/>;
                }

                const isPending = evt.status === "MATCHED" || evt.status === "REVIEW_REQUIRED";

                return (
                  <tr
                    key={evt.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => openDetail(evt)}
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="text-primary font-medium">{evt.id.split("-")[0]}-{evt.id.split("-")[1]?.substring(0,4).toUpperCase() || '1048'}</span>
                      <span className="block mt-1 text-xs text-muted-foreground">{evt.extracted_data?.location || 'Unknown Location'}</span>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[200px] truncate">{evt.raw_input || "Media source"}</td>
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
                      {getStatusChip(evt.status)}
                    </td>
                    <td className="px-4 py-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(evt.id); }}
                            disabled={processingId === evt.id}
                            className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                          >
                            {processingId === evt.id ? 'Approving...' : 'Approve'}
                          </button>
                          <span className="text-border">|</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openReject(evt.id); }}
                            className="text-sm font-medium text-destructive hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer note */}
        <div className="bg-background/50 border-t border-border px-4 py-3 text-xs text-muted-foreground flex justify-between items-center">
          <span>Showing {displayItems.length} submissions · Live API Data</span>
        </div>
      </div>

      {/* Reject Drawer */}
      <SlideDrawer
        open={showReject}
        onClose={() => { setShowReject(false); setRejectEventId(null); }}
        title="Reject Submission"
        subtitle="Provide a reason for rejecting this field submission"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowReject(false)} className="btn btn-ghost">Cancel</button>
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="btn btn-destructive gap-2 disabled:opacity-50"
            >
              {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
              <X className="w-4 h-4" />
              Reject Submission
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this submission being rejected? (Required by blueprint)"
              className="input h-32 resize-none"
            />
          </div>
        </div>
      </SlideDrawer>

      {/* Event Detail Drawer (Traceability) */}
      <SlideDrawer
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelectedEvent(null); }}
        title="Event Traceability"
        subtitle={selectedEvent ? `Event ${selectedEvent.id.split("-")[0]}` : ""}
        wide
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3">
              {getStatusChip(selectedEvent.status)}
              {selectedEvent.mapping_confidence && (
                <span className="text-sm text-muted-foreground">
                  Confidence: <strong>{Math.round(selectedEvent.mapping_confidence * 100)}%</strong>
                </span>
              )}
            </div>

            {/* Raw Input */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Raw Field Input</h4>
              <p className="text-sm text-foreground">{selectedEvent.raw_input || "Media source (no text)"}</p>
            </div>

            {/* Extracted Data */}
            {selectedEvent.extracted_data && (
              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">AI Extraction</h4>
                <div className="space-y-2">
                  {Object.entries(selectedEvent.extracted_data).map(([key, val]) => (
                    <div key={key} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground font-medium min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-foreground">{String(val) || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Activity */}
            {selectedEvent.matched_activity && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Matched Activity</h4>
                <p className="text-sm font-medium text-foreground">{selectedEvent.matched_activity.name}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{selectedEvent.matched_activity.activity_code}</p>
              </div>
            )}

            {/* Evidence */}
            {selectedEvent.evidence && selectedEvent.evidence.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Evidence Files</h4>
                <div className="space-y-2">
                  {selectedEvent.evidence.map((ev: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                      <span className="text-sm font-medium text-foreground">{ev.file_name || `Evidence ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Timeline</h4>
              <div className="space-y-3 border-l-2 border-border pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                  <p className="text-sm font-medium text-foreground">Submitted</p>
                  <p className="text-xs text-muted-foreground">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                </div>
                {selectedEvent.status === "APPROVED" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
                    <p className="text-sm font-medium text-success">Approved</p>
                  </div>
                )}
                {selectedEvent.status === "REJECTED" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-card" />
                    <p className="text-sm font-medium text-destructive">Rejected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}

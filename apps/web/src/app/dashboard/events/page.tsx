"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileText, Loader2, Search, Filter, MessageSquare, Mic, Image as ImageIcon, CheckCircle2, Clock } from "lucide-react";

export default function EventsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadEvents();
      // Poll every 5 seconds for updates
      const intervalId = setInterval(loadEvents, 5000);
      return () => clearInterval(intervalId);
    }
  }, [projectId, statusFilter]);

  async function loadProjects() {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadEvents() {
    try {
      setLoading(true);
      let endpoint = `/api/v1/events?project_id=${projectId}`;
      if (statusFilter !== "ALL") {
        endpoint += `&status=${statusFilter}`;
      }
      const data: any = await api(endpoint);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PROCESSING":
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>;
      case "EXTRACTED":
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider w-max">Extracted</span>;
      case "MATCHED":
        return <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider w-max">Matched</span>;
      case "REVIEW_REQUIRED":
        return <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider w-max">Review Needed</span>;
      case "APPROVED":
        return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-600 border border-teal-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      default:
        return <span className="px-2.5 py-1 bg-muted text-muted-foreground border border-border rounded-full text-[10px] font-bold uppercase tracking-wider w-max">{status}</span>;
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "AUDIO": return <Mic className="w-4 h-4 text-muted-foreground" />;
      case "IMAGE": return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
      default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Execution Events</h2>
          <p className="text-muted-foreground text-sm mt-2">Monitor all field updates, processing status, and governance queue.</p>
        </div>
      </div>

      <div className="flex space-x-4">
        {/* Project Selector */}
        <select 
          value={projectId} 
          onChange={e => setProjectId(e.target.value)}
          className="input max-w-[200px]"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="input max-w-[200px]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_PROCESSING">Pending Processing</option>
          <option value="EXTRACTED">Extracted</option>
          <option value="MATCHED">Matched</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
          <option value="APPROVED">Approved</option>
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search raw text, normalized text..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (() => {
          const filtered = events.filter((evt: any) => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            return (evt.raw_input?.toLowerCase().includes(term)) || (evt.normalized_text?.toLowerCase().includes(term));
          });
          return filtered.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No events found.</p>
            <p className="text-sm mt-1">Try adjusting your filters or selecting a different project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Raw Input / Preview</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Evidence</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-muted border border-border group-hover:bg-background transition-colors">
                        {getSourceIcon(evt.source_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        {evt.raw_input ? (
                          <p className="truncate font-medium text-foreground text-base">{evt.raw_input}</p>
                        ) : (
                          <p className="italic text-muted-foreground">No raw text (Media source)</p>
                        )}
                        {evt.normalized_text && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">Norm: {evt.normalized_text}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(evt.status)}
                    </td>
                    <td className="px-6 py-4">
                      {evt.evidence && evt.evidence.length > 0 ? (
                        <div className="flex -space-x-2">
                          {evt.evidence.map((f: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center title shadow-sm" title={f.file_name}>
                              <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs font-medium">
                      {new Date(evt.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        })()}
      </div>
    </div>
  );
}

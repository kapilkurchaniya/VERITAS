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

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      loadEvents();
    }
  }, [projectId, statusFilter]);

  const loadProjects = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvents = async () => {
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PROCESSING":
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case "EXTRACTED":
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-xs font-medium">Extracted</span>;
      case "MATCHED":
        return <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded text-xs font-medium">Matched</span>;
      case "REVIEW_REQUIRED":
        return <span className="px-2 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-xs font-medium">Review Needed</span>;
      case "APPROVED":
        return <span className="px-2 py-1 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      default:
        return <span className="px-2 py-1 bg-white/10 text-white/50 border border-white/20 rounded text-xs font-medium">{status}</span>;
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "AUDIO": return <Mic className="w-4 h-4 text-white/50" />;
      case "IMAGE": return <ImageIcon className="w-4 h-4 text-white/50" />;
      default: return <MessageSquare className="w-4 h-4 text-white/50" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Execution Events</h2>
          <p className="text-white/50 text-sm mt-1">Monitor all field updates, processing status, and governance queue.</p>
        </div>
      </div>

      <div className="flex space-x-4">
        {/* Project Selector */}
        <select 
          value={projectId} 
          onChange={e => setProjectId(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_PROCESSING">Pending Processing</option>
          <option value="EXTRACTED">Extracted</option>
          <option value="MATCHED">Matched</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
          <option value="APPROVED">Approved</option>
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search raw text, normalized text..." 
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-md focus:outline-none focus:border-white/30 text-sm"
          />
        </div>
      </div>

      <div className="border border-white/10 bg-black/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/50" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            No events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/70 border-b border-white/10 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Raw Input / Preview</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Evidence</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
                        {getSourceIcon(evt.source_type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        {evt.raw_input ? (
                          <p className="truncate font-medium text-white/90">{evt.raw_input}</p>
                        ) : (
                          <p className="italic text-white/40">No raw text (Media source)</p>
                        )}
                        {evt.normalized_text && (
                          <p className="text-xs text-white/50 mt-1 truncate">Norm: {evt.normalized_text}</p>
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
                            <div key={i} className="w-8 h-8 rounded border border-white/20 bg-white/10 flex items-center justify-center title" title={f.file_name}>
                              <ImageIcon className="w-4 h-4 text-white/70" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/50 whitespace-nowrap">
                      {new Date(evt.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

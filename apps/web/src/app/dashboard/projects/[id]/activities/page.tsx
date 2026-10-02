"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Search, Loader2, GitCommit, ListTree, FolderKanban, FileSpreadsheet, ChevronRight, LayoutList, ChartBar } from "lucide-react";
import { SlideDrawer } from "@/app/components/SlideDrawer";

export default function ActivitiesPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "gantt">("list");

  // Dependency drawer
  const [showDeps, setShowDeps] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
    if (params.id) loadActivities();
  }, [params.id]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // 1. Get schedule
      const scheds: any = await api(`/api/v1/schedules/project/${params.id}`);
      if (scheds.length === 0) {
        setLoading(false);
        return;
      }
      
      // 2. Get active version
      const vers: any = await api(`/api/v1/schedules/${scheds[0].id}/versions`);
      const activeVersion = vers.find((v: any) => v.status === "ACTIVE");
      
      if (!activeVersion) {
        setLoading(false);
        return;
      }

      // 3. Get activities
      const acts: any = await api(`/api/v1/activities?schedule_version_id=${activeVersion.id}`);
      setActivities(acts);
    } catch (err) {
      console.error("Failed to load activities", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.activity_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute Gantt layout parameters
  const ganttData = useMemo(() => {
    if (filteredActivities.length === 0) return { min: 0, max: 0, duration: 0, items: [] };

    const validActs = filteredActivities.filter(a => a.planned_start && a.planned_end);
    if (validActs.length === 0) return { min: 0, max: 0, duration: 0, items: [] };

    const starts = validActs.map(a => new Date(a.planned_start).getTime());
    const ends = validActs.map(a => new Date(a.planned_end).getTime());
    
    // Add 5% padding to start and end
    const rawMin = Math.min(...starts);
    const rawMax = Math.max(...ends);
    const rawDuration = rawMax - rawMin;
    
    const min = rawMin - (rawDuration * 0.05);
    const max = rawMax + (rawDuration * 0.05);
    const duration = max - min;

    const items = validActs.map(a => {
      const s = new Date(a.planned_start).getTime();
      const e = new Date(a.planned_end).getTime();
      const left = ((s - min) / duration) * 100;
      const width = Math.max(((e - s) / duration) * 100, 0.5); // ensure minimum width
      return { ...a, left, width };
    });

    return { min, max, duration, items };
  }, [filteredActivities]);

  const openDependencies = (act: any) => {
    setSelectedActivity(act);
    setShowDeps(true);
  };

  const getPredecessors = (act: any) => {
    if (!act.predecessor_ids || act.predecessor_ids.length === 0) return [];
    return activities.filter(a => act.predecessor_ids.includes(a.id));
  };

  const getSuccessors = (act: any) => {
    if (!act.id) return [];
    return activities.filter(a => a.predecessor_ids && a.predecessor_ids.includes(act.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Activities</h2>
          <p className="text-muted-foreground text-sm mt-1">View and manage schedule activities (Active Version).</p>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link
          href={`/dashboard/projects/${params.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
        >
          <FolderKanban className="w-4 h-4" />
          Overview
        </Link>
        <Link
          href={`/dashboard/projects/${params.id}/activities`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary border border-primary/20"
        >
          <ListTree className="w-4 h-4" />
          Activities ({activities.length})
        </Link>
        <Link
          href={`/dashboard/projects/${params.id}/schedule`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Schedule & Import
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search activity by code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full bg-card"
          />
        </div>

        <div className="flex items-center bg-muted p-1 rounded-md shrink-0">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setView("gantt")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
              view === "gantt" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChartBar className="w-4 h-4" />
            Gantt
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ListTree className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-1">Ensure an active schedule version is imported.</p>
          </div>
        ) : view === "list" ? (
          // List View
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Start</th>
                  <th className="px-6 py-4 font-medium">Finish</th>
                  <th className="px-6 py-4 font-medium text-right">Progress</th>
                  <th className="px-6 py-4 font-medium text-center">Deps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-3 font-mono text-primary font-medium">{act.activity_code}</td>
                    <td className="px-6 py-3 font-medium text-foreground max-w-[300px] truncate" title={act.name}>{act.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {act.planned_start ? new Date(act.planned_start).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {act.planned_end ? new Date(act.planned_end).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-muted-foreground">0%</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => openDependencies(act)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View Dependencies"
                      >
                        <GitCommit className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Gantt View
          <div className="overflow-x-auto p-4">
            {ganttData.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No scheduled activities with valid dates found matching search.
              </div>
            ) : (
              <div className="min-w-[800px]">
                {/* Header (Timeline) */}
                <div className="flex border-b border-border pb-2 mb-4 text-xs font-medium text-muted-foreground">
                  <div className="w-[300px] shrink-0 px-4">Activity Name</div>
                  <div className="flex-1 relative flex items-center justify-between px-4">
                    <span>{new Date(ganttData.min).toLocaleDateString()}</span>
                    <span>Project Timeline</span>
                    <span>{new Date(ganttData.max).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-2 pb-4">
                  {ganttData.items.map((act) => (
                    <div key={act.id} className="flex group items-center hover:bg-muted/30 rounded-md transition-colors py-1">
                      <div className="w-[300px] shrink-0 px-4 flex flex-col pr-4 border-r border-border/50">
                        <span className="font-mono text-[10px] text-primary">{act.activity_code}</span>
                        <span className="text-sm font-medium text-foreground truncate" title={act.name}>
                          {act.name}
                        </span>
                      </div>
                      <div className="flex-1 relative h-8 mx-4 bg-muted/20 rounded-md overflow-hidden">
                        {/* The background track */}
                        <div
                          onClick={() => openDependencies(act)}
                          className="absolute h-full bg-primary/80 hover:bg-primary transition-colors rounded-md shadow-sm flex items-center px-2 cursor-pointer group-hover:ring-2 ring-primary/20"
                          style={{ left: `${act.left}%`, width: `${act.width}%` }}
                          title={`${act.name}\nStart: ${new Date(act.planned_start).toLocaleDateString()}\nEnd: ${new Date(act.planned_end).toLocaleDateString()}`}
                        >
                          {act.width > 15 && (
                            <span className="text-[10px] text-primary-foreground font-medium truncate">
                              {new Date(act.planned_start).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dependencies Drawer */}
      <SlideDrawer
        open={showDeps}
        onClose={() => { setShowDeps(false); setSelectedActivity(null); }}
        title="Activity Details"
        subtitle={selectedActivity ? `${selectedActivity.activity_code} — ${selectedActivity.name}` : ""}
      >
        {selectedActivity && (
          <div className="space-y-6">
            {/* Activity Info */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Activity Data</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium text-primary">{selectedActivity.activity_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start</span>
                  <span className="text-foreground">{selectedActivity.planned_start ? new Date(selectedActivity.planned_start).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finish</span>
                  <span className="text-foreground">{selectedActivity.planned_end ? new Date(selectedActivity.planned_end).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Duration</span>
                  <span className="text-foreground">
                    {selectedActivity.planned_start && selectedActivity.planned_end 
                      ? Math.ceil((new Date(selectedActivity.planned_end).getTime() - new Date(selectedActivity.planned_start).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Predecessors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Predecessors ({getPredecessors(selectedActivity).length})
              </h4>
              {getPredecessors(selectedActivity).length === 0 ? (
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
                  No predecessors — this is a start activity
                </div>
              ) : (
                <div className="space-y-2">
                  {getPredecessors(selectedActivity).map(pred => (
                    <div key={pred.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-primary font-medium">{pred.activity_code}</span>
                        <p className="text-sm text-foreground mt-0.5">{pred.name}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Successors */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Successors ({getSuccessors(selectedActivity).length})
              </h4>
              {getSuccessors(selectedActivity).length === 0 ? (
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
                  No successors — this is a terminal activity
                </div>
              ) : (
                <div className="space-y-2">
                  {getSuccessors(selectedActivity).map(succ => (
                    <div key={succ.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-primary font-medium">{succ.activity_code}</span>
                        <p className="text-sm text-foreground mt-0.5">{succ.name}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}

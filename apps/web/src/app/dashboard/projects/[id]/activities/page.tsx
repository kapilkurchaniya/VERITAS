"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Search, Filter, Loader2, GitCommit, ListTree } from "lucide-react";

export default function ActivitiesPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Activities</h2>
          <p className="text-muted-foreground text-sm mt-1">View and manage schedule activities (Active Version).</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search activity by code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                    <td className="px-6 py-3 font-medium text-foreground">{act.name}</td>
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
                      <button className="text-muted-foreground hover:text-primary transition-colors" title="View Dependencies">
                        <GitCommit className="w-4 h-4 mx-auto" />
                      </button>
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

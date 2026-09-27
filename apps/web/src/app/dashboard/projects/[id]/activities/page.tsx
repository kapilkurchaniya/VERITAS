"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Search, Filter, Loader2, GitCommit } from "lucide-react";

export default function ActivitiesPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadActivities();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
          <p className="text-white/50 text-sm mt-1">View and manage schedule activities (Active Version).</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search activity by code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-md focus:outline-none focus:border-white/30 text-sm"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-white/10 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-sm">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="border border-white/10 bg-black/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/50" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-white/50">
            No activities found. Ensure an active schedule version is imported.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/70 border-b border-white/10 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Start</th>
                  <th className="px-6 py-3 font-medium">Finish</th>
                  <th className="px-6 py-3 font-medium text-right">Progress</th>
                  <th className="px-6 py-3 font-medium text-center">Deps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3 font-mono text-white/80">{act.activity_code}</td>
                    <td className="px-6 py-3 font-medium">{act.name}</td>
                    <td className="px-6 py-3 text-white/60">
                      {act.planned_start ? new Date(act.planned_start).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-3 text-white/60">
                      {act.planned_end ? new Date(act.planned_end).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-white/40">0%</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-white/30 hover:text-white transition-colors" title="View Dependencies">
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

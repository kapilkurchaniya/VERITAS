"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";

export default function SchedulePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    loadSchedules();
  }, [params.id]);

  const loadSchedules = async () => {
    try {
      const scheds: any = await api(`/api/v1/schedules/project/${params.id}`);
      setSchedules(scheds);
      if (scheds.length > 0) {
        const vers: any = await api(`/api/v1/schedules/${scheds[0].id}/versions`);
        setVersions(vers);
      }
    } catch (err) {
      console.error("Failed to load schedules", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("project_id", params.id);
      formData.append("file", file);

      // Using raw fetch since our api wrapper doesn't handle FormData perfectly yet
      const token = localStorage.getItem("nexus_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${API_BASE}/api/v1/schedules/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      setFile(null);
      await loadSchedules();
    } catch (err) {
      console.error(err);
      alert("Failed to upload schedule.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Management</h2>
          <p className="text-white/50 text-sm mt-1">Import and manage master schedule versions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="border border-white/10 bg-black/20 rounded-lg p-6">
            <h3 className="font-medium mb-4">Import New Schedule</h3>
            
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <UploadCloud className="w-8 h-8 text-white/50 mx-auto mb-3" />
              <p className="text-sm text-white/70">
                {file ? file.name : "Drag & drop CSV/XLSX or click to browse"}
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-4 w-full flex items-center justify-center space-x-2 bg-white text-black px-4 py-2 rounded font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{uploading ? "Importing..." : "Process Schedule"}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="border border-white/10 bg-black/20 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="font-medium">Version History</h3>
            </div>
            
            {versions.length === 0 ? (
              <div className="p-12 text-center text-white/50">
                No schedule versions found. Import one to begin.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {versions.map((v: any) => (
                  <div key={v.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-lg">Version {v.version_num}</span>
                        {v.status === "ACTIVE" && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/30">
                            Active
                          </span>
                        )}
                        {v.status === "ARCHIVED" && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/50 border border-white/20">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mt-1">Source: {v.source_file_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/50">{new Date(v.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

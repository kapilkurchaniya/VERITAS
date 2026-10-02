"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, FolderKanban, ListTree } from "lucide-react";

export default function SchedulePage() {
  const params = useParams<{ id: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) loadSchedules();
  }, [params.id]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const scheds: any = await api(`/api/v1/schedules/project/${params.id}`);
      setSchedules(scheds);
      if (scheds.length > 0) {
        const vers: any = await api(`/api/v1/schedules/${scheds[0].id}/versions`);
        setVersions(vers);
      }
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
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
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Schedule Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Import and manage master schedule versions.</p>
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
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
        >
          <ListTree className="w-4 h-4" />
          Activities
        </Link>
        <Link
          href={`/dashboard/projects/${params.id}/schedule`}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary border border-primary/20"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Schedule & Import
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-medium text-foreground mb-4">Import New Schedule</h3>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                {file ? file.name : "Drag & drop CSV/XLSX"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-4 w-full btn btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>{uploading ? "Importing..." : "Process Schedule"}</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted">
              <h3 className="font-medium text-foreground text-sm uppercase tracking-wider">Version History</h3>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-12 text-center">
                <FileSpreadsheet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">No schedule versions found</p>
                <p className="text-xs text-muted-foreground mt-1">Import one to begin.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {versions.map((v: any) => (
                  <div key={v.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-lg text-foreground">Version {v.version_num}</span>
                        {v.status === "ACTIVE" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                        {v.status === "ARCHIVED" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">Source: {v.source_file_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium">{new Date(v.created_at).toLocaleString()}</p>
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

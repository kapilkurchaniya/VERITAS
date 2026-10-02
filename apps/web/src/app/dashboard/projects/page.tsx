"use client";

import { useState, useEffect } from "react";
import { api, ApiClientError } from "@/lib/api";
import { FolderKanban, Loader2, MapPin, Users, Plus, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SlideDrawer } from "@/app/components/SlideDrawer";

interface ProjectItem {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  member_count: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const data: any = await api("/api/v1/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateProject = async () => {
    if (!name.trim() || !code.trim()) return;
    setCreating(true);
    setCreateError(null);

    try {
      await api("/api/v1/projects", {
        method: "POST",
        body: { name: name.trim(), code: code.trim().toUpperCase(), description: description.trim() || null, location: location.trim() || null },
      });
      // Reset form
      setName(""); setCode(""); setDescription(""); setLocation("");
      setShowCreate(false);
      await loadProjects();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setCreateError(typeof err.detail === "string" ? err.detail : "Failed to create project");
      } else {
        setCreateError("Failed to create project");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Manage your construction projects, view status, and access project workspaces.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-sm flex flex-col items-center justify-center">
          <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground">No projects found.</p>
          <p className="text-sm mt-1">Create a new project to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                    {project.code}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1" title={project.name}>
                      {project.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mt-1">
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
                {project.description || "No description provided."}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{project.location || "Unknown Location"}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{project.member_count} Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <Link href={`/dashboard/projects/${project.id}`} className="w-full mt-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                View Workspace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Drawer */}
      <SlideDrawer
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(null); }}
        title="Create New Project"
        subtitle="Set up a new construction project workspace"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={creating || !name.trim() || !code.trim()}
              className="btn btn-primary gap-2 disabled:opacity-50"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Project
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {createError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
              {createError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NH-47 Bypass Package 3"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Project Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. NH47"
              className="input font-mono uppercase"
            />
            <p className="text-xs text-muted-foreground mt-1">Short unique identifier (auto-uppercased)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description..."
              className="input h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Chennai, Tamil Nadu"
              className="input"
            />
          </div>
        </div>
      </SlideDrawer>
    </div>
  );
}

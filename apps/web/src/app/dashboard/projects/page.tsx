"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FolderKanban, Loader2, MapPin, Users, Plus, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Manage your construction projects, view status, and access project workspaces.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
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
              
              <Link href={`/dashboard?project=${project.id}`} className="w-full mt-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                View Workspace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div
      className="rounded-lg p-12 text-center"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <FolderKanban size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Projects
      </h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Project management will be available in Phase 2 — Schedule Management.
      </p>
    </div>
  );
}

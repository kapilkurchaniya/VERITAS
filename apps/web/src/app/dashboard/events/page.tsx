"use client";

import { FileText } from "lucide-react";

export default function EventsPage() {
  return (
    <div
      className="rounded-lg p-12 text-center"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <FileText size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Execution Events
      </h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Events will populate after field capture is active (Phase 3+).
      </p>
    </div>
  );
}

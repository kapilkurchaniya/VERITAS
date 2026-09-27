"use client";

import { ClipboardCheck } from "lucide-react";

export default function ReviewPage() {
  return (
    <div
      className="rounded-lg p-12 text-center"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <ClipboardCheck size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Review Queue
      </h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        The planner review workflow will be built in Phase 6 — Governance.
      </p>
    </div>
  );
}

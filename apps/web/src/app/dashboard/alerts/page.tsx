"use client";

import { AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="rounded-lg p-12 text-center"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
      <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Alerts</h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Risk alerts will be generated in Phase 7 — Verified Actual &amp; Variance.
      </p>
    </div>
  );
}

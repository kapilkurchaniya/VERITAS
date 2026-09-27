"use client";

import { ScrollText } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="rounded-lg p-12 text-center"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
      <ScrollText size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Audit Trail</h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Full audit traceability UI will be built in Phase 8 — Dashboard &amp; Analytics.
      </p>
    </div>
  );
}

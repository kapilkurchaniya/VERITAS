"use client";

import { Mic } from "lucide-react";

export default function CapturePage() {
  return (
    <div
      className="rounded-lg p-12 text-center"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Mic size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        Field Capture
      </h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Field capture interface will be built in Phase 3 — Field Capture.
      </p>
    </div>
  );
}

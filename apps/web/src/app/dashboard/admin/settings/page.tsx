"use client";

import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="rounded-lg p-12 text-center"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
      <Settings size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Settings</h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        System configuration is planned for Phase 10 — Production Hardening.
      </p>
    </div>
  );
}

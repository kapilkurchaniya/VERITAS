"use client";

import { MessageSquare } from "lucide-react";

export default function AskPage() {
  return (
    <div className="rounded-lg p-12 text-center"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
      <MessageSquare size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
      <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Ask NEXUS</h2>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        RAG-powered project Q&amp;A will be built in Phase 9 — Memory &amp; RAG.
      </p>
    </div>
  );
}

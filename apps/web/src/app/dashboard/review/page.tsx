"use client";

import { ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function ReviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border border-border bg-card rounded-xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <ClipboardCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Review Queue
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The planner review workflow is available in the Governance section.
        </p>
        <Link
          href="/dashboard/governance"
          className="btn btn-primary mt-6 shadow-sm"
        >
          Go to Review Queue
        </Link>
      </div>
    </div>
  );
}

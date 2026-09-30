"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, CalendarDays, ListTree } from "lucide-react";

export default function ProjectDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();
  // Extract id from the URL since we can't await in a client component layout
  const segments = pathname.split("/");
  const projectIdx = segments.indexOf("projects");
  const id = projectIdx >= 0 ? segments[projectIdx + 1] : "";

  const tabs = [
    { href: `/dashboard/projects/${id}`, label: "Overview", icon: FolderGit2 },
    { href: `/dashboard/projects/${id}/schedule`, label: "Schedule Versions", icon: CalendarDays },
    { href: `/dashboard/projects/${id}/activities`, label: "Activities", icon: ListTree },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card">
        <div className="px-6 flex space-x-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-2 py-4 px-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

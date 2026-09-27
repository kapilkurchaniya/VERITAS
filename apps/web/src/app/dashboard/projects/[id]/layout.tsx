import { ReactNode } from "react";
import Link from "next/link";
import { FolderGit2, CalendarDays, ListTree } from "lucide-react";

export default function ProjectDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-white/5 bg-black/40">
        <div className="px-6 flex space-x-6">
          <Link
            href={`/dashboard/projects/${params.id}`}
            className="flex items-center space-x-2 py-4 text-sm font-medium text-white/50 hover:text-white transition-colors border-b-2 border-transparent hover:border-white/50"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Overview</span>
          </Link>
          <Link
            href={`/dashboard/projects/${params.id}/schedule`}
            className="flex items-center space-x-2 py-4 text-sm font-medium text-white/50 hover:text-white transition-colors border-b-2 border-transparent hover:border-white/50"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Schedule Versions</span>
          </Link>
          <Link
            href={`/dashboard/projects/${params.id}/activities`}
            className="flex items-center space-x-2 py-4 text-sm font-medium text-white/50 hover:text-white transition-colors border-b-2 border-transparent hover:border-white/50"
          >
            <ListTree className="w-4 h-4" />
            <span>Activities</span>
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

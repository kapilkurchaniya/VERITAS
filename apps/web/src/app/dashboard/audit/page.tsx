"use client";

import { useState } from "react";
import { History, Search, Download, Filter, FileText, User, Tag } from "lucide-react";

export default function AuditPage() {
  const [search, setSearch] = useState("");

  // Placeholder data for Audit Trail
  const auditLogs = [
    {
      id: "log-1",
      action: "Project Created",
      entity: "NMP-A",
      entityType: "Project",
      user: "Rajesh Kumar (PM)",
      timestamp: "2024-10-14T09:30:00Z",
      ip: "192.168.1.105",
      status: "Success",
    },
    {
      id: "log-2",
      action: "Variance Logged",
      entity: "Steel Delay",
      entityType: "Variance",
      user: "Amit Singh (Supervisor)",
      timestamp: "2024-10-14T11:15:00Z",
      ip: "10.0.0.42",
      status: "Success",
    },
    {
      id: "log-3",
      action: "Status Updated",
      entity: "Concreting Phase 1",
      entityType: "Schedule",
      user: "Priya Sharma (Planner)",
      timestamp: "2024-10-14T14:20:00Z",
      ip: "192.168.1.201",
      status: "Success",
    },
    {
      id: "log-4",
      action: "Login Failed",
      entity: "system",
      entityType: "Auth",
      user: "Unknown",
      timestamp: "2024-10-14T16:05:00Z",
      ip: "172.16.254.1",
      status: "Failed",
    },
    {
      id: "log-5",
      action: "Role Assigned",
      entity: "Neha Verma (Auditor)",
      entityType: "User",
      user: "System Admin",
      timestamp: "2024-10-15T08:00:00Z",
      ip: "10.0.0.1",
      status: "Success",
    },
  ];

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Audit Trail</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Comprehensive system-wide logging of all actions and modifications.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, user, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Entity</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-secondary text-secondary-foreground border border-border px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {log.entityType}
                      </span>
                      <span className="text-muted-foreground text-sm truncate max-w-[150px]">
                        {log.entity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4">
                    {log.status === "Success" ? (
                      <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Success
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No audit logs found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

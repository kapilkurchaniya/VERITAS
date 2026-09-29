"use client";

import { useState } from "react";
import { Brain, Search, Database, MessageSquare, Bot, Plus, Tag, Calendar, ChevronRight } from "lucide-react";

export default function MemoryPage() {
  const [search, setSearch] = useState("");

  const memoryItems = [
    {
      id: "mem-1",
      title: "Soil Condition Report - Zone B",
      type: "Document Analysis",
      tags: ["Geotech", "Risk"],
      date: "2024-10-10",
      summary: "Detected high moisture content in Zone B soil samples. Recommended 2-week curing time before pouring foundation.",
    },
    {
      id: "mem-2",
      title: "Previous Variance: Steel Supply Delay",
      type: "Historical Context",
      tags: ["Supply Chain", "Delay"],
      date: "2024-09-15",
      summary: "Similar steel shortage occurred last quarter. Resolution involved switching to secondary supplier 'MetalWorks India' which reduced delay by 5 days.",
    },
    {
      id: "mem-3",
      title: "Safety Incident - Fall Hazard",
      type: "Incident Report",
      tags: ["Safety", "Compliance"],
      date: "2024-08-22",
      summary: "Scaffolding gap on Level 3. Resolved by installing permanent safety nets. Recommend checking all similar scaffoldings.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Project Memory
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            AI-powered knowledge base indexing past decisions, variances, and contextual project data for predictive insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Database className="w-4 h-4" />
            Data Sources
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <MessageSquare className="w-4 h-4" />
            Ask AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search past decisions, risks, or reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-full bg-card shadow-sm"
            />
          </div>

          <div className="space-y-4">
            {memoryItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md border border-border">
                      {item.type}
                    </span>
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI Insights</h3>
                <p className="text-xs text-primary">Based on recent project activity</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p>3 similar steel delays occurred in past projects. Consider pre-ordering Phase 3 steel now.</p>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                <p>Safety incident rate is trending up 15% in Zone A compared to last month.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

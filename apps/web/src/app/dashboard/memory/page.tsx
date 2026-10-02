"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Brain, Search, Database, MessageSquare, Bot, Tag, Calendar, ChevronRight, Loader2, BrainCircuit, Send, User } from "lucide-react";

interface MemoryItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  date: string;
  summary: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
}

export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState<"memory" | "ask">("memory");

  // Memory state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [insightItems, setInsightItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);

  // Ask state
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I am VERITAS. Ask me anything about project status, schedule variances, or field updates.",
    }
  ]);
  const [askLoading, setAskLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMemoryData();
    loadProjects();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, askLoading]);

  async function loadProjects() {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  const loadMemoryData = async () => {
    setLoading(true);
    try {
      const items: MemoryItem[] = [];
      const insights: string[] = [];

      const projs: any = await api("/api/v1/projects");

      for (const proj of projs) {
        try {
          const variances: any = await api(`/api/v1/governance/variances?project_id=${proj.id}`);
          for (const v of variances) {
            items.push({
              id: `var-${v.id}`,
              title: v.summary || `${v.variance_type} Variance`,
              type: "Variance Record",
              tags: [v.variance_type, v.severity].filter(Boolean),
              date: new Date(v.created_at).toISOString().split("T")[0],
              summary: `${v.severity} ${v.variance_type.toLowerCase()} variance${v.activity_name ? ` on "${v.activity_name}"` : ""}. ${v.delta_days ? `Delta: ${v.delta_days > 0 ? "+" : ""}${v.delta_days.toFixed(1)} days.` : ""}`,
            });
          }
        } catch {}

        try {
          const events: any = await api(`/api/v1/events?project_id=${proj.id}&status=APPROVED`);
          for (const evt of events.slice(0, 10)) {
            items.push({
              id: `evt-${evt.id}`,
              title: evt.raw_input?.substring(0, 80) || "Approved Field Update",
              type: "Verified Update",
              tags: [proj.name, "Approved"],
              date: new Date(evt.created_at).toISOString().split("T")[0],
              summary: evt.normalized_text || evt.raw_input || "Verified field execution event.",
            });
          }
        } catch {}

        try {
          const vSummary: any = await api(`/api/v1/governance/variances/summary?project_id=${proj.id}`);
          if (vSummary.critical > 0) {
            insights.push(`${vSummary.critical} critical variance(s) detected in ${proj.name}. Immediate attention recommended.`);
          }
          if (vSummary.avg_schedule_delta_days > 2) {
            insights.push(`${proj.name} is running ${vSummary.avg_schedule_delta_days.toFixed(1)} days behind schedule on average.`);
          }
        } catch {}
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (insights.length === 0) {
        insights.push("No critical variances detected across projects. Schedule health looks stable.");
      }

      setMemoryItems(items);
      setInsightItems(insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!query.trim() || !projectId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setAskLoading(true);

    try {
      const res: any = await api("/api/v1/ask/query", {
        method: "POST",
        body: { project_id: projectId, query: userMessage.content }
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: res.response,
          sources: res.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "I'm sorry, I encountered an error connecting to my knowledge base. Please try again later.",
        },
      ]);
    } finally {
      setAskLoading(false);
    }
  };

  const filteredItems = memoryItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.summary.toLowerCase().includes(search.toLowerCase()) ||
    item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Memory & Ask
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
            AI-powered knowledge base and RAG-powered project Q&A.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("memory")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "memory" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="w-4 h-4" />
          Project Memory
        </button>
        <button
          onClick={() => setActiveTab("ask")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "ask" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Ask VERITAS
        </button>
      </div>

      {/* ── Memory Tab ──────────────────────────────── */}
      {activeTab === "memory" && (
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

            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="border border-border bg-card rounded-xl p-12 text-center shadow-sm flex flex-col items-center">
                <Database className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">No memory items found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try adjusting your search terms." : "Memory items will populate as events are approved and variances are computed."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    className={`bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group ${
                      selectedItem?.id === item.id ? "border-primary" : "border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0 ml-4">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                    <p className={`text-sm text-muted-foreground mb-4 ${selectedItem?.id === item.id ? "" : "line-clamp-2"}`}>
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
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
                      <ChevronRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-all ${selectedItem?.id === item.id ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <ul className="space-y-3 text-sm text-foreground">
                  {insightItems.map((insight, i) => (
                    <li key={i} className="flex gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? "bg-primary" : "bg-destructive"}`} />
                      <p>{insight}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wider">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium text-foreground">{memoryItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variance Records</span>
                  <span className="font-medium text-foreground">{memoryItems.filter(i => i.type === "Variance Record").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified Updates</span>
                  <span className="font-medium text-foreground">{memoryItems.filter(i => i.type === "Verified Update").length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Ask VERITAS Tab ─────────────────────────── */}
      {activeTab === "ask" && (
        <div className="max-w-4xl mx-auto h-[calc(100vh-280px)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">RAG-powered project insights and Q&A</p>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input max-w-[200px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-4 rounded-2xl text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted text-foreground border border-border rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">Sources:</span>
                        {msg.sources.map((source, i) => (
                          <span key={i} className="text-[10px] uppercase font-bold bg-background border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {askLoading && (
                <div className="flex gap-4 flex-row">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-muted border border-border rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about project progress, delays, or specific activities..."
                  className="w-full bg-card border border-border rounded-full pl-6 pr-14 py-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  disabled={askLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!query.trim() || askLoading}
                  className="absolute right-2 p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

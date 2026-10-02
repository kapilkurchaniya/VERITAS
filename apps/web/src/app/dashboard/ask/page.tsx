"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { BrainCircuit, Send, User, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
}

export default function AskPage() {
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
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function loadProjects() {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSend = async () => {
    if (!query.trim() || !projectId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "I'm sorry, I encountered an error connecting to my knowledge base. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            Ask VERITAS
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            RAG-powered project insights and Q&A.
          </p>
        </div>
        
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
          
          {loading && (
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
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!query.trim() || loading}
              className="absolute right-2 p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

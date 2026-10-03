"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Image as ImageIcon, Send, Loader2, StopCircle, UploadCloud, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";

export default function CapturePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"IDLE" | "SUBMITTING" | "SUCCESS">("IDLE");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the server. Please ensure the backend is running.");
    }
  };

  let timerInterval: any;
  useEffect(() => {
    if (isRecording) {
      timerInterval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setEvidenceFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    if (!textInput && !audioBlob) return; // At least text or audio
    
    setSubmitting(true);
    setSubmissionStatus("SUBMITTING");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      
      if (audioBlob) {
        formData.append("source_type", "AUDIO");
        formData.append("file", audioBlob, "recording.webm");
      } else {
        formData.append("source_type", "TEXT");
        formData.append("raw_input", textInput);
      }

      const token = localStorage.getItem("nexus_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Submit event
      const res = await fetch(`${API_BASE}/api/v1/field-updates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit event");
      const event = await res.json();

      // Submit evidence files
      for (const file of evidenceFiles) {
        const fileForm = new FormData();
        fileForm.append("project_id", projectId);
        fileForm.append("event_id", event.id);
        fileForm.append("file", file);
        
        await fetch(`${API_BASE}/api/v1/field-updates/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fileForm,
        });
      }

      // Trigger AI Pipeline
      await fetch(`${API_BASE}/api/v1/field-updates/${event.id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmissionStatus("SUCCESS");
      
      setTimeout(() => {
        setTextInput("");
        setAudioBlob(null);
        setEvidenceFiles([]);
        setSubmissionStatus("IDLE");
      }, 3000);

    } catch (err) {
      console.error(err);
      setError("Submission failed. The AI pipeline or backend might be unreachable.");
      setSubmissionStatus("IDLE");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && projects.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-10 h-10 mb-3 opacity-80" />
          <h2 className="text-lg font-semibold">Connection Error</h2>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={loadProjects} className="btn btn-outline mt-4">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Tell us what happened.</h2>
        <p className="text-sm text-muted-foreground mt-2">Update the field progress, report issues, or upload evidence.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-center gap-3 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        <div className="p-8 space-y-6 flex-1">
          
          {/* Project Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Project</label>
            <select 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              className="input cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          {/* Text/Audio Input */}
          <div className="relative">
            {isRecording ? (
              <div className="h-36 bg-destructive/10 border border-destructive/30 rounded-lg flex flex-col items-center justify-center animate-pulse shadow-inner">
                <div className="flex items-center space-x-3 text-destructive">
                  <Mic className="w-8 h-8 animate-bounce" />
                  <span className="text-2xl font-mono tracking-wider font-semibold">{formatTime(recordingTime)}</span>
                </div>
                <button 
                  onClick={stopRecording}
                  className="mt-4 flex items-center space-x-2 text-destructive/80 hover:text-destructive font-medium transition-colors bg-white/50 px-4 py-1.5 rounded-full"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : audioBlob ? (
              <div className="h-36 bg-muted/50 border border-border rounded-lg flex flex-col items-center justify-center relative">
                <button 
                  onClick={() => setAudioBlob(null)}
                  className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <audio src={URL.createObjectURL(audioBlob)} controls className="mt-2 w-3/4 max-w-sm" />
                <span className="text-sm font-medium text-muted-foreground mt-4">Audio ready for processing</span>
              </div>
            ) : (
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Describe the update (e.g. 'Line 24 pipe spool erection completed around 3 PM')"
                className="input h-36 resize-none p-4 text-base"
              />
            )}

            {!isRecording && !audioBlob && (
              <button 
                onClick={startRecording}
                className="absolute bottom-4 right-4 p-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary border border-border rounded-full transition-all flex items-center group shadow-sm"
                title="Hold to Record"
              >
                <Mic className="w-5 h-5 group-hover:text-destructive transition-colors" />
              </button>
            )}
          </div>

          {/* Evidence Upload */}
          <div>
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors relative"
            >
              <input 
                type="file" 
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Drag & drop evidence</p>
              <p className="text-xs text-muted-foreground mt-1">Photos or documents, or click to browse</p>
            </div>

            {/* Evidence Preview List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {evidenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-muted border border-border rounded-md group shadow-sm">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive shrink-0 transition-colors opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="bg-muted/30 border-t border-border p-5 px-8 flex items-center justify-between">
          <div className="flex-1">
            {submissionStatus === "SUBMITTING" && (
              <div className="flex items-center space-x-3 text-sm font-medium text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Input received. Pipeline is extracting entities...</span>
              </div>
            )}
            {submissionStatus === "SUCCESS" && (
              <div className="flex items-center space-x-3 text-sm font-medium text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span>Event submitted successfully! Added to governance queue.</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || (!textInput && !audioBlob)}
            className="btn btn-primary shadow-sm gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Update
          </button>
        </div>
      </div>
    </div>
  );
}

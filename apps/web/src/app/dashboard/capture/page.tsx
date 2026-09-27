"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Image as ImageIcon, Send, Loader2, StopCircle, UploadCloud, X, CheckCircle2 } from "lucide-react";
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

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projs: any = await api("/api/v1/projects");
      setProjects(projs);
      if (projs.length > 0) setProjectId(projs[0].id);
    } catch (err) {
      console.error(err);
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

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      
      if (audioBlob) {
        formData.append("source_type", "AUDIO");
        formData.append("file", audioBlob, "recording.webm");
        // We'll upload audio to capture/upload later or modify our endpoint.
        // For Phase 3, we submit text first as primary.
      } else {
        formData.append("source_type", "TEXT");
        formData.append("raw_input", textInput);
      }

      const token = localStorage.getItem("nexus_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Submit event
      const res = await fetch(`${API_BASE}/api/v1/capture`, {
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
        
        await fetch(`${API_BASE}/api/v1/capture/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fileForm,
        });
      }

      setSubmissionStatus("SUCCESS");
      
      // Reset form after delay
      setTimeout(() => {
        setTextInput("");
        setAudioBlob(null);
        setEvidenceFiles([]);
        setSubmissionStatus("IDLE");
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Submission failed");
      setSubmissionStatus("IDLE");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-light tracking-tight">Tell us what happened.</h2>
        <p className="text-white/50 mt-2">Update the field progress, report issues, or upload evidence.</p>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 space-y-6">
          
          {/* Project Selector */}
          <div>
            <label className="text-sm font-medium text-white/70 mb-1 block">Project</label>
            <select 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/30"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          {/* Text/Audio Input */}
          <div className="relative">
            {isRecording ? (
              <div className="h-32 bg-red-500/10 border border-red-500/30 rounded-lg flex flex-col items-center justify-center animate-pulse">
                <div className="flex items-center space-x-3 text-red-400">
                  <Mic className="w-6 h-6 animate-bounce" />
                  <span className="text-xl font-mono">{formatTime(recordingTime)}</span>
                </div>
                <button 
                  onClick={stopRecording}
                  className="mt-4 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : audioBlob ? (
              <div className="h-32 bg-white/5 border border-white/10 rounded-lg flex flex-col items-center justify-center relative">
                <button 
                  onClick={() => setAudioBlob(null)}
                  className="absolute top-2 right-2 p-1 text-white/50 hover:text-white rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
                <audio src={URL.createObjectURL(audioBlob)} controls className="mt-2" />
                <span className="text-sm text-white/50 mt-2">Audio ready for processing</span>
              </div>
            ) : (
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Describe the update (e.g. 'Line 24 pipe spool erection completed around 3 PM')"
                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
              />
            )}

            {!isRecording && !audioBlob && (
              <button 
                onClick={startRecording}
                className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black text-white/50 hover:text-white border border-white/10 rounded-full transition-all flex items-center group"
                title="Hold to Record"
              >
                <Mic className="w-5 h-5 group-hover:text-red-400 transition-colors" />
              </button>
            )}
          </div>

          {/* Evidence Upload */}
          <div>
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/[0.02] transition-colors relative"
            >
              <input 
                type="file" 
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-6 h-6 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/60">Drag & drop evidence (photos, docs) or click to browse</p>
            </div>

            {/* Evidence Preview List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {evidenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-md">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <ImageIcon className="w-4 h-4 text-white/50 shrink-0" />
                      <span className="text-xs text-white/80 truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-white/40 hover:text-white shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Footer Actions */}
        <div className="bg-white/5 border-t border-white/10 p-4 flex items-center justify-between">
          <div className="flex-1">
            {submissionStatus === "SUBMITTING" && (
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span>Input received. Processing...</span>
              </div>
            )}
            {submissionStatus === "SUCCESS" && (
              <div className="flex items-center space-x-3 text-sm text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Event submitted successfully!</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || (!textInput && !audioBlob)}
            className="flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded-md font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Submit Update</span>
          </button>
        </div>
      </div>
    </div>
  );
}

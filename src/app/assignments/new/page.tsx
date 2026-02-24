"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  FileText,
  Image,
  FileUp,
  Globe,
  Type,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AI_TUTORS } from "@/lib/ai-tutors";

type UploadType = "document" | "screenshot" | "pdf" | "weblink" | "text";

const uploadTypes: { type: UploadType; label: string; desc: string; icon: React.ElementType }[] = [
  { type: "document", label: "Document", desc: "Word, Pages", icon: FileText },
  { type: "screenshot", label: "Screenshot", desc: "Capture Image", icon: Image },
  { type: "pdf", label: "PDF File", desc: "Textbook Scan", icon: FileUp },
  { type: "weblink", label: "Web Link", desc: "Paste URL", icon: Globe },
  { type: "text", label: "Text", desc: "Type Content", icon: Type },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"upload" | "tutor">("upload");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept:
      uploadType === "document"
        ? { "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] }
        : uploadType === "screenshot"
        ? { "image/*": [] }
        : uploadType === "pdf"
        ? { "application/pdf": [] }
        : {},
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!uploadType) {
      toast.error("Please select an upload type");
      return;
    }

    setUploading(true);

    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;

      if (file && (uploadType === "document" || uploadType === "screenshot" || uploadType === "pdf")) {
        const fileExt = file.name.split(".").pop();
        const filePath = `uploads/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("assignments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("assignments")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          upload_type: uploadType,
          file_url: fileUrl,
          file_name: fileName,
          text_content: uploadType === "text" ? textContent : null,
          web_url: uploadType === "weblink" ? webUrl : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create assignment");

      const assignment = await res.json();
      toast.success("Assignment created!");

      if (selectedTutor) {
        router.push(`/assignments/${assignment.id}/collaborate?tutor=${selectedTutor}`);
      } else {
        router.push(`/assignments/${assignment.id}/collaborate`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload assignment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell role="student" title="">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/student">
            <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-white">New Assignment</h1>
        </div>

        {step === "upload" ? (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus II: Integration"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the assignment..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Upload Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload Assignment
              </label>
              <p className="text-xs text-slate-400 mb-4">
                Add your study material to get started
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadTypes.map(({ type, label, desc, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setUploadType(type);
                      setFile(null);
                      setTextContent("");
                      setWebUrl("");
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      uploadType === type
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        uploadType === type ? "text-indigo-400" : "text-slate-400"
                      }`}
                    />
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* File upload area */}
            {uploadType && uploadType !== "text" && uploadType !== "weblink" && (
              <div>
                {file ? (
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </Card>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-300 mb-1">
                      {isDragActive ? "Drop file here..." : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {uploadType === "document" && "Word (.doc, .docx)"}
                      {uploadType === "screenshot" && "Image files (.png, .jpg, .gif)"}
                      {uploadType === "pdf" && "PDF files (.pdf)"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Text input */}
            {uploadType === "text" && (
              <div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste or type your assignment content here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                />
              </div>
            )}

            {/* Web URL input */}
            {uploadType === "weblink" && (
              <div>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://example.com/assignment"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep("tutor")}
              disabled={
                !title.trim() ||
                !uploadType ||
                (uploadType === "text" && !textContent.trim()) ||
                (uploadType === "weblink" && !webUrl.trim()) ||
                (["document", "screenshot", "pdf"].includes(uploadType || "") && !file)
              }
            >
              Continue — Select AI Tutor
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tutor Selection */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Select your AI Tutor</h2>
              <p className="text-sm text-slate-400 mb-6">
                Our tutors guide you to the answer, they don&apos;t just give it away.
              </p>

              <div className="space-y-4">
                {AI_TUTORS.map((tutor) => (
                  <button
                    key={tutor.id}
                    onClick={() => setSelectedTutor(tutor.id)}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                      selectedTutor === tutor.id
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: tutor.avatar_color + "30", color: tutor.avatar_color }}
                      >
                        {tutor.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white">{tutor.name}</h3>
                          <Badge
                            variant={
                              tutor.style === "socratic"
                                ? "purple"
                                : tutor.style === "structured"
                                ? "info"
                                : "success"
                            }
                            size="sm"
                          >
                            {tutor.style}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{tutor.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                loading={uploading}
                disabled={!selectedTutor}
              >
                Start Learning Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

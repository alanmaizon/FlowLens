import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileUp, MessageSquareText, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  getProject,
  generateAnalysis,
  getReport,
  listChatMessages,
  sendChatMessage,
  uploadDocument,
} from "@/features/projects/projects-api";
import { ReportDashboard } from "@/features/projects/report-dashboard";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId ?? ""),
    enabled: Boolean(projectId),
  });
  const reportQuery = useQuery({
    queryKey: ["report", projectId],
    queryFn: () => getReport(projectId ?? ""),
    enabled: Boolean(projectId),
  });
  const chatQuery = useQuery({
    queryKey: ["chat", projectId],
    queryFn: () => listChatMessages(projectId ?? ""),
    enabled: Boolean(projectId),
  });
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(projectId ?? "", file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (requestError) =>
      setError(getApiErrorMessage(requestError, "Could not upload document.")),
  });
  const analysisMutation = useMutation({
    mutationFn: () => generateAnalysis(projectId ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["report", projectId] });
    },
    onError: (requestError) =>
      setError(getApiErrorMessage(requestError, "Could not generate analysis.")),
  });
  const chatMutation = useMutation({
    mutationFn: () => sendChatMessage(projectId ?? "", message),
    onSuccess: async () => {
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["chat", projectId] });
    },
    onError: (requestError) =>
      setError(getApiErrorMessage(requestError, "Could not send chat message.")),
  });

  if (projectQuery.isLoading)
    return <p className="text-sm text-muted-foreground">Loading project…</p>;
  if (projectQuery.isError || !projectQuery.data)
    return <p className="text-sm text-red-700">This project could not be loaded.</p>;

  const project = projectQuery.data;
  const canAnalyse = project.documents.some((document) => document.status === "ready");

  function chooseFile() {
    fileInput.current?.click();
  }
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      setError(null);
      uploadMutation.mutate(file);
    }
    event.target.value = "";
  }
  function submitChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim()) {
      setError(null);
      chatMutation.mutate();
    }
  }

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Project workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="max-w-2xl text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button
          onClick={() => analysisMutation.mutate()}
          disabled={!canAnalyse || analysisMutation.isPending}
        >
          <Sparkles className="size-4" />
          {analysisMutation.isPending ? "Analysing…" : "Generate analysis"}
        </Button>
      </section>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Source documents</CardTitle>
            <CardDescription>
              Upload TXT, Markdown, CSV, PDF, or DOCX process material. Files are stored privately
              in this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInput}
              className="hidden"
              type="file"
              accept=".txt,.md,.csv,.pdf,.docx"
              onChange={selectFile}
            />
            <Button variant="outline" onClick={chooseFile} disabled={uploadMutation.isPending}>
              <FileUp className="size-4" />
              {uploadMutation.isPending ? "Uploading…" : "Upload document"}
            </Button>
            <div className="mt-5 divide-y divide-border">
              {project.documents.length ? (
                project.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate font-medium">{document.filename}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatSize(document.size_bytes)} · {document.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  No evidence yet. Upload a document to begin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-primary" />
              <CardTitle>Ask about this project</CardTitle>
            </div>
            <CardDescription>
              Chat uses the project sources, report, and recent project conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {chatQuery.data?.length ? (
                chatQuery.data.map((chat) => (
                  <div
                    key={chat.id}
                    className={
                      chat.role === "assistant"
                        ? "rounded-lg bg-muted p-3 text-sm"
                        : "ml-6 rounded-lg bg-primary p-3 text-sm text-primary-foreground"
                    }
                  >
                    {chat.content}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ask a question once you have source material.
                </p>
              )}
            </div>
            <form className="flex gap-2" onSubmit={submitChat}>
              <Textarea
                className="min-h-10 resize-none"
                placeholder="Ask about risks, opportunities, or next steps…"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button
                size="sm"
                type="submit"
                disabled={chatMutation.isPending || !message.trim()}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Analysis report</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A structured decision view generated from the uploaded project evidence.
          </p>
        </div>
        {reportQuery.isLoading && <p className="text-sm text-muted-foreground">Loading report…</p>}
        {reportQuery.data?.report ? (
          <ReportDashboard report={reportQuery.data.report} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-7 text-sm text-muted-foreground">
              {canAnalyse
                ? "Generate an analysis to create the executive summary, process map, risks, opportunities, user stories, and roadmap."
                : "Upload at least one readable document before generating the report."}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

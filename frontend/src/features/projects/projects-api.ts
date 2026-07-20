import { apiClient } from "@/lib/api-client";
import type { AnalysisRun, ChatMessage, Document, Project, ProjectDetail } from "@/lib/types";

export async function listProjects() {
  const { data } = await apiClient.get<Project[]>("/projects");
  return data;
}

export async function createProject(payload: { name: string; description?: string }) {
  const { data } = await apiClient.post<Project>("/projects", payload);
  return data;
}

export async function getProject(projectId: string) {
  const { data } = await apiClient.get<ProjectDetail>(`/projects/${projectId}`);
  return data;
}

export async function uploadDocument(projectId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<Document>(`/projects/${projectId}/documents`, formData);
  return data;
}

export async function generateAnalysis(projectId: string) {
  const { data } = await apiClient.post<AnalysisRun>(`/projects/${projectId}/analysis`, undefined, {
    timeout: 300_000,
  });
  return data;
}

export async function getReport(projectId: string) {
  const { data } = await apiClient.get<AnalysisRun | null>(`/projects/${projectId}/report`);
  return data;
}

export async function listChatMessages(projectId: string) {
  const { data } = await apiClient.get<ChatMessage[]>(`/projects/${projectId}/chat`);
  return data;
}

export async function sendChatMessage(projectId: string, message: string) {
  const { data } = await apiClient.post<ChatMessage[]>(
    `/projects/${projectId}/chat`,
    { message },
    { timeout: 90_000 },
  );
  return data;
}

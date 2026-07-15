export type User = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export type AuthSession = {
  accessToken: string;
  user: User;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type Document = {
  id: string;
  project_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: "uploaded" | "processing" | "ready" | "failed";
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
};

export type ProjectDetail = Project & {
  documents: Document[];
};

export type ProcessStep = {
  name: string;
  description: string;
  primary_actor: string;
  systems: string[];
};

export type Opportunity = {
  title: string;
  category: "ai" | "automation";
  description: string;
  expected_impact: string;
  priority: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  user_stories: { title: string; story: string; acceptance_criteria: string[] }[];
};

export type ProjectReport = {
  executive_summary: { headline: string; summary: string; key_findings: string[] };
  process_analysis: {
    process_name: string;
    overview: string;
    process_steps: ProcessStep[];
    actors: { name: string; responsibilities: string[] }[];
    systems: { name: string; role: string }[];
    pain_points: { title: string; description: string; impact: "low" | "medium" | "high" }[];
    risks: { title: string; description: string; severity: "low" | "medium" | "high" }[];
  };
  opportunity_analysis: {
    opportunities: Opportunity[];
    prioritized_recommendations: string[];
  };
  roadmap: {
    phases: { name: string; timeframe: string; objectives: string[]; recommendations: string[] }[];
  };
};

export type AnalysisRun = {
  id: string;
  project_id: string;
  status: "processing" | "completed" | "failed";
  model_name: string;
  report: ProjectReport | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

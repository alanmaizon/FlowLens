import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileText, FolderKanban, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-client";
import { createProject, listProjects } from "@/features/projects/projects-api";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isCreating = searchParams.get("new") === "1";
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate(`/projects/${project.id}`);
    },
    onError: (requestError) =>
      setError(getApiErrorMessage(requestError, "Could not create project.")),
  });

  function showCreateForm() {
    setSearchParams({ new: "1" });
  }

  function closeCreateForm() {
    setSearchParams({});
    setError(null);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    createMutation.mutate({ name, description: description || undefined });
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-primary">Your workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Process change, in focus.
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Create a project, add process evidence, and turn it into a decision-ready transformation
            report.
          </p>
        </div>
        <Button onClick={showCreateForm}>
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Button>
      </section>

      {isCreating && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Create a project</CardTitle>
            <CardDescription>
              Use one workspace for a bounded process transformation engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
              onSubmit={submit}
            >
              <label className="space-y-1.5 text-sm font-medium">
                Project name
                <Input
                  required
                  maxLength={160}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Context <span className="font-normal text-muted-foreground">(optional)</span>
                <Input
                  maxLength={10000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={closeCreateForm}>
                  Cancel
                </Button>
              </div>
            </form>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4" aria-label="Projects">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-medium">Projects</h2>
        </div>
        {projectsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        )}
        {projectsQuery.isError && (
          <p className="text-sm text-red-700">Unable to load projects. Refresh and try again.</p>
        )}
        {projectsQuery.data?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col gap-3 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">Start with a process.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add source material and FlowLens will build a structured transformation view.
                </p>
              </div>
              <Button variant="outline" onClick={showCreateForm}>
                Create project
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectsQuery.data?.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.description ?? "No project context added yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    {project.document_count} documents
                  </span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

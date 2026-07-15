import { AlertTriangle, Bot, CheckCircle2, GitBranch, Lightbulb, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectReport } from "@/lib/types";

type ReportDashboardProps = {
  report: ProjectReport;
};

const priorityStyles = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-slate-100 text-slate-700",
};

export function ReportDashboard({ report }: ReportDashboardProps) {
  const {
    executive_summary: summary,
    process_analysis: process,
    opportunity_analysis: opportunities,
    roadmap,
  } = report;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.03]">
        <CardHeader>
          <p className="text-sm font-medium text-primary">Executive summary</p>
          <CardTitle className="text-xl">{summary.headline}</CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-6">
            {summary.summary}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            {summary.key_findings.map((finding) => (
              <li key={finding} className="rounded-md bg-background/70 p-3 text-muted-foreground">
                {finding}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <CardTitle>Process map</CardTitle>
            </div>
            <CardDescription>{process.overview}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {process.process_steps.map((step, index) => (
                <li
                  key={`${step.name}-${index}`}
                  className="relative flex gap-3 rounded-lg border border-border p-3"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{step.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Owner: {step.primary_actor}
                      {step.systems.length ? ` · ${step.systems.join(", ")}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <CardTitle>Actors & systems</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actors
                </p>
                <ul className="space-y-2 text-sm">
                  {process.actors.map((actor) => (
                    <li key={actor.name}>
                      <span className="font-medium">{actor.name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {actor.responsibilities.join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Systems
                </p>
                <ul className="space-y-2 text-sm">
                  {process.systems.map((system) => (
                    <li key={system.name}>
                      <span className="font-medium">{system.name}</span>
                      <span className="text-muted-foreground"> · {system.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                <CardTitle>Pain points & risks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[...process.pain_points, ...process.risks].map((item) => (
                <div key={item.title} className="rounded-md bg-muted/60 p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <CardTitle>Transformation opportunities</CardTitle>
          </div>
          <CardDescription>
            Prioritised AI and automation opportunities grounded in the source evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {opportunities.opportunities.map((opportunity) => (
            <article key={opportunity.title} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {opportunity.category}
                  </p>
                  <h3 className="mt-1 font-medium">{opportunity.title}</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[opportunity.priority]}`}
                >
                  {opportunity.priority} priority
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {opportunity.description}
              </p>
              <p className="mt-3 text-sm">
                <span className="font-medium">Expected impact:</span>{" "}
                <span className="text-muted-foreground">{opportunity.expected_impact}</span>
              </p>
              <p className="mt-1 text-sm">
                <span className="font-medium">Effort:</span>{" "}
                <span className="text-muted-foreground">{opportunity.effort}</span>
              </p>
              {opportunity.user_stories.map((story) => (
                <div key={story.title} className="mt-4 rounded-md bg-muted/60 p-3 text-sm">
                  <p className="font-medium">{story.title}</p>
                  <p className="mt-1 text-muted-foreground">{story.story}</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {story.acceptance_criteria.map((criterion) => (
                      <li key={criterion} className="flex gap-1.5">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" />
            <CardTitle>Implementation roadmap</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {roadmap.phases.map((phase) => (
            <article key={phase.name} className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {phase.timeframe}
              </p>
              <h3 className="mt-1 font-medium">{phase.name}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {phase.objectives.map((objective) => (
                  <li key={objective}>• {objective}</li>
                ))}
              </ul>
            </article>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

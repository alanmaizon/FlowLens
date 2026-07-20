import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AnalysisProgressProps = {
  documentCount: number;
  startedAt: number;
};

const analysisStages = [
  {
    afterMilliseconds: 0,
    title: "Preparing source evidence",
    detail: "Normalising uploaded process material",
  },
  {
    afterMilliseconds: 12_000,
    title: "Mapping the current process",
    detail: "Identifying steps, actors, systems, and risks",
  },
  {
    afterMilliseconds: 30_000,
    title: "Writing the executive summary",
    detail: "Distilling the decision-ready narrative",
  },
  {
    afterMilliseconds: 50_000,
    title: "Prioritising transformation opportunities",
    detail: "Assessing AI and automation opportunities",
  },
  {
    afterMilliseconds: 75_000,
    title: "Sequencing the roadmap",
    detail: "Turning recommendations into practical phases",
  },
  {
    afterMilliseconds: 100_000,
    title: "Finalising the report",
    detail: "Validating the complete transformation view",
  },
];

export function AnalysisProgress({ documentCount, startedAt }: AnalysisProgressProps) {
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedMilliseconds(Date.now() - startedAt);
    }, 1_000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const activeStageIndex = useMemo(
    () =>
      analysisStages.reduce(
        (currentIndex, stage, index) =>
          elapsedMilliseconds >= stage.afterMilliseconds ? index : currentIndex,
        0,
      ),
    [elapsedMilliseconds],
  );

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/[0.06] via-card to-card">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
          <p className="text-sm font-medium">Analysis in progress</p>
        </div>
        <CardTitle className="text-xl">FlowLens is building your transformation view.</CardTitle>
        <CardDescription>
          {documentCount} source {documentCount === 1 ? "document is" : "documents are"} being
          connected into one decision-ready report. You can keep this page open while each stage
          completes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4" aria-live="polite">
          {analysisStages.map((stage, index) => {
            const isComplete = index < activeStageIndex;
            const isActive = index === activeStageIndex;
            return (
              <li key={stage.title} className="flex gap-3">
                <span
                  className={
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full " +
                    (isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {isComplete ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : isActive ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </span>
                <div>
                  <p
                    className={
                      isActive ? "text-sm font-medium text-foreground" : "text-sm font-medium"
                    }
                  >
                    {stage.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{stage.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

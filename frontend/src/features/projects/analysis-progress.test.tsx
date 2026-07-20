import { render, screen } from "@testing-library/react";

import { AnalysisProgress } from "@/features/projects/analysis-progress";

describe("AnalysisProgress", () => {
  it("shows the first analysis stage while a report is starting", () => {
    render(<AnalysisProgress documentCount={4} startedAt={Date.now()} />);

    expect(screen.getByText("Analysis in progress")).toBeInTheDocument();
    expect(screen.getByText("Preparing source evidence")).toBeInTheDocument();
    expect(screen.getByText(/4 source documents are being connected/)).toBeInTheDocument();
  });
});

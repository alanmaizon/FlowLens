import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { DashboardPage } from "@/features/dashboard/dashboard-page";

vi.mock("@/features/projects/projects-api", () => ({
  createProject: vi.fn(),
  listProjects: vi.fn().mockResolvedValue([]),
}));

describe("DashboardPage", () => {
  it("gives a new user a clear project starting point", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Process change, in focus." })).toBeInTheDocument();
    expect(await screen.findByText("Start with a process.")).toBeInTheDocument();
  });
});

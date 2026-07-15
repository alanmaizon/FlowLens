import { Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { AuthPage } from "@/features/auth/auth-page";
import { useAuthentication } from "@/features/auth/auth-context";
import { ProjectPage } from "@/features/projects/project-page";
import { NotFoundPage } from "@/features/system/not-found-page";

export function AppRouter() {
  const { session } = useAuthentication();

  if (!session) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

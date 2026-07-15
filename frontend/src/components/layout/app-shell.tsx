import { LayoutDashboard, LogOut, PanelLeftClose, Plus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthentication } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

const navigation = [{ label: "Overview", to: "/", icon: LayoutDashboard }];

export function AppShell() {
  const { logout, session } = useAuthentication();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            F
          </div>
          <span className="font-semibold tracking-tight">FlowLens</span>
        </div>
        <nav className="space-y-1 p-3" aria-label="Main navigation">
          {navigation.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
          <p className="truncate px-3 text-xs text-muted-foreground">{session?.user.email}</p>
          <button
            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            type="button"
            onClick={logout}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <PanelLeftClose className="size-4 text-muted-foreground lg:hidden" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Process transformation workspace</span>
          </div>
          <Button size="sm" asChild>
            <NavLink to="/?new=1">
              <Plus className="size-4" aria-hidden="true" />
              New project
            </NavLink>
          </Button>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

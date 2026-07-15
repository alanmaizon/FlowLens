import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-3xl font-semibold">This page does not exist.</h1>
        <Button asChild>
          <Link to="/">Return to FlowLens</Link>
        </Button>
      </div>
    </main>
  );
}

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-client";
import { useAuthentication } from "@/features/auth/auth-context";

export function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authenticate } = useAuthentication();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authenticate(
        email,
        password,
        isRegistering ? "register" : "login",
        displayName || undefined,
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "We could not sign you in. Check that the API is running and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <section className="w-full max-w-sm space-y-7 rounded-2xl border border-border bg-card p-7 shadow-sm">
        <div className="space-y-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            F
          </div>
          <h1 className="pt-3 text-2xl font-semibold tracking-tight">
            {isRegistering ? "Create your workspace" : "Welcome to FlowLens"}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {isRegistering
              ? "Start turning process evidence into transformation decisions."
              : "Sign in to continue to your process transformation workspace."}
          </p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          {isRegistering && (
            <label className="block space-y-1.5 text-sm font-medium">
              Name
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </label>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            Email
            <Input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            Password
            <Input
              required
              type="password"
              minLength={isRegistering ? 12 : 1}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {isRegistering && (
              <span className="text-xs font-normal text-muted-foreground">12+ characters</span>
            )}
          </label>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isRegistering ? "Already have an account?" : "New to FlowLens?"}{" "}
          <button
            className="font-medium text-primary hover:underline"
            type="button"
            onClick={() => {
              setIsRegistering((value) => !value);
              setError(null);
            }}
          >
            {isRegistering ? "Sign in" : "Create one"}
          </button>
        </p>
      </section>
    </main>
  );
}

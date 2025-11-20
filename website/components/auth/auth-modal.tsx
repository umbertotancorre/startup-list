"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSupabase } from "@/components/providers/supabase-provider";

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { client } = useSupabase();

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback`;
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    // The user is redirected away; keep modal disabled until redirect happens.
  }, [client, redirectTo]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="px-5" data-modal-trigger="authModal">
          Auth
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        data-modal="authModal"
        aria-label="Authentication modal"
      >
        <DialogHeader>
          <DialogTitle>Sign in to Startup List</DialogTitle>
          <DialogDescription>
            Continue with your Google account to access saved startups and more.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            {isLoading ? "Redirecting…" : "Continue with Google"}
          </Button>

          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}


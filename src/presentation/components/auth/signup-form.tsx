"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { formatAuthErrorMessage } from "@/presentation/lib/auth-error-message";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOTIVATION_MAX = 120;

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [motivationPhrase, setMotivationPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const nameOk = displayName.trim().length >= 1;
  const motivationOk = motivationPhrase.trim().length >= 1;
  const passwordOk = password.length >= 6;
  const canSubmit =
    nameOk && emailValid && passwordOk && motivationOk && !loading;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    triggerInteractionFeedback({ haptic: false });

    const supabase = createBrowserSupabaseClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          display_name: displayName.trim(),
          motivation_phrase: motivationPhrase.trim().slice(0, MOTIVATION_MAX),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(formatAuthErrorMessage(signUpError.message));
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setInfo(
      "Check your inbox to confirm your email. After confirming, you can sign in.",
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p
          className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {info}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="signup-name">Display name</Label>
        <Input
          id="signup-name"
          name="displayName"
          autoComplete="name"
          value={displayName}
          onChange={(ev) => setDisplayName(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder="How we greet you"
          aria-invalid={displayName.length > 0 && !nameOk}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder="you@example.com"
          aria-invalid={email.length > 0 && !emailValid}
        />
        {email.length > 0 && !emailValid ? (
          <p className="text-xs text-destructive">Enter a valid email address.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder="At least 6 characters"
          aria-invalid={password.length > 0 && !passwordOk}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-reason">Your reason</Label>
        <p className="text-xs text-muted-foreground">What keeps you going?</p>
        <Input
          id="signup-reason"
          name="motivationPhrase"
          autoComplete="off"
          value={motivationPhrase}
          onChange={(ev) =>
            setMotivationPhrase(ev.target.value.slice(0, MOTIVATION_MAX))
          }
          disabled={loading}
          className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          placeholder="For my future"
          aria-invalid={motivationPhrase.length > 0 && !motivationOk}
        />
        <p className="text-xs text-muted-foreground">
          {motivationPhrase.length}/{MOTIVATION_MAX}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="min-h-11 min-w-0 w-full"
        loading={loading}
        loadingText="Creating account..."
        disabled={!canSubmit}
      >
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

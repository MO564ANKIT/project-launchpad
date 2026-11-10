import { useState, type FormEvent } from "react";
import { Flame, KeyRound, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/kit/Button";
import { useServerFn } from "@tanstack/react-start";
import { enterJudgeMode } from "@/lib/judge.functions";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { MONSTER_IMAGE_SOURCES } from "@/lib/monsterAssets";
import { useAuth } from "@/state/authContext";

type Mode = "signIn" | "signUp" | "reset";

const MODES: { id: Exclude<Mode, "reset">; label: string }[] = [
  { id: "signIn", label: "Sign in" },
  { id: "signUp", label: "Create account" },
];

export function AuthScreen() {
  const judgeFn = useServerFn(enterJudgeMode);
  const { signIn, signUp, sendPasswordSetup } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || (mode !== "reset" && !password)) {
      setError(mode === "reset" ? "Enter your email." : "Enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);
    const result =
      mode === "signIn"
        ? await signIn(trimmedEmail, password)
        : mode === "signUp"
          ? await signUp(trimmedEmail, password)
          : await sendPasswordSetup(trimmedEmail);
    if (result.error) setError(result.error);
    if (result.notice) setNotice(result.notice);
    setSubmitting(false);
  };

  const submitLabel =
    mode === "signIn" ? "Sign in" : mode === "signUp" ? "Create account" : "Email me a link";
  const SubmitIcon = mode === "signIn" ? LogIn : mode === "signUp" ? UserPlus : KeyRound;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 text-ink-100">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative flex h-32 w-full items-end justify-center" aria-hidden="true">
            <span className="absolute bottom-2 h-10 w-56 rounded-full bg-volt-500/40 blur-2xl" />
            <img
              src={MONSTER_IMAGE_SOURCES.coffeeling[0]}
              alt=""
              className="relative h-20 w-20 -rotate-6 object-contain opacity-80 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            />
            <img
              src={MONSTER_IMAGE_SOURCES.saverion[0]}
              alt=""
              className="relative z-10 -mx-3 h-32 w-32 animate-float object-contain drop-shadow-[0_0_24px_rgba(184,255,77,0.35)] motion-reduce:animate-none"
            />
            <img
              src={MONSTER_IMAGE_SOURCES.impulso[0]}
              alt=""
              className="relative h-20 w-20 rotate-6 object-contain opacity-80 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
            />
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-400">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Budget RPG
            </p>
            <p className="title-gradient mt-2 font-display text-5xl font-bold uppercase leading-none tracking-[0.08em] drop-shadow-[0_0_30px_rgba(139,92,246,0.45)]">
              Spendemon
            </p>
            <p className="mt-3 text-sm text-ink-300">
              Sign in to keep your monsters, quests, and budget safe on every device.
            </p>
          </div>
        </div>

        <Button
          variant="volt"
          className="w-full"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError(null);
            try {
              const session = await judgeFn();
              const signed = await supabase.auth.setSession(session);
              if (signed.error) throw signed.error;
              window.location.assign("/");
            } catch {
              setError("Judge mode could not start. Please try again.");
              setSubmitting(false);
            }
          }}
        >
          Press start · Try as a judge
        </Button>
        <p className="text-center text-xs text-amber-300">
          Isolated demo account · simulated payments · no real money
        </p>
        <section className="card space-y-6 p-6 sm:p-8">
          {mode === "reset" ? (
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-ink-50">Set a new password</h1>
              <p className="text-sm text-ink-300">
                Forgot your password, or played Spendemon before it moved? Enter your email and we
                will send a link to confirm it and choose a new password. Your monsters and progress
                stay with your account.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-2 rounded-xl bg-night-950/70 p-1"
              role="tablist"
              aria-label="Account"
            >
              {MODES.map((option) => {
                const active = option.id === mode;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchMode(option.id)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-semibold transition duration-200",
                      active ? "bg-volt-500/20 text-ink-50" : "text-ink-300 hover:text-ink-100",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="auth-email" className="text-sm font-medium text-ink-200">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input w-full"
                disabled={submitting}
              />
            </div>
            {mode !== "reset" && (
              <div className="space-y-2">
                <label htmlFor="auth-password" className="text-sm font-medium text-ink-200">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input w-full"
                  disabled={submitting}
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>
            )}

            {error && (
              <p id="auth-error" role="alert" className="text-sm text-rose-300">
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-xl border border-neon-400/30 bg-neon-500/10 px-4 py-3 text-sm text-neon-300"
              >
                {notice}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              <SubmitIcon className="h-4 w-4" />
              {submitting ? "Please wait..." : submitLabel}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === "reset" ? (
              <button
                type="button"
                onClick={() => switchMode("signIn")}
                className="font-medium text-neon-300 hover:text-neon-400"
              >
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="font-medium text-neon-300 hover:text-neon-400"
              >
                Forgot or new password?
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

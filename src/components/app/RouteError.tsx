import { useEffect } from 'react';
import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { Button } from '@/components/kit/Button';
import { reportLovableError } from '@/lib/lovable-error-reporting';

/** Friendly per-page error screen: the rest of the app (header, nav) keeps working. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: 'route_error_component' });
  }, [error]);

  return (
    <div role="alert" className="card mx-auto max-w-md space-y-4 p-8 text-center">
      <p className="text-4xl" aria-hidden="true">👾</p>
      <h1 className="text-xl font-bold text-ink-50">This page tripped over a monster</h1>
      <p className="text-sm text-ink-300">Something went wrong loading this page. Your progress is safe.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="primary"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
        <Link to="/" className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold text-ink-200 hover:bg-white/10">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

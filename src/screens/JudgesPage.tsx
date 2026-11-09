import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/kit/Button";

type Health = { secrets: Record<string, boolean>; checkoutReady: boolean; webhooksReady: boolean; aiReady: boolean; missing: string[] };
export function JudgesPage() {
  const health = useQuery({ queryKey: ["paypal-health"], queryFn: async (): Promise<Health> => {
    const response = await fetch("/api/public/paypal-health");
    if (!response.ok) throw new Error("Readiness check could not be loaded.");
    return response.json();
  } });
  const rows = health.data ? [
    { name: "Checkout keys set", ready: health.data.checkoutReady },
    { name: "Webhook ID set", ready: health.data.secrets.PAYPAL_WEBHOOK_ID },
    { name: "AI key set", ready: health.data.secrets.GEMINI_API_KEY },
    { name: "Lovable AI available as fallback", ready: health.data.aiReady },
  ] : [];
  return <div className="space-y-6">
    <header><p className="text-sm text-aqua-300">Sandbox readiness</p><h1 className="mt-2 text-3xl font-bold text-ink-50">PayPal self-test</h1></header>
    <ul className="divide-y divide-border">{rows.map(row => <li key={row.name} className="flex items-center gap-3 py-4">
      {row.ready ? <CheckCircle2 className="text-neon-300" /> : <XCircle className="text-rose-300" />}
      <span>{row.name}</span><span className="ml-auto text-sm">{row.ready ? "Ready" : "Missing"}</span>
    </li>)}</ul>
    {health.isLoading && <p role="status">Checking readiness…</p>}
    {health.isError && <p role="alert">{health.error.message}</p>}
    {health.data && health.data.missing.length > 0 && <p className="break-words text-sm text-amber-300">Add: {health.data.missing.join(", ")}</p>}
    {health.data && !health.data.secrets.GEMINI_API_KEY && <p className="text-sm text-ink-300">GEMINI_API_KEY is optional: Lovable AI is used when available; otherwise results are labelled Calculated fallback.</p>}
    <p className="text-sm text-ink-300">Readiness flags check configuration, not completed payments. PayPal Sandbox uses test money only.</p>
    <div className="flex flex-wrap gap-3"><Button onClick={() => void health.refetch()}><RotateCw className="h-4 w-4" /> Run again</Button><Link to="/goals" className="text-neon-300 underline">Open savings goals</Link></div>
  </div>;
}
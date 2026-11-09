import { createFileRoute } from "@tanstack/react-router";
import { paypalSetupStatus } from "@/lib/checkout-server/setupStatus";

// Public status check: reports only whether each PayPal Sandbox secret is set (true/false).
export const Route = createFileRoute("/api/public/paypal-health")({
  server: {
    handlers: {
      GET: async () => {
        const status = paypalSetupStatus(process.env);
        return Response.json(
          {
            ok: status.checkoutReady,
            mode: status.mode,
            environment: "https://api-m.sandbox.paypal.com",
            secrets: {
              PAYPAL_CLIENT_ID: status.clientId,
              PAYPAL_API_KEY: Boolean(process.env["PAYPAL_API_KEY"]),
              LOVABLE_API_KEY: Boolean(process.env["LOVABLE_API_KEY"]),
              GEMINI_API_KEY: Boolean(process.env["GEMINI_API_KEY"]),
              PAYPAL_WEBHOOK_ID: status.webhookId,
            },
            checkoutReady: status.checkoutReady,
            webhooksReady: status.webhooksReady,
            aiReady: Boolean(process.env["GEMINI_API_KEY"] || process.env["LOVABLE_API_KEY"]),
            missing: status.missing,
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});

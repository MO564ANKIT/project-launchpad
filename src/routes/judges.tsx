import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "@/components/app/RouteError";
import { JudgesPage } from "@/screens/JudgesPage";
export const Route = createFileRoute("/judges")({
  head: () => ({
    meta: [
      { title: "PayPal self-test | Spendemon" },
      {
        name: "description",
        content: "Check Spendemon Sandbox payment, webhook and AI readiness.",
      },
      { property: "og:title", content: "PayPal self-test | Spendemon" },
      {
        property: "og:description",
        content: "Check Spendemon Sandbox payment, webhook and AI readiness.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: JudgesPage,
});

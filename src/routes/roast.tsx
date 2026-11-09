import { createFileRoute } from "@tanstack/react-router";
import { RouteError } from "@/components/app/RouteError";
import { RoastChatPage } from "@/screens/RoastChatPage";

export const Route = createFileRoute("/roast")({
  head: () => ({
    meta: [
      { title: "Roast Chat | Spendemon" },
      { name: "description", content: "Chat with an AI roaster that answers using your real budget numbers." },
      { property: "og:title", content: "Roast Chat | Spendemon" },
      { property: "og:description", content: "Chat with an AI roaster that answers using your real budget numbers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: RouteError,
  component: RoastChatPage,
});

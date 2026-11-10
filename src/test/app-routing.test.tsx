import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { PAGE_PATHS } from "@/lib/pageRoutes";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
const EVERY_PAGE = [...Object.values(PAGE_PATHS), "/judges", "/reset-password"];

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each(EVERY_PAGE)("%s has its own page, a friendly error screen and a title", (path) => {
    const leaf = router.matchRoutes(path).at(-1);
    expect(leaf?.routeId).not.toBe(rootRouteId);
    const route = router.routesById[leaf!.routeId as keyof typeof router.routesById];
    expect(route.options.component).toBeTypeOf("function");
    expect(route.options.errorComponent).toBeTypeOf("function");
    expect(route.options.head).toBeTypeOf("function");
  });
});

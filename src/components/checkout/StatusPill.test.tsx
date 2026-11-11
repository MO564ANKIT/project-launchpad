import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("never labels a completed demo payment as Verified", () => {
    expect(renderToStaticMarkup(<StatusPill status="completed" simulated />)).toContain(
      "Simulated",
    );
    expect(renderToStaticMarkup(<StatusPill status="completed" simulated />)).not.toContain(
      "Verified",
    );
  });
  it("labels a completed real payment as Verified", () => {
    expect(renderToStaticMarkup(<StatusPill status="completed" />)).toContain("Verified");
  });
});

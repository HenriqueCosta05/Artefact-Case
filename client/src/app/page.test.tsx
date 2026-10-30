import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("renders the Next.js logo", () => {
    render(<Home />);

    expect(screen.getByRole("img", { name: "Next.js logo" })).toBeDefined();
  });

  it("links to the Next.js docs", () => {
    render(<Home />);

    const link = screen.getByRole("link", { name: /read our docs/i });
    expect(link.getAttribute("href")).toContain("nextjs.org/docs");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

type LinkProps = { href: string; children: React.ReactNode };
vi.mock("next/link", () => ({
  default: (props: LinkProps) => <a href={props.href}>{props.children}</a>,
}));

import { render, screen } from "@testing-library/react";
import UnauthorizedPage from "./page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UnauthorizedPage", () => {
  it("renders the access denied heading", () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByRole("heading", { name: /access denied/i }),
    ).toBeInTheDocument();
  });

  it("renders a link back to the catalog", () => {
    render(<UnauthorizedPage />);
    const link = screen.getByRole("link", { name: /back to catalog/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
  });
});

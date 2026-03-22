import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Departments" />);
    expect(screen.getByText("Departments")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(
      <PageHeader title="Departments" subtitle="Manage your departments" />,
    );
    expect(screen.getByText("Manage your departments")).toBeInTheDocument();
  });

  it("renders action slot when provided", () => {
    render(
      <PageHeader
        title="Departments"
        action={<button type="button">Add</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("does not render subtitle element when not provided", () => {
    render(<PageHeader title="Departments" />);
    expect(screen.queryByText(/manage/i)).not.toBeInTheDocument();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DepartmentFormDialog } from "./DepartmentFormDialog";

describe("DepartmentFormDialog", () => {
  it("renders dialog title when open", () => {
    render(
      <DepartmentFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );
    expect(screen.getByText("Add Department")).toBeInTheDocument();
    expect(screen.getByLabelText(/department name/i)).toBeInTheDocument();
  });

  it("renders edit title when department provided", () => {
    render(
      <DepartmentFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
        department={{
          id: 1,
          name: "Electronics",
          code: "ELEC",
          description: "<p>Devices.</p>",
          isActive: true,
          createdAt: "",
          updatedAt: "",
        }}
      />,
    );
    expect(screen.getByText("Edit Department")).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    render(
      <DepartmentFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("calls onSubmit with form values when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <DepartmentFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );
    await user.type(screen.getByLabelText(/department name/i), "New Department");
    await user.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "New Department",
        code: undefined,
        description: undefined,
        isActive: true,
      });
    });
  });

  it("disables submit button when isSubmitting", () => {
    render(
      <DepartmentFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={true}
      />,
    );
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});

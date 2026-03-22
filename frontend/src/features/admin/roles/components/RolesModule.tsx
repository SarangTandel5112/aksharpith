"use client";

import { useState } from "react";
import { useRoleMutations, useRolesList } from "../hooks/useRoles";
import type { CreateRoleInput } from "../schemas/roles.schema";
import type { Role } from "../types/roles.types";

export function RolesModule(): React.JSX.Element {
  const { data, isLoading, isError } = useRolesList();
  const { create, update, remove } = useRoleMutations();
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Failed to load roles. Please refresh.
      </p>
    );
  }

  const roles: Role[] = (data?.data?.items ?? []) as Role[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Roles
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Add Role
        </button>
      </div>

      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Role Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Description
              </th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-8 text-[var(--text-muted)]"
                >
                  No roles found. Create one to get started.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                    {role.roleName}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {role.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditRole(role)}
                        className="text-xs text-[var(--primary-500)] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete "${role.roleName}"?`)) {
                            remove.mutate(role.id);
                          }
                        }}
                        className="text-xs text-[var(--color-danger)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <RoleForm
          onSubmit={(input) => {
            create.mutate(input, { onSuccess: () => setShowCreate(false) });
          }}
          onCancel={() => setShowCreate(false)}
          isSubmitting={create.isPending}
        />
      )}

      {editRole !== null && (
        <RoleForm
          initial={editRole}
          onSubmit={(input) => {
            update.mutate(
              { id: editRole.id, input },
              { onSuccess: () => setEditRole(null) },
            );
          }}
          onCancel={() => setEditRole(null)}
          isSubmitting={update.isPending}
        />
      )}
    </div>
  );
}

type RoleFormProps = {
  initial?: Role;
  onSubmit: (input: CreateRoleInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

function RoleForm(props: RoleFormProps): React.JSX.Element {
  const [roleName, setRoleName] = useState(props.initial?.roleName ?? "");
  const [description, setDescription] = useState(
    props.initial?.description ?? "",
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? "Edit Role" : "Create Role"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.onSubmit({ roleName, description });
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="role-name"
              className="text-sm text-[var(--text-muted)]"
            >
              Role Name *
            </label>
            <input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="role-description"
              className="text-sm text-[var(--text-muted)]"
            >
              Description
            </label>
            <input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={props.onCancel}
              className="px-4 py-2 text-sm rounded border border-[var(--surface-border)] text-[var(--text-body)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={props.isSubmitting}
              className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-60"
            >
              {props.isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

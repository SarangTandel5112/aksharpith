"use client";

import { useRolesList } from "@features/admin/roles/hooks/useRoles";
import { useState } from "react";
import { useUserMutations, useUsersList } from "../hooks/useUsers";
import type { CreateUserInput } from "../schemas/users.schema";
import type { User } from "../types/users.types";

type Role = { id: string; roleName: string };

export function UsersModule(): React.JSX.Element {
  const { data, isLoading, isError } = useUsersList();
  const { create, update, remove } = useUserMutations();
  const [editItem, setEditItem] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading)
    return (
      <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
    );
  if (isError)
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Failed to load users.
      </p>
    );

  const items: User[] = (data?.data?.items ?? []) as User[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Users
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Add User
        </button>
      </div>
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Role
              </th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-[var(--text-muted)]"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {item.email}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {item.role.roleName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditItem(item)}
                        className="text-xs text-[var(--primary-500)] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${item.firstName} ${item.lastName}"?`,
                            )
                          )
                            remove.mutate(item.id);
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
        <UserForm
          onSubmit={(input) =>
            create.mutate(input, { onSuccess: () => setShowCreate(false) })
          }
          onCancel={() => setShowCreate(false)}
          isSubmitting={create.isPending}
        />
      )}
      {editItem !== null && (
        <UserForm
          initial={editItem}
          onSubmit={(input) =>
            update.mutate(
              { id: editItem.id, input },
              { onSuccess: () => setEditItem(null) },
            )
          }
          onCancel={() => setEditItem(null)}
          isSubmitting={update.isPending}
        />
      )}
    </div>
  );
}

type UserFormProps = {
  initial?: User;
  onSubmit: (input: CreateUserInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

function UserForm(props: UserFormProps): React.JSX.Element {
  const { data: rolesData } = useRolesList();
  const roles: Role[] = (rolesData?.data?.items ?? []) as Role[];
  const [firstName, setFirstName] = useState(props.initial?.firstName ?? "");
  const [lastName, setLastName] = useState(props.initial?.lastName ?? "");
  const [email, setEmail] = useState(props.initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(props.initial?.role.id ?? "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? "Edit User" : "Create User"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (props.initial !== undefined) {
              props.onSubmit({
                firstName,
                lastName,
                email,
                password: password.length > 0 ? password : "placeholder",
                roleId,
              });
            } else {
              props.onSubmit({ firstName, lastName, email, password, roleId });
            }
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="user-first-name"
                className="text-sm text-[var(--text-muted)]"
              >
                First Name *
              </label>
              <input
                id="user-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
                required
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="user-last-name"
                className="text-sm text-[var(--text-muted)]"
              >
                Last Name *
              </label>
              <input
                id="user-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-email"
              className="text-sm text-[var(--text-muted)]"
            >
              Email *
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            />
          </div>
          {props.initial === undefined && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="user-password"
                className="text-sm text-[var(--text-muted)]"
              >
                Password *
              </label>
              <input
                id="user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
                required
                minLength={8}
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-role"
              className="text-sm text-[var(--text-muted)]"
            >
              Role *
            </label>
            <select
              id="user-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roleName}
                </option>
              ))}
            </select>
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

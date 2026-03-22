"use client";

import { useState } from "react";
import { useGroupMutations, useGroupsList } from "../hooks/useGroups";
import type { CreateGroupInput } from "../schemas/groups.schema";
import type { Group } from "../types/groups.types";

export function GroupsModule(): React.JSX.Element {
  const { data, isLoading, isError } = useGroupsList();
  const { create, update, remove } = useGroupMutations();
  const [editItem, setEditItem] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading)
    return (
      <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
    );
  if (isError)
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Failed to load groups.
      </p>
    );

  const items: Group[] = (data?.data?.items ?? []) as Group[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Groups
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Add Group
        </button>
      </div>
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Group Name
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
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-8 text-[var(--text-muted)]"
                >
                  No groups found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                    {item.groupName}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {item.description}
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
                          if (window.confirm(`Delete "${item.groupName}"?`))
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
        <GroupForm
          onSubmit={(input) =>
            create.mutate(input, { onSuccess: () => setShowCreate(false) })
          }
          onCancel={() => setShowCreate(false)}
          isSubmitting={create.isPending}
        />
      )}
      {editItem !== null && (
        <GroupForm
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

type GroupFormProps = {
  initial?: Group;
  onSubmit: (input: CreateGroupInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

function GroupForm(props: GroupFormProps): React.JSX.Element {
  const [groupName, setGroupName] = useState(props.initial?.groupName ?? "");
  const [description, setDescription] = useState(
    props.initial?.description ?? "",
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? "Edit Group" : "Create Group"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.onSubmit({ groupName, description });
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="group-name"
              className="text-sm text-[var(--text-muted)]"
            >
              Group Name *
            </label>
            <input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="group-description"
              className="text-sm text-[var(--text-muted)]"
            >
              Description
            </label>
            <input
              id="group-description"
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

import type React from "react";

type MetadataRow = {
  label: string;
  value: string;
};

type MetadataCardProps = {
  title: string;
  rows: MetadataRow[];
};

export function MetadataCard(props: MetadataCardProps): React.JSX.Element {
  return (
    <aside className="rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-zinc-100 pb-4">
        <h2 className="text-sm font-semibold tracking-[0.04em] text-zinc-950">
          {props.title}
        </h2>
      </div>
      <dl className="space-y-3">
        {props.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              {row.label}
            </dt>
            <dd className="text-right text-sm font-medium text-zinc-800">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

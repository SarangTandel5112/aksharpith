import { SectionCard } from "@shared/components/admin";
import type React from "react";

type ProductResourcePanelProps = {
  title: string;
  description: string;
  headers: string[];
  rows: Array<{
    id: string;
    cells: React.ReactNode[];
  }>;
  emptyMessage: string;
};

export function ProductResourcePanel(
  props: ProductResourcePanelProps,
): React.JSX.Element {
  return (
    <SectionCard title={props.title} description={props.description}>
      {props.rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-sm text-zinc-500">
          {props.emptyMessage}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                {props.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-zinc-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {props.rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={`${row.id}-${props.headers[cellIndex] ?? cellIndex}`}
                      className="px-4 py-4 text-sm text-zinc-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

import type React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {props.title}
        </h1>
        {props.subtitle && (
          <p className="max-w-2xl text-sm leading-6 text-zinc-500">
            {props.subtitle}
          </p>
        )}
      </div>
      {props.action && <div className="shrink-0">{props.action}</div>}
    </div>
  );
}

import type React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {props.title}
        </h1>
        {props.subtitle && (
          <p className="text-sm text-zinc-500 mt-0.5">{props.subtitle}</p>
        )}
      </div>
      {props.action && <div>{props.action}</div>}
    </div>
  );
}

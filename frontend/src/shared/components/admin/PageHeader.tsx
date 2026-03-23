import type React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{props.title}</h1>
        {props.subtitle && (
          <p className="mt-0.5 text-sm text-zinc-500">{props.subtitle}</p>
        )}
      </div>
      {props.action && <div>{props.action}</div>}
    </div>
  );
}

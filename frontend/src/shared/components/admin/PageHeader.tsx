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
        <h1 className="text-2xl font-semibold tracking-tight">{props.title}</h1>
        {props.subtitle && (
          <p className="text-sm text-muted-foreground">{props.subtitle}</p>
        )}
      </div>
      {props.action && <div>{props.action}</div>}
    </div>
  );
}

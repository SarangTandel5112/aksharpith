import type { SettingsPlaceholderSection } from "@features/admin/settings/types/settings.types";
import { PageHeader, SectionCard, StatusBadge } from "@shared/components/admin";
import type React from "react";

const SETTINGS_SECTIONS: SettingsPlaceholderSection[] = [
  {
    id: "catalog-governance",
    title: "Catalog Governance",
    description:
      "Default statuses, moderation rules, and product onboarding policies.",
    status: "planned",
  },
  {
    id: "asset-rules",
    title: "Asset Rules",
    description:
      "Media validation rules, ordering defaults, and publishing controls.",
    status: "in-progress",
  },
  {
    id: "user-preferences",
    title: "Admin Preferences",
    description:
      "Per-user density, list defaults, and admin preferences.",
    status: "planned",
  },
];

export function SettingsModule(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Planned settings areas for the admin panel."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard
          title="Roadmap"
          description="These sections are planned next for the admin panel."
        >
          <div className="space-y-4">
            {SETTINGS_SECTIONS.map((section) => (
              <article
                key={section.id}
                className="rounded-2xl border border-zinc-200 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-950">
                      {section.title}
                    </p>
                    <p className="text-sm leading-6 text-zinc-500">
                      {section.description}
                    </p>
                  </div>
                  <StatusBadge
                    label={section.status === "planned" ? "Planned" : "In Progress"}
                    variant={section.status === "planned" ? "neutral" : "info"}
                  />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Current Scope"
          description="What is covered in the current admin pass."
        >
          <div className="space-y-3 text-sm leading-7 text-zinc-600">
            <p>Settings is visible in the sidebar so navigation feels complete.</p>
            <p>This page is a placeholder for upcoming settings.</p>
            <p>The layout is ready for future forms and controls.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-domain-importing-infrastructure",
      severity: "error",
      from: { path: "^src/core/domain" },
      to: { path: "^src/core/infrastructure" },
    },
    {
      name: "no-domain-importing-features",
      severity: "error",
      from: { path: "^src/core/domain" },
      to: { path: "^src/features" },
    },
    {
      name: "no-application-importing-features",
      severity: "error",
      from: { path: "^src/core/application" },
      to: { path: "^src/features" },
    },
    {
      name: "no-shared-importing-features",
      severity: "error",
      from: { path: "^src/shared" },
      to: { path: "^src/features" },
    },
    {
      name: "no-infrastructure-importing-features",
      severity: "error",
      from: { path: "^src/core/infrastructure" },
      to: { path: "^src/features" },
    },
  ],
  options: {
    moduleSystems: ["es6", "cjs"],
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};

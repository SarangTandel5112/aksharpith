const fs = require("node:fs");

const msgFile = process.argv[2];
if (!msgFile) {
  console.error("No commit message file provided");
  process.exit(1);
}

const msg = fs.readFileSync(msgFile, "utf8").trim();
const pattern =
  /^(feat|fix|chore|docs|test|refactor|style|perf|ci)(\(.+\))?: .{1,100}$/;

if (!pattern.test(msg)) {
  console.error("Commit message must follow: type(scope): description");
  console.error(
    "Example: feat(auth): add login page\n\nAllowed types: feat, fix, chore, docs, test, refactor, style, perf, ci",
  );
  process.exit(1);
}

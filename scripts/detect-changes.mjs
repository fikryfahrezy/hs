import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [baseSha, headSha = "HEAD"] = process.argv.slice(2);
const outputPath = process.env.GITHUB_OUTPUT;

if (!outputPath) {
  throw new Error("GITHUB_OUTPUT is required.");
}

const allChanged = !baseSha || /^0+$/.test(baseSha);
const changedFiles = allChanged
  ? ["package.json"]
  : execFileSync("git", ["diff", "--name-only", baseSha, headSha], {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);

const sharedPatterns = [
  /^packages\/contracts\//,
  /^package(?:-lock)?\.json$/,
  /^tsconfig\.base\.json$/,
  /^\.github\/workflows\/ci\.yaml$/,
];
const frontendPatterns = [/^apps\/web\//, ...sharedPatterns];
const backendPatterns = [/^apps\/api\//, /^db\//, ...sharedPatterns];
const e2ePatterns = [
  /^apps\/web\//,
  /^apps\/api\//,
  /^packages\/contracts\//,
  /^tests\/e2e\//,
  /^db\//,
  /^infra\//,
  /^compose(?:\.deploy)?\.yaml$/,
  /Dockerfile$/,
  /^\.dockerignore$/,
  /(?:^|\/)\.env\.example$/,
  /^package(?:-lock)?\.json$/,
  /^\.github\/workflows\/ci\.yaml$/,
];

function matchesAny(patterns) {
  return (
    allChanged ||
    changedFiles.some((file) => patterns.some((pattern) => pattern.test(file)))
  );
}

appendFileSync(
  outputPath,
  [
    `frontend=${matchesAny(frontendPatterns)}`,
    `backend=${matchesAny(backendPatterns)}`,
    `e2e=${matchesAny(e2ePatterns)}`,
  ].join("\n") + "\n",
);

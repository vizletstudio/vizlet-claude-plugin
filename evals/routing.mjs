#!/usr/bin/env node
/**
 * Routing eval for the vizlet skill: for each case in routing-cases.json, run
 * a headless Claude Code session with ONLY this plugin loaded and record
 * whether the `vizlet:vizlet` skill fired. Precision matters as much as
 * recall: a skill that fires on bar charts gets uninstalled.
 *
 *   node claude-plugins/vizlet/evals/routing.mjs [--runs 2] [--model <m>]
 *        [--case <id-substring>] [--baseline] [--out results.json]
 *
 * Needs the Claude Code CLI signed in (`claude auth login`). Set CLAUDE_BIN to
 * point at it if it is not found. `--baseline` runs the should-fire cases once
 * WITHOUT the plugin and reports what Claude reached for instead.
 *
 * SAFE BY CONSTRUCTION. Each run starts in a fresh temp directory, so no
 * project settings or CLAUDE.md steer it; `--strict-mcp-config` with an empty
 * config loads no MCP server, the plugin's own included, so nothing can touch a
 * real Vizlet account; and `--max-turns` stops each run shortly after the
 * routing decision, which is made on the first turn. This measures ROUTING,
 * never authoring.
 *
 * Why not `claude plugin eval`: it was early access and unavailable on the
 * account this was built on (2026-09-27). The event parsing below is the same
 * one the first smoke test used (docs/claude-routing-2026-09-26.md).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = resolve(HERE, "..");
const SKILL = "vizlet:vizlet";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? fallback : process.argv[i + 1];
}
const RUNS = Number(arg("runs", "2"));
const MODEL = arg("model", null);
const ONLY = arg("case", null);
const OUT = arg("out", null);
const BASELINE = process.argv.includes("--baseline");

function claudeBin() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const win = process.env.APPDATA && join(process.env.APPDATA, "npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe");
  if (win && existsSync(win)) return win;
  return "claude";
}

/** One headless run. Returns which skills fired, which tools were called, and why it stopped. */
function runOnce(prompt, withPlugin) {
  const cwd = mkdtempSync(join(tmpdir(), "vizlet-routing-"));
  const args = [
    "-p", prompt,
    ...(withPlugin ? ["--plugin-dir", PLUGIN] : []),
    "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
    "--max-turns", "2",
    "--output-format", "stream-json", "--verbose",
    ...(MODEL ? ["--model", MODEL] : []),
  ];
  const r = spawnSync(claudeBin(), args, { cwd, encoding: "utf8", timeout: 240_000, maxBuffer: 64 * 1024 * 1024 });
  // Windows can still hold the directory for a moment after the child exits;
  // a leftover empty temp dir is harmless, a crash mid-suite is not.
  try { rmSync(cwd, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch { /* left for the OS */ }
  const skills = [];
  const tools = [];
  let model = null;
  let end = null;
  let cost = 0;
  for (const line of (r.stdout || "").split(/\r?\n/)) {
    let ev;
    try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === "system" && ev.subtype === "init") model = ev.model ?? null;
    if (ev.type === "assistant") {
      for (const b of ev.message?.content ?? []) {
        if (b.type !== "tool_use") continue;
        tools.push(b.name);
        if (b.name === "Skill") skills.push(String(b.input?.skill ?? b.input?.command ?? ""));
      }
    }
    if (ev.type === "result") {
      end = ev.subtype ?? null;
      cost = Number(ev.total_cost_usd ?? 0);
      // A run that could not start (a lapsed login, say) must not read as "did not fire".
      if (ev.is_error && /authenticate|login/i.test(String(ev.result ?? ""))) end = "auth_error";
    }
  }
  if (!end) end = r.error ? `spawn_error: ${r.error.message}` : `exit_${r.status}`;
  return { skills, tools, model, end, cost };
}

const { cases } = JSON.parse(readFileSync(join(HERE, "routing-cases.json"), "utf8"));
const selected = cases.filter((c) => !ONLY || c.id.includes(ONLY));
const results = [];
let spend = 0;

for (const c of selected) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const run = runOnce(c.prompt, true);
    spend += run.cost;
    runs.push(run);
    if (run.end === "auth_error") {
      console.error("The Claude CLI is not signed in; run `claude auth login` and try again.");
      process.exit(2);
    }
  }
  const fired = runs.filter((r) => r.skills.includes(SKILL)).length;
  results.push({ id: c.id, expect: c.expect, fired, runs: RUNS, pass: c.expect ? fired === RUNS : fired === 0, detail: runs });
  console.log(`${(c.expect ? fired === RUNS : fired === 0) ? "PASS" : "FAIL"}  ${c.id.padEnd(28)} expect=${c.expect ? "fire" : "no  "}  fired ${fired}/${RUNS}  skills=${JSON.stringify([...new Set(runs.flatMap((r) => r.skills))])}`);
}

const baseline = [];
if (BASELINE) {
  for (const c of selected.filter((x) => x.expect)) {
    const run = runOnce(c.prompt, false);
    spend += run.cost;
    baseline.push({ id: c.id, skills: run.skills, tools: [...new Set(run.tools)] });
    console.log(`BASE  ${c.id.padEnd(28)} without the plugin: skills=${JSON.stringify(run.skills)} tools=${JSON.stringify([...new Set(run.tools)])}`);
  }
}

const shouldFire = results.filter((r) => r.expect);
const shouldNot = results.filter((r) => !r.expect);
const summary = {
  model: results[0]?.detail[0]?.model ?? null,
  runsPerCase: RUNS,
  recall: `${shouldFire.reduce((n, r) => n + r.fired, 0)}/${shouldFire.length * RUNS}`,
  falseFires: `${shouldNot.reduce((n, r) => n + r.fired, 0)}/${shouldNot.length * RUNS}`,
  casesPassed: `${results.filter((r) => r.pass).length}/${results.length}`,
  costUsd: Number(spend.toFixed(2)),
};
console.log(JSON.stringify(summary));
if (OUT) writeFileSync(OUT, JSON.stringify({ summary, results, baseline }, null, 2));
process.exit(results.every((r) => r.pass) ? 0 : 1);

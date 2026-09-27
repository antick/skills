#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { existsSync, realpathSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { installSkill, resolveDirectory, resolveDestinations } from "./install-files.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[38;5;102m";
const TEXT = "\x1b[38;5;145m";
const TEAL = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BADGE = "\x1b[46;30;1m";
const GRAYS = [
  "\x1b[38;5;250m",
  "\x1b[38;5;248m",
  "\x1b[38;5;245m",
  "\x1b[38;5;243m",
  "\x1b[38;5;240m",
  "\x1b[38;5;238m",
];
const LOGO_LINES = [
  "███████╗██╗  ██╗██╗██╗     ██╗     ███████╗",
  "██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝",
  "███████╗█████╔╝ ██║██║     ██║     ███████╗",
  "╚════██║██╔═██╗ ██║██║     ██║     ╚════██║",
  "███████║██║  ██╗██║███████╗███████╗███████║",
  "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝",
];

export function parseArgs(argv) {
  const valueFor = (option, value) => {
    if (!value?.trim() || value.startsWith("-")) {
      throw new Error(`Missing value for ${option}`);
    }
    return value;
  };
  const options = {
    list: false,
    help: false,
    yes: false,
    global: false,
    copy: false,
    all: false,
    skills: [],
    agents: [],
    cwd: process.cwd(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--list" || arg === "-l") options.list = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--yes" || arg === "-y") options.yes = true;
    else if (arg === "--global" || arg === "-g") options.global = true;
    else if (arg === "--copy") options.copy = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--cwd") options.cwd = path.resolve(valueFor(arg, argv[++index]));
    else if (arg === "--skill" || arg === "-s") options.skills.push(valueFor(arg, argv[++index]));
    else if (arg === "--agent" || arg === "-a") options.agents.push(valueFor(arg, argv[++index]));
    else if (arg.startsWith("--skill=")) options.skills.push(valueFor("--skill", arg.slice("--skill=".length)));
    else if (arg.startsWith("--agent=")) options.agents.push(valueFor("--agent", arg.slice("--agent=".length)));
    else if (arg.startsWith("--cwd=")) options.cwd = path.resolve(valueFor("--cwd", arg.slice("--cwd=".length)));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.all) {
    options.skills = ["*"];
    options.agents = ["*"];
    options.yes = true;
  }

  return options;
}

export function expandHome(target) {
  if (!target.startsWith("~")) return target;
  return path.join(os.homedir(), target.slice(1));
}

export async function loadCatalog(packageRoot = PACKAGE_ROOT) {
  const [packs, agentCatalog, skillEntries] = await Promise.all([
    readFile(path.join(packageRoot, "packs.json"), "utf8").then(JSON.parse),
    readFile(path.join(packageRoot, "scripts/install-agents.json"), "utf8").then(JSON.parse),
    readdir(path.join(packageRoot, "skills"), { withFileTypes: true }),
  ]);
  const skillDirs = skillEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const summaries = packs.summaries ?? {};
  const skills = packs.packs.flatMap((pack) =>
    pack.skills.map((name) => ({
      name,
      pack: pack.id,
      packDescription: pack.description,
      summary: summaries[name],
      directory: path.join(packageRoot, "skills", name),
    })),
  );

  return {
    packs: packs.packs,
    summaries,
    skills,
    skillDirs,
    agents: agentCatalog.agents,
  };
}

export function selectSkills(catalog, requested) {
  if (requested.length === 0 || requested.includes("*")) return catalog.skills;
  const available = new Map(catalog.skills.map((skill) => [skill.name, skill]));
  const unknown = requested.filter((name) => !available.has(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown skills: ${unknown.join(", ")}. Available: ${catalog.skillDirs.join(", ")}`);
  }
  return requested.map((name) => available.get(name));
}

export function selectAgents(catalog, requested, detectedIds) {
  const available = new Map(catalog.agents.map((agent) => [agent.id, agent]));
  if (requested.includes("*")) return catalog.agents;
  if (requested.length > 0) {
    const unknown = requested.filter((id) => !available.has(id));
    if (unknown.length > 0) {
      throw new Error(`Unknown agents: ${unknown.join(", ")}. Available: ${[...available.keys()].join(", ")}`);
    }
    return requested.map((id) => available.get(id));
  }
  const detected = catalog.agents.filter((agent) => detectedIds.includes(agent.id));
  return detected.length > 0 ? detected : catalog.agents.filter((agent) => ["cursor", "claude-code", "codex", "opencode", "pi"].includes(agent.id));
}

export function detectInstalledAgents(agents, exists = existsSync) {
  return agents
    .filter((agent) => (agent.detect ?? []).some((marker) => exists(expandHome(marker))))
    .map((agent) => agent.id);
}

export function resolveAgentDir(agent, { global, cwd }) {
  const relative = global ? agent.globalDir : agent.projectDir;
  if (!relative) return null;
  return global ? expandHome(relative) : path.join(cwd, relative);
}

export function canonicalSkillsDir({ global, cwd }) {
  return global ? path.join(os.homedir(), ".agents", "skills") : path.join(cwd, ".agents", "skills");
}

function printLogo() {
  console.log();
  for (const [index, line] of LOGO_LINES.entries()) {
    console.log(`${GRAYS[index]}${line}${RESET}`);
  }
  console.log();
  console.log(`${BADGE} skills ${RESET}`);
}

function printHelp() {
  printLogo();
  console.log(`${DIM}Install Antick Skills into coding agents${RESET}`);
  console.log();
  console.log(`  ${DIM}$${RESET} ${TEXT}npx @antick/skills${RESET}                 ${DIM}Interactive wizard${RESET}`);
  console.log(`  ${DIM}$${RESET} ${TEXT}npx @antick/skills --list${RESET}        ${DIM}Preview skills${RESET}`);
  console.log(`  ${DIM}$${RESET} ${TEXT}node scripts/install.mjs${RESET}              ${DIM}From a local checkout${RESET}`);
  console.log();
  console.log(`${BOLD}Options${RESET}`);
  console.log(`  --list, -l           List skills and stop`);
  console.log(`  --skill, -s <name>   Install named skills (* for all)`);
  console.log(`  --agent, -a <name>   Target a harness (* for all)`);
  console.log(`  --global, -g         Install in the home directory`);
  console.log(`  --copy               Copy files instead of symlinking`);
  console.log(`  --yes, -y            Skip prompts (required without a terminal)`);
  console.log(`  --all                All skills, all harnesses, skip prompts`);
  console.log(`  --cwd <dir>          Install relative to this directory`);
}

export function formatSkillList(catalog) {
  const lines = [];
  for (const pack of catalog.packs) {
    const title = pack.id.charAt(0).toUpperCase() + pack.id.slice(1);
    lines.push(`${BOLD}${title}${RESET}`);
    for (const name of pack.skills) {
      const summary = catalog.summaries[name] ?? "";
      lines.push(`  ${TEAL}${name.padEnd(18)}${RESET} ${DIM}${summary}${RESET}`);
    }
    lines.push("");
  }
  return lines;
}

function printList(catalog, source) {
  printLogo();
  console.log(`${DIM}│${RESET}`);
  console.log(`${DIM}◇${RESET}  Source: ${source}`);
  console.log(`${DIM}◇${RESET}  Found ${GREEN}${catalog.skills.length}${RESET} skills`);
  console.log();
  console.log(`${DIM}◇${RESET}  ${BOLD}Available Skills${RESET}`);
  console.log();
  for (const line of formatSkillList(catalog)) {
    console.log(line);
  }
}

async function question(query) {
  const interface_ = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await new Promise((resolve) => {
      interface_.question(query, (answer) => resolve(answer.trim()));
    });
  } finally {
    interface_.close();
  }
}

async function promptGroupedSelection({ title, groups, selectedIds = [] }) {
  const items = groups.flatMap((group) => group.items);
  const selected = new Set(selectedIds.length > 0 ? selectedIds : items.map((item) => item.id));
  console.log();
  console.log(`${BOLD}${title}${RESET}`);
  console.log(`${DIM}Type all, names, or numbers. Enter keeps the current selection.${RESET}`);
  console.log();
  let index = 1;
  const numbered = [];
  for (const group of groups) {
    console.log(`  ${BOLD}${group.title}${RESET}`);
    for (const item of group.items) {
      numbered.push(item);
      const mark = selected.has(item.id) ? `${GREEN}x${RESET}` : " ";
      console.log(`  [${mark}] ${String(index).padStart(2)}. ${TEAL}${item.label}${RESET}  ${DIM}${item.detail}${RESET}`);
      index += 1;
    }
    console.log();
  }

  const answer = await question(`${DIM}>${RESET} `);
  if (answer === "") return items.filter((item) => selected.has(item.id));
  if (answer.toLowerCase() === "all" || answer === "*") return items;
  const picked = new Set();
  for (const token of answer.split(/[\s,]+/).filter(Boolean)) {
    if (/^\d+$/.test(token)) {
      const item = numbered[Number(token) - 1];
      if (!item) throw new Error(`Unknown selection: ${token}`);
      picked.add(item.id);
      continue;
    }
    const item = items.find((candidate) => candidate.id === token || candidate.label.toLowerCase() === token.toLowerCase());
    if (!item) throw new Error(`Unknown selection: ${token}`);
    picked.add(item.id);
  }
  if (picked.size === 0) throw new Error("Select at least one item.");
  return items.filter((item) => picked.has(item.id));
}

async function promptChoice(title, choices) {
  console.log();
  console.log(`${BOLD}${title}${RESET}`);
  for (const [index, choice] of choices.entries()) {
    console.log(`  ${index + 1}. ${choice.label}  ${DIM}${choice.hint}${RESET}`);
  }
  const answer = await question(`${DIM}>${RESET} `);
  if (answer === "") return choices[0].value;
  const byNumber = choices[Number(answer) - 1];
  if (byNumber) return byNumber.value;
  const byId = choices.find((choice) => choice.id === answer || choice.label.toLowerCase() === answer.toLowerCase());
  if (byId) return byId.value;
  throw new Error(`Unknown choice: ${answer}`);
}

export async function installSelection({ skills, agents, cwd, global, copy }) {
  const canonical = canonicalSkillsDir({ global, cwd });
  const boundary = await resolveDirectory(global ? os.homedir() : cwd);
  const plan = [];
  const installed = [];

  for (const skill of skills) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(skill.name)) {
      throw new Error(`Invalid skill name: ${skill.name}`);
    }
    const destinations = [];
    const canonicalDir = path.join(canonical, skill.name);
    destinations.push(canonicalDir);
    for (const agent of agents) {
      const base = resolveAgentDir(agent, { global, cwd });
      if (!base) continue;
      const target = path.join(base, skill.name);
      if (path.resolve(target) !== path.resolve(canonicalDir)) destinations.push(target);
    }
    plan.push({ skill, destinations: await resolveDestinations(destinations, boundary) });
  }

  for (const { skill, destinations } of plan) {
    await installSkill(skill, destinations, { copy, boundary });
    installed.push({
      name: skill.name,
      path: path.relative(cwd, destinations[0]) || destinations[0],
    });
  }

  return installed;
}

function uniqueDestinations(agents, options) {
  return new Set(
    agents
      .map((agent) => resolveAgentDir(agent, options))
      .filter(Boolean)
      .map((dir) => path.resolve(dir)),
  );
}

async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(`${RED}${error.message}${RESET}`);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printHelp();
    return;
  }

  const catalog = await loadCatalog();
  const source = PACKAGE_ROOT;

  if (options.list) {
    printList(catalog, source);
    return;
  }

  const interactive = process.stdin.isTTY && process.stdout.isTTY && !options.yes;
  if (!interactive && !options.yes) {
    throw new Error("Non-interactive installation requires --yes (or --all). Use --list to preview skills.");
  }
  const detected = detectInstalledAgents(catalog.agents);

  printLogo();
  console.log(`${DIM}│${RESET}`);
  console.log(`${DIM}◇${RESET}  Source: ${source}`);
  console.log(`${DIM}◇${RESET}  Found ${GREEN}${catalog.skills.length}${RESET} skills`);

  let selectedSkills;
  if (options.skills.length > 0 || !interactive) {
    selectedSkills = selectSkills(catalog, options.skills.length > 0 ? options.skills : ["*"]);
  } else {
    const chosen = await promptGroupedSelection({
      title: "Select skills to install",
      selectedIds: catalog.skills.map((skill) => skill.name),
      groups: catalog.packs.map((pack) => ({
        title: pack.id.charAt(0).toUpperCase() + pack.id.slice(1),
        items: pack.skills.map((name) => ({
          id: name,
          label: name,
          detail: catalog.summaries[name],
        })),
      })),
    });
    selectedSkills = chosen.map((item) => catalog.skills.find((skill) => skill.name === item.id));
  }

  let selectedAgents;
  if (options.agents.length > 0 || !interactive) {
    selectedAgents = selectAgents(catalog, options.agents, detected);
  } else {
    const detectedSet = new Set(detected);
    const recommended = detected.length > 0 ? detected : ["cursor", "claude-code", "codex", "opencode", "pi"];
    const chosenAgents = await promptGroupedSelection({
      title: "Which agents do you want to install to?",
      selectedIds: recommended,
      groups: [
        {
          title: "Detected",
          items: catalog.agents
            .filter((agent) => detectedSet.has(agent.id))
            .map((agent) => ({
              id: agent.id,
              label: agent.displayName,
              detail: options.global ? agent.globalDir : agent.projectDir,
            })),
        },
        {
          title: "Other harnesses",
          items: catalog.agents
            .filter((agent) => !detectedSet.has(agent.id))
            .map((agent) => ({
              id: agent.id,
              label: agent.displayName,
              detail: options.global ? agent.globalDir : agent.projectDir,
            })),
        },
      ].filter((group) => group.items.length > 0),
    });
    selectedAgents = chosenAgents.map((item) => catalog.agents.find((agent) => agent.id === item.id));
  }

  if (selectedAgents.length === 0) {
    throw new Error("Select at least one agent.");
  }

  let installGlobally = options.global;
  if (interactive && !options.global) {
    installGlobally = await promptChoice("Installation scope", [
      { id: "project", label: "Project", hint: "Install in the current directory", value: false },
      { id: "global", label: "Global", hint: "Install in the home directory", value: true },
    ]);
  }

  const destCount = uniqueDestinations(selectedAgents, { global: installGlobally, cwd: options.cwd }).size;
  let copy = options.copy || destCount <= 1;
  if (interactive && !options.copy && destCount > 1) {
    copy = await promptChoice("Installation method", [
      { id: "symlink", label: "Symlink (Recommended)", hint: "Single source of truth, easy updates", value: false },
      { id: "copy", label: "Copy to all agents", hint: "Independent copies for each agent", value: true },
    ]);
  }

  console.log();
  console.log(`${BOLD}Installation summary${RESET}`);
  for (const skill of selectedSkills) {
    console.log(`  ${TEAL}${skill.name}${RESET}  ${DIM}${skill.summary}${RESET}`);
  }
  console.log(`  ${DIM}agents${RESET}  ${selectedAgents.map((agent) => agent.displayName).join(", ")}`);
  console.log(`  ${DIM}scope${RESET}   ${installGlobally ? "global" : "project"}`);
  console.log(`  ${DIM}method${RESET}  ${copy ? "copy" : "symlink"}`);

  if (interactive) {
    const confirm = await question(`\n${YELLOW}Install these skills?${RESET} [Y/n] `);
    if (confirm && !/^y(es)?$/i.test(confirm)) {
      console.log(`${DIM}Cancelled.${RESET}`);
      return;
    }
  }

  const installed = await installSelection({
    skills: selectedSkills,
    agents: selectedAgents,
    cwd: options.cwd,
    global: installGlobally,
    copy,
  });

  console.log();
  console.log(`${GREEN}Installed ${installed.length} skills${RESET}`);
  for (const skill of installed) {
    console.log(`  ${GREEN}✓${RESET} ${skill.name}  ${DIM}${skill.path}${RESET}`);
  }
  console.log();
  console.log(`${DIM}Restart the host or open a new session so it rediscovers skills.${RESET}`);
}

const isDirectRun = process.argv[1] && existsSync(process.argv[1]) &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isDirectRun) {
  main().catch((error) => {
    console.error(`${RED}${error.message}${RESET}`);
    process.exitCode = 1;
  });
}

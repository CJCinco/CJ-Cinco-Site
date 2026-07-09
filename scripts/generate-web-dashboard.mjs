#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const aosRoot = resolve(repoRoot, "../../../..");
const sourcePath = resolve(repoRoot, "dashboard-source/web-dashboard.json");
const outputPath = resolve(repoRoot, "src/app/dashboard/generated-dashboard.ts");
const verifyOnly = process.argv.includes("--verify");
const refreshSource = process.argv.includes("--refresh-source");

const inputs = {
  aosDashboard: "00 Master Command/dashboard-system/assets/data/dashboard.json",
  wealthDashboard: "04 Wealth/dashboard.csv",
  wealthBudget: "04 Wealth/budget-goals.csv",
  cjCincoHandoff: "06 Aligned Harmonics/CJ Cinco/HANDOFF.md",
  cjCincoReadme: "06 Aligned Harmonics/CJ Cinco/README.md",
  alignedHarmonicsHandoff: "06 Aligned Harmonics/HANDOFF.md",
};

const pageTitles = {
  overview: "Overview",
  "cj-cinco": "CJ Cinco",
  areas: "Area State",
  wealth: "Wealth",
  vtc: "VTC",
  content: "Content / Social",
  coaching: "Coaching",
  system: "System",
};

const toneSet = new Set(["neutral", "good", "watch", "alert", "cyan", "gold", "green", "red"]);
const pageKeySet = new Set(Object.keys(pageTitles));

const leakRules = [
  {
    name: "email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  },
  {
    name: "phone number",
    pattern: /(?:\+?1[\s.-]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[\s.-]?[2-9]\d{2}[\s.-]?\d{4}\b/,
  },
  {
    name: "street address",
    pattern: /(?<![-\w])\d{1,6}\s+[A-Z0-9.'-]+(?:\s+[A-Z0-9.'-]+){0,4}\s+(?:ST|STREET|AVE|AVENUE|RD|ROAD|DR|DRIVE|LN|LANE|BLVD|BOULEVARD|CT|COURT|CIR|CIRCLE|WAY|TRL|TRAIL|PKWY|PARKWAY|PL|PLACE)\b/i,
  },
  {
    name: "local user path",
    pattern: /\/Users\/cjwatts|Library\/Mobile Documents|com~apple~CloudDocs|iCloud~md~obsidian/i,
  },
  {
    name: "raw source folder",
    pattern: /04 Clients \+ Leads|08 Source Documents|source-files|master-transactions|SSDI App|Contracts\/|Pictures\//i,
  },
  {
    name: "credential marker",
    pattern: /\b(password|passcode|api[_ -]?key|secret|bearer|cookie|session token|reset link|two[- ]factor|2fa|verification code)\b/i,
  },
  {
    name: "account number marker",
    pattern: /\b(account number|routing number|ssn|social security|full account|card number)\b/i,
  },
  {
    name: "account-like digit group",
    pattern: /\b(?:\d[ -]?){13,19}\b/,
  },
  {
    name: "raw message marker",
    pattern: /\b(raw mail|raw messages|message body|transcript body|voicemail transcript)\b/i,
  },
  {
    name: "private health/legal marker",
    pattern: /\b(hospitalization|diagnosis|lab results?|medication|psychiatry|therapy|attorney|benefit application)\b/i,
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readAos(relativePath) {
  return readFileSync(resolve(aosRoot, relativePath), "utf8");
}

function readJsonAos(relativePath) {
  return JSON.parse(readAos(relativePath));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function redactText(value, maxLength = 210) {
  let text = normalizeText(value)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\b0[0-9]\s+(Health|The People|Home|Wealth|Vero Tech Care|Aligned Harmonics|Altered States)\b/g, "$1")
    .replace(/\b00 Master Command\b/g, "Master Command")
    .replace(/\b[A-Z]-\d{4}-\d{3}\s*-\s*[^:]+:/g, "Active service handoff:")
    .replace(/\bCJC-\d+\b/g, "active issue")
    .replace(/\bAshley\s*\/\s*Rhythm\s*&\s*Soul\b/gi, "the active VTC handoff")
    .replace(/\bAshley Bille\b/gi, "the active VTC handoff")
    .replace(/\bRhythm\s*&\s*Soul\b/gi, "the active VTC handoff")
    .replace(/\bMobile Inventor\b/gi, "the app developer")
    .replace(/\bSSDI\b/g, "support paperwork")
    .replace(/\bJoan\b/gi, "recent service correction")
    .replace(/\bMichele\b/gi, "relationship lane")
    .replace(/\bEddie\b[^.;]*/gi, "private touchpoint")
    .replace(/\b09 Knowledge Base\/[^.]+\.md\b/gi, "source note")
    .replace(/Confirm or recreate needed Apple\/iCloud aliases[^.]+/gi, "Confirm VTC business contact aliases only inside local source systems")
    .replace(/Watch for the app developer[^.]+/gi, "Watch for active app handoff acceptance and record the proof locally")
    .replace(/Confirm current therapy[^.]+qualified professionals\./gi, "Confirm professional-care continuity and follow-up questions with qualified professionals.")
    .replace(/Ask primary care[^.]+context\./gi, "Ask qualified professionals whether recent wellbeing signals need follow-up.")
    .replace(/\bpost-hospitalization\b|\bhospitalization\b|\bdiagnosis\b|\btherapy\b|\bpsychiatry\b|\bmedication(?:-management)?\b|\brefill\b|\bside effects\b|\bhemoglobin\b|\bhematocrit\b|\bBUN\b|\blipid-panel\b|\blab results?\b|\bclinician\b|\bprimary care\b|\battorney\b/gi, "professional-care")
    .replace(/\bbenefit application\b/gi, "support paperwork")
    .replace(/\bhealth-marker flags?\b/gi, "wellbeing signals")
    .replace(/\bfamily relationship\b/gi, "relationship lane")
    .replace(/\bprivate relationship context\b/gi, "private context")
    .replace(/\bmarriage stability\b/gi, "relationship stability")
    .replace(/\bfamily presence\b/gi, "household presence")
    .replace(/\bfamily-business exposure\b/gi, "age-appropriate business exposure")
    .replace(/\bclient\/lead records?\b/gi, "service proof")
    .replace(/\bclients?\b/gi, "service relationships")
    .replace(/\bleads?\b/gi, "opportunities")
    .replace(/\bcontact records?\b/gi, "relationship records")
    .replace(/\bpictures\/videos\b/gi, "media")
    .replace(/\b00 Manager\/inbox\/Social Raw\/?\b/gi, "the Social Raw intake lane")
    .replace(/\b[\w.-]+@/g, "business alias")
    .replace(/\bMail\/Messages\b/g, "communications")
    .replace(/\bmail\/messages\b/g, "communications")
    .replace(/\/Users\/[^\s)]+/g, "local source")
    .replace(/https?:\/\/\S+/g, "approved public link")
    .replace(/\S+@\S+\.\S+/g, "approved account");

  text = text
    .replace(/\bbenefit application application\b/gi, "benefit application")
    .replace(/\bopportunities-floor\b/gi, "follow-up floor")
    .replace(/\bopportunities-follow-up\b/gi, "follow-up")
    .replace(/\bthe active VTC handoff app handoff\b/gi, "active VTC app handoff")
    .replace(/\bthe app developer\/app-developer\b/gi, "the app developer")
    .replace(/\bthe Social Raw intake lane\/\b/gi, "the Social Raw intake lane")
    .replace(/\bthe Social Raw intake lane\/\./gi, "the Social Raw intake lane.")
    .replace(/\brecent service correction correction\b/gi, "recent service correction")
    .replace(/\bfollow-up floor follow-through\b/gi, "follow-up floor")
    .replace(/Confirm VTC business contact aliases only inside local source systems.*$/i, "Confirm VTC business contact aliases only inside local source systems.")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > maxLength) {
    return `${text.slice(0, maxLength - 1).trim()}...`;
  }

  return text;
}

function titleCase(value) {
  return normalizeText(value).replace(/\b\w/g, (match) => match.toUpperCase());
}

function money(value) {
  if (typeof value === "string" && value.trim().startsWith("$")) {
    return value.trim();
  }

  const numeric = Number(value || 0);
  return numeric.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
  });
}

function csvParse(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header = [], ...body] = rows.filter((item) => item.some((cell) => cell.trim().length > 0));
  return body.map((item) => Object.fromEntries(header.map((key, index) => [key, item[index] ?? ""])));
}

function parseBullets(markdown, heading, limit = 4) {
  const pattern = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  const match = markdown.match(pattern);
  if (!match) return [];

  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^## /m);
  const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;

  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*] |\d+\. /.test(line))
    .map((line) => line.replace(/^[-*] |\d+\. /, ""))
    .filter(Boolean)
    .slice(0, limit)
    .map((line) => redactText(line, 180));
}

function parseField(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, "mi"));
  return match ? redactText(match[1], 180) : "";
}

function parseOneThing(markdown, fallbackOwner) {
  return {
    owner: fallbackOwner,
    current: parseField(markdown, "Current") || "Maintain the current lane focus.",
    supports: parseField(markdown, "Supports") || "AOS structure and current source context.",
    doneWhen: parseField(markdown, "Done when") || "The next proof is visible in the owning source surface.",
  };
}

function parseScorecard(markdown) {
  return {
    grade: parseField(markdown, "Grade") || "n/a",
    momentum: parseField(markdown, "Momentum") || "n/a",
    risk: parseField(markdown, "Risk") || "n/a",
    upgrade: parseField(markdown, "Main upgrade needed") || "Keep the source surface clear and current.",
  };
}

function metric(label, value, detail, tone = "neutral") {
  return {
    label,
    value: String(value),
    detail: redactText(detail, 180),
    tone: toneSet.has(tone) ? tone : "neutral",
  };
}

function row(label, value, detail = "", tone = "neutral") {
  return {
    label: redactText(label, 80),
    value: String(value),
    detail: redactText(detail, 180),
    tone: toneSet.has(tone) ? tone : "neutral",
  };
}

function section(title, kicker, items, tone = "neutral") {
  return {
    title: redactText(title, 80),
    kicker: redactText(kicker, 80),
    tone: toneSet.has(tone) ? tone : "neutral",
    items,
  };
}

function buildAreaFromDashboard(area, queue) {
  return {
    slug: area.slug,
    name: area.name,
    tier: "Core",
    status: area.status || "yellow",
    missionLink: redactText(area.missionLink || "primary track", 60),
    scorecard: {
      grade: redactText(area.scorecard?.grade || "n/a", 24),
      momentum: redactText(area.scorecard?.momentum || "n/a", 60),
      risk: redactText(area.scorecard?.risk || "n/a", 60),
      upgrade: redactText(area.scorecard?.upgrade || "", 170),
    },
    oneThing: {
      owner: redactText(area.oneThing?.owner || area.name, 40),
      current: redactText(area.oneThing?.current || "", 170),
      supports: redactText(area.oneThing?.why || "", 170),
      doneWhen: redactText(area.oneThing?.next_proof || "", 170),
    },
    supportGaps: (area.nextMoves || []).slice(0, 3).map((item) => redactText(item, 150)),
    queue: {
      open: queue?.count ?? 0,
      status: queue?.status || "clear",
    },
  };
}

function buildMarkdownArea(slug, name, tier, markdown, queue) {
  const scorecard = parseScorecard(markdown);
  return {
    slug,
    name,
    tier,
    status: scorecard.risk.toLowerCase().includes("high") ? "red" : "yellow",
    missionLink: tier === "Support" ? "support lane" : "primary track",
    scorecard,
    oneThing: parseOneThing(markdown, name),
    supportGaps: parseBullets(markdown, "Next Recommended Actions", 3),
    queue: {
      open: queue?.count ?? 0,
      status: queue?.status || "clear",
    },
  };
}

function safeQueueLabel(label) {
  return redactText(label, 80)
    .replace(/Legacy Captain outbox/i, "Captain source artifacts")
    .replace(/\binbox\b/gi, "intake");
}

function buildQueues(queues) {
  return queues.map((item) => ({
    label: safeQueueLabel(item.label),
    count: Number(item.count || 0),
    status: item.status === "clear" ? "clear" : "open",
  }));
}

function sumOpenQueues(queues) {
  return queues.filter((item) => item.count > 0).length;
}

function buildBudgetSummary(rows) {
  const income = rows
    .filter((item) => item.goal_type === "inflow")
    .reduce((sum, item) => sum + Number(item.monthly_target || 0), 0);
  const outflow = rows
    .filter((item) => item.goal_type === "outflow")
    .reduce((sum, item) => sum + Number(item.monthly_target || 0), 0);

  return {
    incomeTarget: money(income),
    outflowTarget: money(outflow),
    targetCashFlow: money(income - outflow),
    categories: rows.map((item) => ({
      label: redactText(item.category, 40),
      value: money(item.monthly_target),
      type: item.goal_type === "inflow" ? "Income" : "Outflow",
    })),
  };
}

function validateConfig(config) {
  assert(config && typeof config === "object" && !Array.isArray(config), "dashboard source config must be an object.");
  assert(config.schemaVersion === 2, "dashboard source config schemaVersion must be 2.");
  assert(config.route === "/dashboard", "dashboard route must remain /dashboard.");
  assert(Array.isArray(config.pageOrder), "dashboard pageOrder must be an array.");
  config.pageOrder.forEach((key) => assert(pageKeySet.has(key), `unknown page key in pageOrder: ${key}`));
}

function walkStrings(value, path = "root", found = []) {
  if (typeof value === "string") {
    found.push([path, value]);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${path}[${index}]`, found));
    return found;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => walkStrings(item, `${path}.${key}`, found));
  }
  return found;
}

function walkKeys(value, path = "root", found = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkKeys(item, `${path}[${index}]`, found));
    return found;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      found.push([`${path}.${key}`, key]);
      walkKeys(item, `${path}.${key}`, found);
    });
  }
  return found;
}

function validateNoLeaks(data) {
  const violations = [];

  for (const [path, value] of walkStrings(data)) {
    for (const rule of leakRules) {
      if (rule.pattern.test(value)) {
        violations.push(`${path}: ${rule.name}`);
      }
    }
  }

  for (const [path, key] of walkKeys(data)) {
    if (/\b(email|phone|address|leadId|messageBody|transcript|sourceRoot|absolutePath|accountNumber)\b/i.test(key)) {
      violations.push(`${path}: blocked key ${key}`);
    }
  }

  assert(violations.length === 0, `private dashboard leak check failed:\n${violations.join("\n")}`);
}

function validateSnapshot(data) {
  assert(data.schemaVersion === 2, "generated schemaVersion must be 2.");
  assert(data.route === "/dashboard", "generated route must be /dashboard.");
  assert(Array.isArray(data.nav) && data.nav.length >= 5, "nav must contain private dashboard tabs.");
  assert(Array.isArray(data.pages) && data.pages.length === data.nav.length, "pages must match nav length.");
  assert(Array.isArray(data.metrics) && data.metrics.length >= 6, "metrics must contain meaningful cards.");
  assert(Array.isArray(data.areas) && data.areas.length >= 7, "areas must include core and support lanes.");
  assert(data.privacy && data.privacy.status === "passed", "privacy status must be passed.");

  data.nav.forEach((item) => assert(pageKeySet.has(item.key), `unknown nav key: ${item.key}`));
  data.pages.forEach((page) => {
    assert(pageKeySet.has(page.key), `unknown page key: ${page.key}`);
    assert(Array.isArray(page.sections) && page.sections.length > 0, `${page.key} needs sections.`);
  });

  validateNoLeaks(data);
}

function renderDataModule(data) {
  const json = JSON.stringify(data, null, 2);
  return `// Generated by scripts/generate-web-dashboard.mjs. Do not edit manually.\n\nexport const dashboardData = ${json} as const;\n\nexport type DashboardData = typeof dashboardData;\n`;
}

function cloneWithoutSnapshot(config) {
  const nextConfig = { ...config };
  delete nextConfig.snapshot;
  return nextConfig;
}

function buildDashboardFromSnapshot(config) {
  validateConfig(config);
  assert(config.snapshot && typeof config.snapshot === "object" && !Array.isArray(config.snapshot), "dashboard source must include a committed redacted snapshot. Run npm run refresh:dashboard:aos locally.");
  validateSnapshot(config.snapshot);
  assert(config.snapshot.route === config.route, "committed dashboard snapshot route must match source route.");
  assert(config.snapshot.title === config.title, "committed dashboard snapshot title must match source title.");
  assert(config.snapshot.updated === config.updated, "committed dashboard snapshot updated date must match source updated date.");
  return config.snapshot;
}

function buildDashboardFromAos(config) {
  validateConfig(config);

  const aos = readJsonAos(inputs.aosDashboard);
  const wealthRows = csvParse(readAos(inputs.wealthDashboard));
  const budgetRows = csvParse(readAos(inputs.wealthBudget));
  const cjHandoff = readAos(inputs.cjCincoHandoff);
  const ahHandoff = readAos(inputs.alignedHarmonicsHandoff);
  readAos(inputs.cjCincoReadme);

  const latestWealth = wealthRows.at(-1) || {};
  const budget = buildBudgetSummary(budgetRows);
  const queues = buildQueues(aos.queues || []);
  const queueByLabel = new Map((aos.queues || []).map((item) => [item.label, item]));
  const areas = [
    ...(aos.areas || []).map((area) => buildAreaFromDashboard(area, queueByLabel.get(`${area.name === "VTC" ? "VTC" : area.name} inbox`))),
    buildMarkdownArea("aligned-harmonics", "Aligned Harmonics", "Support", ahHandoff, queueByLabel.get("Aligned Harmonics inbox")),
    buildMarkdownArea("cj-cinco", "CJ Cinco", "Support", cjHandoff, queueByLabel.get("CJ Cinco inbox")),
    {
      slug: "altered-states",
      name: "Altered States",
      tier: "Support",
      status: "yellow",
      missionLink: "support lane",
      scorecard: {
        grade: "B",
        momentum: "Low by design",
        risk: "Medium",
        upgrade: "Keep parked support light and approval-gated.",
      },
      oneThing: {
        owner: "Altered States",
        current: "Process new support items in light mode only.",
        supports: "MAP service-count proof path and owner-approved support boundaries.",
        doneWhen: "The next item is routed, logged, or held for approval without activating a larger system.",
      },
      supportGaps: ["Keep broad expansion parked unless explicitly activated."],
      queue: {
        open: queueByLabel.get("Altered States inbox")?.count ?? 0,
        status: queueByLabel.get("Altered States inbox")?.status || "clear",
      },
    },
  ];

  const projectionCount = Number(aos.projectionStatus?.count ?? aos.captain?.projection?.count ?? 0);
  const projectionStatus = redactText(aos.projectionStatus?.status || aos.captain?.projection?.status || "unknown", 40);
  const vtcRunway = aos.unifiedDashboard?.vtcRunway || {};
  const vtcSales = aos.unifiedDashboard?.vtcSalesFloor || {};
  const social = aos.unifiedDashboard?.socialMedia || {};

  const captainOneThing = {
    owner: "Captain",
    current: redactText(aos.captain?.oneThing?.current || "Work the highest-leverage AOS proof.", 170),
    supports: redactText(aos.captain?.oneThing?.why || "Current AOS priority stack.", 170),
    doneWhen: redactText(aos.captain?.oneThing?.next_proof || "A visible proof is logged in the owning source.", 170),
  };

  const vtcSafeNextMove = "Move the highest-priority VTC service handoff or follow-up proof, then update the owning record locally.";
  const nav = config.pageOrder.map((key) => ({ key, title: pageTitles[key] }));
  const builtAt = aos.meta?.builtAt
    ? `${aos.meta.builtAt}${String(aos.meta.builtAt).includes("T") ? "" : "T00:00:00"}`
    : `${config.updated}T00:00:00`;

  const snapshot = {
    schemaVersion: 2,
    route: "/dashboard",
    title: config.title,
    updated: config.updated,
    generatedAt: builtAt,
    dataDate: redactText(aos.meta?.today || config.updated, 40),
    summary: redactText(config.summary, 220),
    access: {
      label: "Cloudflare Access",
      value: "Existing gate",
      detail: "Static dashboard content is protected by the existing CJ Cinco Access application before the route loads.",
    },
    privacy: {
      status: "passed",
      label: "Redacted export",
      detail: "Only whitelisted dashboard summaries, counts, status labels, and approved Wealth totals are rendered.",
      checks: [
        "No contact-pattern strings",
        "No local source paths",
        "No raw communication text",
        "No account-like identifiers",
        "No row-level private evidence",
      ],
    },
    freshness: {
      status: projectionStatus,
      label: projectionCount > 0 ? `${projectionCount} freshness item(s)` : "Fresh",
      checkedAt: redactText(aos.projectionStatus?.checkedAt || aos.meta?.builtAt || builtAt, 60),
      detail: projectionCount > 0
        ? "Captain projection needs a sync pass before treating every current surface as fresh."
        : "Captain projection reports fresh at the latest local dashboard build.",
    },
    nav,
    metrics: [
      metric("Access", "Gated", "Cloudflare Access remains the authentication boundary.", "green"),
      metric("Freshness", projectionCount > 0 ? `${projectionCount} sync` : "Fresh", "Projection freshness from the local AOS dashboard.", projectionCount > 0 ? "watch" : "good"),
      metric("Pace", redactText(aos.pace?.statusLabel || "n/a", 40), "One Thing pace from the generated local dashboard summary.", aos.pace?.status === "behind" ? "alert" : "good"),
      metric("Areas", `${areas.length}`, "Core and support lanes mirrored as redacted status cards.", "cyan"),
      metric("Open Queues", `${sumOpenQueues(queues)}`, "Queue counts only; item names and raw files are not exported.", sumOpenQueues(queues) > 0 ? "watch" : "good"),
      metric("Net Worth", money(latestWealth.net_worth), `Latest approved Wealth dashboard row: ${latestWealth.month || "n/a"}.`, "gold"),
      metric("VTC Target", redactText(vtcRunway.target || "$1,923+", 40), "Current revenue proof target, with record-level details withheld.", "green"),
      metric("Social", `${social.header?.scheduled ?? 0} scheduled`, "Approval-gated content queue counts only.", "cyan"),
    ],
    captain: {
      status: redactText(aos.captain?.status || "yellow", 40),
      signal: redactText(aos.captain?.signal || "not complete", 60),
      oneThing: captainOneThing,
      readout: {
        posture: redactText(aos.captain?.readout?.posture || "", 120),
        movement: redactText(aos.captain?.readout?.movement || "", 180),
        exposure: redactText(aos.captain?.readout?.exposure || "", 180),
      },
    },
    areas,
    queues,
    wealth: {
      month: redactText(latestWealth.month || "n/a", 24),
      income: money(latestWealth.income),
      expenses: money(latestWealth.expenses),
      cashFlow: money(latestWealth.cash_flow),
      assets: money(latestWealth.assets),
      liabilities: money(latestWealth.liabilities),
      netWorth: money(latestWealth.net_worth),
      dataStatus: redactText(latestWealth.data_status || "n/a", 80),
      budget,
    },
    vtc: {
      status: redactText(vtcRunway.statusLabel || "Needs push", 60),
      target: redactText(vtcRunway.target || "$1,923+", 40),
      deadline: redactText(vtcRunway.deadline || "2026-07-31", 40),
      currentWeekCollected: redactText(vtcRunway.currentWeekCollected || "$0", 40),
      gapToTarget: redactText(vtcRunway.gapToTarget || "", 40),
      daysRemaining: Number(vtcRunway.daysRemaining || 0),
      counts: {
        dueFollowups: Number(vtcRunway.dueFollowups || vtcSales.header?.overdue || 0),
        warmOpportunities: Number(vtcRunway.warmHighLeads || vtcSales.header?.warmLeads || 0),
        partnerTouches: Number(vtcSales.header?.partnerWorkshopTouches || 0),
        proofProgressPct: Number(vtcSales.header?.proofProgressPct || 0),
      },
      nextMove: vtcSafeNextMove,
    },
    contentSocial: {
      status: "Approval-gated",
      activeTotal: Number(social.header?.activeTotal || 0),
      scheduled: Number(social.header?.scheduled || 0),
      blocked: Number(social.header?.blocked || 0),
      posted: Number(social.header?.posted || 0),
      attention: Number(social.header?.attention || 0),
      pendingPackets: Number(social.pendingPackets?.packetCount || 0),
      weekRows: (social.visuals?.weekRows || []).map((item) => ({
        label: redactText(item.label, 40),
        dateRange: redactText(item.dateRange, 40),
        scheduled: Number(item.scheduled || 0),
        posted: Number(item.posted || 0),
        blocked: Number(item.blocked || 0),
        target: Number(item.target || 0),
      })),
      platforms: (social.visuals?.platformRows || []).map((item) => ({
        label: redactText(item.platformLabel, 40),
        scheduled: Number(item.scheduled || 0),
        blocked: Number(item.blocked || 0),
        posted: Number(item.posted || 0),
        total: Number(item.total || 0),
      })),
    },
    guardrails: {
      accessPlan: config.accessPlan.map((item) => redactText(item, 180)),
      sourceContract: config.sourceContract.map((item) => redactText(item, 180)),
      sourceLabels: [
        "AOS generated dashboard summary",
        "Master Command current readout",
        "CJ Cinco lane summaries",
        "Approved Wealth dashboard totals",
        "Approved Wealth budget totals",
      ],
    },
  };

  snapshot.pages = [
    {
      key: "overview",
      title: "Overview",
      kicker: "Command Mirror",
      summary: "The private route mirrors the local command dashboard as status, pressure, proof, and queue summaries.",
      sections: [
        section("Captain One Thing", "Current", [
          row("Current", snapshot.captain.oneThing.current, snapshot.captain.oneThing.supports, "gold"),
          row("Done when", "Proof visible", snapshot.captain.oneThing.doneWhen, "green"),
        ], "gold"),
        section("Operating Readout", "Captain", [
          row("Posture", snapshot.captain.readout.posture, "", "watch"),
          row("Movement", "Active", snapshot.captain.readout.movement, "cyan"),
          row("Exposure", "Watch", snapshot.captain.readout.exposure, "alert"),
        ], "watch"),
        section("Maintain / Advance", "Lens", [
          row("Maintain", "Protect stability", "Health, family, home function, finance visibility, and active service loops stay visible first.", "green"),
          row("Advance", "Move proof", "Revenue proof, public-persona clarity, Wealth decisions, and Aligned Harmonics source clarity advance only when maintenance stays realistic.", "cyan"),
        ], "green"),
      ],
    },
    {
      key: "cj-cinco",
      title: "CJ Cinco",
      kicker: "Public Persona",
      summary: "CJ Cinco stays the outward-facing public identity while the operating system remains private and local.",
      sections: [
        section("Lane Status", "CJ Cinco", [
          row("Role", "Public persona", "Music, healing, business, life, and communication-with-the-world context stay source-clear.", "cyan"),
          row("Current focus", "Bio and profile clarity", parseOneThing(cjHandoff, "CJ Cinco").current, "gold"),
          row("Approval gate", "Publishing held", "Posting, scheduling, public profile edits, and product activation still require explicit approval.", "alert"),
        ], "cyan"),
        section("Roadmap", "Sequence", parseBullets(cjHandoff, "Next Recommended Actions", 5).map((item, index) => row(`Step ${index + 1}`, item, "", index === 0 ? "gold" : "neutral")), "gold"),
      ],
    },
    {
      key: "areas",
      title: "Area State",
      kicker: "AOS Structure",
      summary: "Core and support lanes are shown as compact redacted cards with status, grade, risk, and next proof.",
      sections: [
        section("Core Lanes", "Health / People / Home / Wealth / VTC", areas.filter((area) => area.tier === "Core").map((area) => row(area.name, `${area.scorecard.grade} - ${titleCase(area.status)}`, area.scorecard.upgrade, area.status === "red" ? "alert" : "watch")), "watch"),
        section("Support Lanes", "Aligned Harmonics / CJ Cinco / Altered States", areas.filter((area) => area.tier === "Support").map((area) => row(area.name, `${area.scorecard.grade} - ${titleCase(area.status)}`, area.scorecard.upgrade, "cyan")), "cyan"),
      ],
    },
    {
      key: "wealth",
      title: "Wealth",
      kicker: "Approved Totals",
      summary: "Only summary Wealth metrics and approved budget totals are exported.",
      sections: [
        section("Latest Month", snapshot.wealth.month, [
          row("Income", snapshot.wealth.income, "Approved dashboard summary.", "green"),
          row("Expenses", snapshot.wealth.expenses, "Approved dashboard summary.", "watch"),
          row("Cash Flow", snapshot.wealth.cashFlow, "Approved dashboard summary.", Number(latestWealth.cash_flow || 0) >= 0 ? "green" : "alert"),
          row("Net Worth", snapshot.wealth.netWorth, snapshot.wealth.dataStatus, "gold"),
        ], "gold"),
        section("Budget Targets", "Monthly", [
          row("Income target", snapshot.wealth.budget.incomeTarget, "", "green"),
          row("Outflow target", snapshot.wealth.budget.outflowTarget, "", "watch"),
          row("Target cash flow", snapshot.wealth.budget.targetCashFlow, "", "cyan"),
        ], "cyan"),
      ],
    },
    {
      key: "vtc",
      title: "VTC",
      kicker: "Revenue Pressure",
      summary: "VTC appears as runway, follow-up pressure, and proof progress without row-level service records.",
      sections: [
        section("Runway", "Target", [
          row("Status", snapshot.vtc.status, `Deadline: ${snapshot.vtc.deadline}.`, "watch"),
          row("Target", snapshot.vtc.target, `Gap: ${snapshot.vtc.gapToTarget || "n/a"}.`, "gold"),
          row("Current week", snapshot.vtc.currentWeekCollected, `${snapshot.vtc.daysRemaining} day(s) remaining in the push window.`, "cyan"),
        ], "watch"),
        section("Follow-Up Pressure", "Counts", [
          row("Due follow-ups", snapshot.vtc.counts.dueFollowups, "Count only; no row details exported.", snapshot.vtc.counts.dueFollowups > 0 ? "alert" : "good"),
          row("Warm opportunities", snapshot.vtc.counts.warmOpportunities, "Count only; no names or contact data exported.", "watch"),
          row("Partner touches", snapshot.vtc.counts.partnerTouches, "Count only.", "cyan"),
          row("Next move", "Service proof", snapshot.vtc.nextMove, "green"),
        ], "alert"),
      ],
    },
    {
      key: "content",
      title: "Content / Social",
      kicker: "Approval-Gated",
      summary: "The content page shows queue health and platform counts only; no post copy is exported.",
      sections: [
        section("Queue Health", "Social Raw", [
          row("Active rows", snapshot.contentSocial.activeTotal, "Approved/scheduled/social rows counted without copy text.", "cyan"),
          row("Scheduled", snapshot.contentSocial.scheduled, "", "green"),
          row("Blocked", snapshot.contentSocial.blocked, "Requires review or platform proof before movement.", snapshot.contentSocial.blocked > 0 ? "alert" : "good"),
          row("Pending packets", snapshot.contentSocial.pendingPackets, "Draft packet counts only.", "watch"),
        ], "cyan"),
        section("Platform Counts", "Rows", snapshot.contentSocial.platforms.map((item) => row(item.label, `${item.scheduled} scheduled`, `${item.posted} posted, ${item.blocked} blocked, ${item.total} total.`, item.blocked > 0 ? "watch" : "green")), "green"),
      ],
    },
    {
      key: "coaching",
      title: "Coaching",
      kicker: "Signals",
      summary: "Coaching strips convert AOS pressure into action language without exposing raw evidence.",
      sections: [
        section("Leverage Now", "Move Order", (aos.leverageNow?.moveOrder || []).slice(0, 5).map((item, index) => row(`${index + 1}. ${redactText(item.area, 40)}`, redactText(item.title, 110), redactText(item.nextProof, 150), index === 0 ? "gold" : "neutral")), "gold"),
        section("Support Gaps", "Area Needs", areas.slice(0, 6).map((area) => row(area.name, area.scorecard.risk, area.scorecard.upgrade, area.status === "red" ? "alert" : "watch")), "watch"),
      ],
    },
    {
      key: "system",
      title: "System",
      kicker: "Access / Generator",
      summary: "The system page documents the route contract, source boundaries, noindex posture, and privacy checks.",
      sections: [
        section("Access Plan", "Cloudflare", snapshot.guardrails.accessPlan.map((item, index) => row(`Gate ${index + 1}`, item, "", "green")), "green"),
        section("Source Contract", "Exporter", snapshot.guardrails.sourceContract.map((item, index) => row(`Rule ${index + 1}`, item, "", "cyan")), "cyan"),
        section("Privacy Checks", "Build Gate", snapshot.privacy.checks.map((item, index) => row(`Check ${index + 1}`, item, "Deterministic final-output scan.", "green")), "green"),
      ],
    },
  ];

  validateSnapshot(snapshot);
  return snapshot;
}

function buildDashboard() {
  const config = JSON.parse(readFileSync(sourcePath, "utf8"));
  return refreshSource ? buildDashboardFromAos(config) : buildDashboardFromSnapshot(config);
}

const dashboard = buildDashboard();
const rendered = renderDataModule(dashboard);

if (refreshSource) {
  const currentConfig = JSON.parse(readFileSync(sourcePath, "utf8"));
  writeFileSync(sourcePath, `${JSON.stringify({ ...cloneWithoutSnapshot(currentConfig), snapshot: dashboard }, null, 2)}\n`, "utf8");
}

if (verifyOnly) {
  const current = readFileSync(outputPath, "utf8");
  assert(current === rendered, "generated dashboard data is stale. Run npm run generate:dashboard.");
  console.log("Private AOS Mirror Max source, generated data, and leak checks verified.");
} else {
  writeFileSync(outputPath, rendered, "utf8");
  console.log(`Generated ${outputPath}`);
}

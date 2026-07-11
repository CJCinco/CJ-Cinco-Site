#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const aosRoot = resolve(repoRoot, "../../../..");
const localDashboardRoot = resolve(aosRoot, "00 Master Command/dashboard-system");
const localPagesRoot = resolve(localDashboardRoot, "pages");
const localAssetsRoot = resolve(localDashboardRoot, "assets");
const outputRoot = resolve(repoRoot, "public/dashboard");
const manifestPath = resolve(repoRoot, "dashboard-source/web-dashboard.json");
const verifyOnly = process.argv.includes("--verify");

const pageFiles = [
  "index.html",
  "captain.html",
  "xo-comms.html",
  "vtc-sales-floor.html",
  "social-media.html",
  "purchases.html",
  "areas.html",
  "wealth.html",
];

const staticAssetFiles = [
  "dashboard.css",
  "dashboard.js",
  "command-views.css",
  "wealth.css",
  "wealth.js",
];

const safeText = new Set([
  "AOS Dashboard",
  "Captain",
  "XO Comms",
  "VTC",
  "Social Media",
  "Purchases",
  "Area State",
  "Wealth",
  "Health",
  "The People",
  "Home",
  "Vero Tech Care",
  "Aligned Harmonics",
  "CJ Cinco",
  "Green Bodyworks",
  "Emerald Acres",
  "Altered States",
  "Core",
  "Support",
  "Past",
  "Current",
  "Next",
  "Status",
  "Priority",
  "Owner",
  "Source",
  "Sources",
  "Loading",
  "Open",
  "Clear",
  "Active",
  "Paused",
  "Blocked",
  "Scheduled",
  "Posted",
  "Overdue",
  "Urgent",
  "High",
  "Medium",
  "Low",
  "Grade",
  "Risk",
  "Inbox",
  "Queue",
  "Queues",
  "Today",
  "Tomorrow",
  "This Week",
  "This Month",
  "Done when",
  "Captain One Thing",
  "Captain projection stale",
  "Leverage Now",
  "Move order",
  "Pressure flags",
  "Next proof",
  "Next correction",
  "Direct production choices",
  "Highest leverage first",
  "Today's work by category",
  "No classified work cards yet",
  "Refresh after a Codex session lands today.",
  "->",
  "Prep Radar",
  "Upcoming Events",
  "ACTION",
  "REVIEW",
  "SEND",
  "DONE",
  "Reply / Send",
  "Schedule",
  "Wait",
  "AOS Dashboard sources",
]);

const safeCapitalizedWords = new Set([
  "AOS", "Captain", "XO", "VTC", "Linear", "Health", "People", "Home", "Wealth",
  "Vero", "Tech", "Care", "Aligned", "Harmonics", "CJ", "Cinco", "Green", "Bodyworks",
  "Emerald", "Acres", "Altered", "States", "Social", "Media", "Apple", "Obsidian",
  "Codex", "MAP", "Maintain", "Advance", "One", "Thing", "Dashboard", "Manager",
  "Core", "Support", "Private", "Current", "Next", "Past", "Status", "Priority",
  "Source", "Sources", "Open", "Clear", "Active", "Paused", "Blocked", "Scheduled",
  "Posted", "Overdue", "Urgent", "High", "Medium", "Low", "Today", "Tomorrow",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December",
]);

const redactionSentinels = {
  contact: "[hidden]",
  source: "[local source hidden]",
  communication: "[private communication hidden]",
  health: "[private health detail]",
  family: "[private family detail]",
  household: "[private household detail]",
  client: "[private client detail]",
  finance: "[private financial detail]",
  social: "[private social content hidden]",
  operational: "[private operational detail]",
};

const pseudonymMaps = new Map();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function pseudonym(category, rawValue) {
  if (!pseudonymMaps.has(category)) pseudonymMaps.set(category, new Map());
  const values = pseudonymMaps.get(category);
  if (!values.has(rawValue)) values.set(rawValue, values.size + 1);
  const number = String(values.get(rawValue)).padStart(2, "0");
  const label = category === "person" ? "Private person" : category === "event" ? "Private event" : "Private item";
  return `${label} ${number}`;
}

function recordRedaction(_original, sanitized) {
  return sanitized;
}

function categoryForArea(areaName) {
  if (areaName === "Health") return "health";
  if (areaName === "The People") return "family";
  if (areaName === "Home") return "household";
  if (areaName === "Wealth") return "finance";
  if (areaName === "Vero Tech Care") return "client";
  return "operational";
}

function categoryForPath(path, value, root) {
  const top = String(path[0] ?? "");
  const key = String(path.at(-1) ?? "");
  const lowerKey = key.toLowerCase();
  const parentKeys = path.map(String);

  if (/phone|email|streetaddress|mailingaddress|accountnumber|routingnumber|passcode|password|token|secret/i.test(lowerKey)) {
    return "contact";
  }

  if (["source", "path", "sourcePath", "projection", "oneThingLog", "actionUrl", "originalPacket", "sourceBasis"].includes(key)) {
    return "source";
  }

  if (top === "meta" && key === "sourceRoot") return "source";
  if (top === "pace" && key === "source") return "source";
  if (top === "energyFlow" && (key === "source" || parentKeys.includes("activityLog") && typeof value === "string")) return "source";
  if (top === "alignmentSignal" && ["lastAlignedMove", "nextCorrectingMove", "source"].includes(key)) return "operational";

  if (top === "captain" && ["current", "why", "next_proof", "posture", "movement", "exposure", "reason", "action", "summary"].includes(key)) {
    return "operational";
  }

  if (top === "events" || top === "urgentEvent") {
    if (key === "name") return "event";
    if (["date", "next_occurrence"].includes(key)) return "operational";
  }

  if (top === "milestones" && ["name", "title", "detail", "summary", "date"].includes(key)) return key === "name" ? "event" : "operational";

  if (top === "queues") {
    if (key === "path") return "source";
    if (parentKeys.includes("items") && typeof value === "string") return "item";
    if (["id", "title", "detail", "next_step", "hierarchy"].includes(key)) return "item";
  }

  if (top === "allItems" && parentKeys.includes("items")) {
    if (["source", "path", "actionUrl"].includes(key)) return "source";
    if (["id", "title", "detail", "next_step", "hierarchy", "draft", "need"].includes(key)) return "item";
  }

  if (top === "captainDesk" && ["id", "title", "name", "body", "content", "preview", "previewLines", "fullContent", "summary", "draft", "need"].includes(key)) {
    return /body|content|preview|draft/i.test(key) ? "communication" : "item";
  }

  if (top === "xoComms") {
    const safeXoKeys = new Set(["surfaceLabel", "status", "statusLabel", "action", "urgency", "priority", "platform", "label", "key", "kind", "lane", "date", "today", "checkedAt", "window", "count", "enabled"]);
    if (typeof value === "string" && !safeXoKeys.has(key)) return /body|content|preview|draft|message|need/i.test(key) ? "communication" : "person";
  }

  if (top === "leverageNow") {
    const safeLeverageKeys = new Set(["label", "area", "rank", "status", "count", "window", "kind"]);
    if (typeof value === "string" && !safeLeverageKeys.has(key)) return "operational";
  }

  if (top === "projectionStatus") {
    if (["source", "projection", "reason", "action", "oneThingLog", "summary"].includes(key)) return key === "source" ? "source" : "operational";
  }

  if (top === "sources" && ["path", "purpose", "name"].includes(key)) return key === "path" ? "source" : "operational";

  if (top === "areas") {
    const areaIndex = Number(path[1]);
    const areaName = Number.isInteger(areaIndex) ? root?.areas?.[areaIndex]?.name : "";
    if (["current", "why", "next_proof", "upgrade", "detail", "summary"].includes(key)) return categoryForArea(areaName);
    if (key === "risk" && typeof value === "string" && value.length > 40) return categoryForArea(areaName);
    if (parentKeys.includes("nextMoves") && typeof value === "string") return categoryForArea(areaName);
  }

  if (top === "unifiedDashboard") {
    const section = String(path[1] ?? "");
    if (section === "socialMedia" && /account|copy|preview|draft|packet|notes|verification|title|name/i.test(key)) return "social";
    if ((section === "vtcRunway" || section === "vtcSalesFloor") && /name|client|lead|contact|phone|email|service|note|detail|title|id|nextmove|next_step|draft|message|actualsent/i.test(key)) return "client";
    if (section === "wealth" && /description|memo|merchant|ledger|transaction|account|source/i.test(key)) return "finance";
  }

  return null;
}

function sanitizeNarrative(value) {
  let text = String(value);
  text = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[hidden]")
    .replace(/(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{4}\b/g, "[hidden]")
    .replace(/\b\d{1,6}\s+[A-Z0-9.'-]+(?:\s+[A-Z0-9.'-]+){0,4}\s+(?:ST|STREET|AVE|AVENUE|RD|ROAD|DR|DRIVE|LN|LANE|BLVD|BOULEVARD|CT|COURT|CIR|CIRCLE|WAY|TRL|TRAIL|PKWY|PARKWAY|PL|PLACE)\b/gi, "[hidden]")
    .replace(/\/Users\/[^\s<>'\"]+/g, "[local source hidden]")
    .replace(/(?:[A-Za-z0-9][A-Za-z0-9 _+.-]*\/)+[A-Za-z0-9][A-Za-z0-9 _+.-]*\.(?:md|csv|json|toml)\b/gi, "[local source hidden]")
    .replace(/https?:\/\/[^\s<>'\"]+/gi, "[hidden]")
    .replace(/\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|co)\b/gi, "[hidden]")
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[hidden]");

  if (/\b(client|lead|contact|family|relationship|reply|message|call|text|email|appointment|birthday|especially|with|from|for)\b/i.test(text)) {
    text = text.replace(/\b[A-Z][a-z]{2,}\b/g, (word, offset, full) => {
      const sentenceStart = offset === 0 || /[.!?]\s*$/.test(full.slice(0, offset));
      if (sentenceStart || safeCapitalizedWords.has(word)) return word;
      return pseudonym("person", word);
    });
  }

  return text;
}

function redactString(value, category) {
  if (category === "person" || category === "item" || category === "event") {
    return recordRedaction(value, pseudonym(category, value));
  }
  return recordRedaction(value, redactionSentinels[category] ?? redactionSentinels.operational);
}

function sanitizeTree(value, path = [], root = value) {
  if (Array.isArray(value)) return value.map((item, index) => sanitizeTree(item, [...path, index], root));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeTree(item, [...path, key], root)]));
  }
  if (typeof value !== "string") return value;

  const category = categoryForPath(path, value, root);
  if (category) return redactString(value, category);
  const sanitized = sanitizeNarrative(value);
  return recordRedaction(value, sanitized);
}

function elementCategory(fileName, classes, parentCategory, tagSource = "") {
  if (parentCategory) return parentCategory;
  const classSet = new Set(classes.split(/\s+/).filter(Boolean));
  const has = (...names) => names.some((name) => classSet.has(name));

  if (has("source-section")) return "source";
  if (fileName === "index.html" && has("projection-alert", "one-thing-panel", "leverage-primary", "leverage-move-list", "production-choice-list", "production-feedback-card", "production-session-panel", "dashboard-outbox-scroll", "file-summary", "area-grid", "events-panel")) return "operational";
  if (fileName === "captain.html" && has("captain-file-card", "file-preview", "file-full-content")) return "operational";
  if (fileName === "xo-comms.html" && has("xo-surface-item", "xo-item-draft", "xo-checkpoint-line")) return "communication";
  if (fileName === "vtc-sales-floor.html" && has("sales-row", "timeline-row", "basket-item", "sales-source-row")) return "client";
  if (fileName === "social-media.html" && has("social-row", "packet-draft", "packet-draft-body", "packet-draft-title", "packet-source", "packet-variant")) return "social";
  if (fileName === "purchases.html" && has("all-item-card", "item-next", "item-field")) return "operational";
  if (fileName === "areas.html" && has("area-state-card", "score-row", "area-radar-insight", "state-column", "agent-lane-summary", "source-link", "list")) return "operational";
  if (fileName === "wealth.html" && (has("ledger-description", "ledger-source", "entity-toggle") || /\bdata-ledger-row\b/i.test(tagSource))) return "finance";
  return null;
}

function placeholderForText(text, category) {
  const trimmed = text.trim();
  if (!trimmed || safeText.has(trimmed) || /^(?:\d+|[A-F][+-]?|yellow|green|red|blue|purple|primary track|supporting front|\d+\s+(?:open|current|queued|scheduled|posted|blocked))$/i.test(trimmed)) return text;
  const placeholder = category === "item" || category === "event" || category === "person"
    ? pseudonym(category, trimmed)
    : redactionSentinels[category] ?? redactionSentinels.operational;
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  return `${leading}${placeholder}${trailing}`;
}

function sanitizeTag(tag, category) {
  let output = tag.replace(/(["'])\.\.\/assets\//g, "$1assets/");
  output = output.replace(/\b(href|src|title|aria-label|data-[\w-]+|value|placeholder)=(["'])(.*?)\2/gi, (match, attr, quote, rawValue) => {
    let value = rawValue;
    if (attr.toLowerCase() === "href") {
      const plain = value.split("?")[0];
      const safePage = pageFiles.includes(plain);
      const safeAnchor = value.startsWith("#");
      if (!safePage && !safeAnchor && (/^(?:https?:|mailto:|tel:)/i.test(value) || value.includes("../") || /\.(?:md|csv|json|toml)(?:$|[?#])/i.test(value))) value = "#";
      return `${attr}=${quote}${value}${quote}`;
    }
    if (attr.toLowerCase() === "src" && value.includes("../")) value = value.replace(/^\.\.\//, "");
    if (attr.toLowerCase() === "src" || attr.toLowerCase() === "aria-label") return `${attr}=${quote}${sanitizeNarrative(value)}${quote}`;
    value = category ? placeholderForText(value, category).trim() : sanitizeNarrative(value);
    return `${attr}=${quote}${value}${quote}`;
  });
  return output;
}

function sanitizeInlineScript(text, sourceRoot) {
  const match = text.match(/^(\s*window\.AOS_DASHBOARD_DATA\s*=\s*)(\{.*\})(;\s*)$/s);
  if (!match) return sanitizeNarrative(text);
  const data = JSON.parse(match[2]);
  const sanitized = sanitizeTree(data, [], sourceRoot);
  return `${match[1]}${JSON.stringify(sanitized)}${match[3]}`;
}

function sanitizeHtml(rawHtml, fileName, sourceRoot) {
  const tokens = rawHtml.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/g) ?? [];
  const stack = [];
  let output = "";

  for (const token of tokens) {
    if (/^<\//.test(token)) {
      output += token;
      stack.pop();
      continue;
    }
    if (/^<!/.test(token)) {
      output += token;
      continue;
    }
    if (/^<[A-Za-z]/.test(token)) {
      const tagName = token.match(/^<([A-Za-z0-9-]+)/)?.[1]?.toLowerCase() ?? "";
      const className = token.match(/\bclass=(["'])(.*?)\1/i)?.[2] ?? "";
      const parentCategory = stack.at(-1)?.category ?? null;
      const category = elementCategory(fileName, className, parentCategory, token);
      output += sanitizeTag(token, category);
      if (!/\/>$/.test(token) && !["meta", "link", "img", "input", "br", "hr", "source"].includes(tagName)) stack.push({ tagName, category });
      continue;
    }

    const context = stack.at(-1);
    if (context?.tagName === "script") output += sanitizeInlineScript(token, sourceRoot);
    else if (context?.tagName === "style") output += token;
    else if (context?.category) output += placeholderForText(token, context.category);
    else output += sanitizeNarrative(token);
  }

  return output;
}

function parseCockpitChunk(source) {
  const marker = 'window.AOS_DASHBOARD_DATA_CHUNKS["cockpit-core"] = ';
  const start = source.indexOf(marker);
  assert(start >= 0, "cockpit-core data marker is missing");
  const jsonStart = start + marker.length;
  const jsonEnd = source.lastIndexOf(";");
  assert(jsonEnd > jsonStart, "cockpit-core data terminator is missing");
  return {
    prefix: source.slice(0, jsonStart),
    data: JSON.parse(source.slice(jsonStart, jsonEnd)),
    suffix: source.slice(jsonEnd),
  };
}

function schemaSignature(value) {
  if (Array.isArray(value)) return ["array", value.length, ...value.map(schemaSignature)];
  if (value && typeof value === "object") return ["object", ...Object.entries(value).map(([key, item]) => [key, schemaSignature(item)])];
  return typeof value;
}

function htmlSignature(value) {
  return (value.match(/<\/?[A-Za-z][^>]*>/g) ?? []).map((tag) => tag
    .replace(/\b(href|src|title|aria-label|data-[\w-]+|value|placeholder)=(["']).*?\2/gi, "$1=\"\"")
    .replace(/\?refresh=[^"']+/g, "?refresh="));
}

function navText(value) {
  const nav = value.match(/<nav class="war-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  return nav.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildArtifacts() {
  const localDashboard = JSON.parse(read(resolve(localAssetsRoot, "data/dashboard.json")));
  const sanitizedDashboard = sanitizeTree(localDashboard, [], localDashboard);
  assert(JSON.stringify(schemaSignature(localDashboard)) === JSON.stringify(schemaSignature(sanitizedDashboard)), "redaction changed the local dashboard schema");

  const localChunkSource = read(resolve(localAssetsRoot, "data/cockpit-core.js"));
  const chunk = parseCockpitChunk(localChunkSource);
  const sanitizedChunk = sanitizeTree(chunk.data, [], chunk.data);
  assert(JSON.stringify(schemaSignature(chunk.data)) === JSON.stringify(schemaSignature(sanitizedChunk)), "redaction changed the cockpit data schema");

  const artifacts = new Map();
  artifacts.set(manifestPath, `${JSON.stringify({
    schemaVersion: 3,
    route: "/dashboard",
    mode: "canonical-local-dashboard-mirror",
    structureSource: "generated local AOS dashboard package",
    visibleAdditions: [],
    redactions: [
      "natural-person and private-record names",
      "contact, account, credential, and local-path values",
      "raw communications and exact private narratives",
      "row-level client, social, purchase, and ledger details",
    ],
    outputs: [
      "public/dashboard/*.html",
      "public/dashboard/assets/",
    ],
  }, null, 2)}\n`);
  artifacts.set(resolve(outputRoot, "assets/data/dashboard.json"), `${JSON.stringify(sanitizedDashboard, null, 2)}\n`);
  artifacts.set(resolve(outputRoot, "assets/data/cockpit-core.js"), `${chunk.prefix}${JSON.stringify(sanitizedChunk)}${chunk.suffix}`);

  for (const asset of staticAssetFiles) artifacts.set(resolve(outputRoot, "assets", asset), read(resolve(localAssetsRoot, asset)));

  for (const page of pageFiles) {
    const localHtml = read(resolve(localPagesRoot, page));
    const sanitizedHtml = sanitizeHtml(localHtml, page, localDashboard);
    const localSignature = htmlSignature(localHtml);
    const sanitizedSignature = htmlSignature(sanitizedHtml);
    const mismatch = localSignature.findIndex((tag, index) => tag !== sanitizedSignature[index]);
    assert(mismatch === -1 && localSignature.length === sanitizedSignature.length, `${page} DOM structure changed during redaction at tag ${mismatch}: ${localSignature[mismatch]} != ${sanitizedSignature[mismatch]}`);
    assert(navText(localHtml) === navText(sanitizedHtml), `${page} navigation labels or order changed`);
    artifacts.set(resolve(outputRoot, page), sanitizedHtml);
  }

  return { artifacts, localDashboard, sanitizedDashboard };
}

function runPrivacyChecks(artifacts) {
  const renderedHtml = [...artifacts.entries()]
    .filter(([path]) => path.endsWith(".html"))
    .map(([, content]) => content)
    .join("\n");

  const leakRules = [
    ["email address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    ["phone number", /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{4}\b/],
    ["street address", /\b\d{1,6}\s+[A-Z0-9.'-]+(?:\s+[A-Z0-9.'-]+){0,4}\s+(?:ST|STREET|AVE|AVENUE|RD|ROAD|DR|DRIVE|LN|LANE|BLVD|BOULEVARD|CT|COURT|CIR|CIRCLE|WAY|TRL|TRAIL|PKWY|PARKWAY|PL|PLACE)\b/i],
    ["local path", /\/Users\/|Library\/Mobile Documents|com~apple~CloudDocs|iCloud~md~obsidian/i],
    ["relative local source", /(?:[A-Za-z0-9][A-Za-z0-9 _+.-]*\/)+[A-Za-z0-9][A-Za-z0-9 _+.-]*\.(?:md|csv|json|toml)\b/i],
    ["long account-like number", /\b(?:\d[ -]?){13,19}\b/],
    ["old private-mirror UI", /Private AOS Mirror Max|Private CJ Cinco route|Protection Contract|Return to public site|Generator Contract/i],
  ];

  for (const [name, pattern] of leakRules) {
    const hit = [...artifacts.entries()].find(([path, content]) => /\.(?:html|json|js)$/.test(path) && pattern.test(content));
    assert(!hit, `privacy check found ${name}${hit ? ` in ${hit[0]}` : ""}`);
  }
  assert(!/\b(password|passcode|api[_ -]?key|bearer token|session token|reset link|two[- ]factor|2fa|verification code)\b/i.test(renderedHtml), "privacy check found a rendered credential marker");

  const fixture = sanitizeNarrative("Follow up with Zoranda Quill at unseen.person@example.test or +44 20 7946 0958.");
  assert(!/Zoranda|Quill|unseen\.person|7946/.test(fixture), "privacy fixture was not fully redacted");
  const messageFixture = sanitizeTree({ xoComms: { cards: [{ body: "ordinary words with no leak markers" }] } });
  assert(messageFixture.xoComms.cards[0].body === redactionSentinels.communication, "field-path communication redaction failed");

}

function verifyStaticAssets(artifacts) {
  for (const asset of staticAssetFiles) {
    const source = read(resolve(localAssetsRoot, asset));
    const generated = artifacts.get(resolve(outputRoot, "assets", asset));
    assert(hash(source) === hash(generated), `${asset} differs from the canonical local asset`);
  }
}

function main() {
  const { artifacts } = buildArtifacts();
  runPrivacyChecks(artifacts);
  verifyStaticAssets(artifacts);

  if (verifyOnly) {
    for (const [path, expected] of artifacts) {
      assert(existsSync(path), `generated dashboard artifact is missing: ${path}`);
      assert(read(path) === expected, `generated dashboard artifact is stale: ${path}`);
    }
    console.log("Canonical dashboard mirror, structural parity, and privacy checks passed.");
    return;
  }

  rmSync(outputRoot, { recursive: true, force: true });
  for (const [path, content] of artifacts) write(path, content);
  console.log(`Generated redacted canonical dashboard mirror at ${outputRoot}`);
}

main();

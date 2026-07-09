#!/usr/bin/env node

const defaultUrls = [
  "https://cjcinco.com/dashboard",
  "https://www.cjcinco.com/dashboard",
  "https://cj-cinco-site.pages.dev/dashboard"
];

const urls = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const targets = urls.length > 0 ? urls : defaultUrls;

const dashboardSignatures = [
  /CJ Cinco Dashboard/i,
  /Cloudflare Access gate required/i,
  /generated-dashboard/i,
  /dashboardData/i
];

const accessSignatures = [
  /cloudflare access/i,
  /cloudflareaccess\.com/i,
  /\/cdn-cgi\/access/i,
  /cf-access/i
];

function textMatches(patterns, value) {
  return patterns.some((pattern) => pattern.test(value));
}

async function checkTarget(url) {
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "cj-cinco-private-dashboard-verifier/1.0"
    }
  });

  const location = response.headers.get("location") ?? "";
  const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("text") || contentType.includes("html")
    ? await response.text()
    : "";

  const status = response.status;
  const redirectedToAccess = [301, 302, 303, 307, 308].includes(status) && textMatches(accessSignatures, location);
  const accessLoginBody = textMatches(accessSignatures, body);
  const deniedByGate = [401, 403].includes(status);
  const leakedDashboard = textMatches(dashboardSignatures, body);

  if (leakedDashboard) {
    return {
      url,
      ok: false,
      status,
      location,
      xRobotsTag,
      reason: "dashboard HTML is reachable without authentication"
    };
  }

  if (redirectedToAccess || accessLoginBody || deniedByGate) {
    return {
      url,
      ok: true,
      status,
      location,
      xRobotsTag,
      reason: redirectedToAccess ? "redirected to Cloudflare Access" : "blocked by an access gate"
    };
  }

  return {
    url,
    ok: false,
    status,
    location,
    xRobotsTag,
    reason: "expected Cloudflare Access login, redirect, or denial"
  };
}

const results = await Promise.all(targets.map(checkTarget));

for (const result of results) {
  const outcome = result.ok ? "PASS" : "FAIL";
  const location = result.location ? ` location=${result.location}` : "";
  const robots = result.xRobotsTag ? ` x-robots-tag=${JSON.stringify(result.xRobotsTag)}` : "";
  console.log(`${outcome} ${result.url} status=${result.status}${location}${robots} - ${result.reason}`);
}

if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}

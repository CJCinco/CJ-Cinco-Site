#!/usr/bin/env node

const defaultUrls = [
  "https://cjcinco.com/dashboard",
  "https://www.cjcinco.com/dashboard",
  "https://cj-cinco-site.pages.dev/dashboard"
];

const urls = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const targets = urls.length > 0 ? urls : defaultUrls;

const dashboardSignatures = [
  /Private AOS Mirror Max/i,
  /CJ Cinco Private Dashboard/i,
  /Private CJ Cinco route/i,
  /CJ Cinco Dashboard/i,
  /generated-dashboard/i,
  /dashboardData/i
];

const accessSignatures = [
  /cloudflareaccess\.com/i,
  /\/cdn-cgi\/access/i,
  /cf-access/i
];

function textMatches(patterns, value) {
  return patterns.some((pattern) => pattern.test(value));
}

async function checkTarget(url) {
  const parsedUrl = new URL(url);
  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "cj-cinco-private-dashboard-verifier/1.0"
    }
  });

  const location = response.headers.get("location") ?? "";
  const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
  const wwwAuthenticate = response.headers.get("www-authenticate") ?? "";
  const dashboardGuard = response.headers.get("x-cj-cinco-dashboard-guard") ?? "";
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("text") || contentType.includes("html")
    ? await response.text()
    : "";

  const status = response.status;
  const previewPagesHost = parsedUrl.hostname.endsWith(".cj-cinco-site.pages.dev") && parsedUrl.hostname !== "cj-cinco-site.pages.dev";
  const redirectedToAccess = [301, 302, 303, 307, 308].includes(status) && textMatches(accessSignatures, location);
  const accessLoginBody = textMatches(accessSignatures, body) && (body.includes("/cdn-cgi/access") || body.includes("cloudflareaccess.com"));
  const deniedByGate = [401, 403].includes(status);
  const blockedByPreviewGuard = previewPagesHost && [404, 410].includes(status) && dashboardGuard === "preview-blocked";
  const leakedDashboard = textMatches(dashboardSignatures, body);

  if (leakedDashboard) {
    return {
      url,
      ok: false,
      status,
      location,
      xRobotsTag,
      dashboardGuard,
      reason: "dashboard HTML is reachable without authentication"
    };
  }

  if (redirectedToAccess || accessLoginBody || deniedByGate || blockedByPreviewGuard) {
    return {
      url,
      ok: true,
      status,
      location,
      xRobotsTag,
      dashboardGuard,
      wwwAuthenticate,
      reason: blockedByPreviewGuard
        ? "blocked by preview dashboard guard"
        : redirectedToAccess
          ? "redirected to Cloudflare Access"
          : "blocked by an access gate"
    };
  }

  return {
    url,
    ok: false,
    status,
    location,
    xRobotsTag,
    dashboardGuard,
    wwwAuthenticate,
    reason: "expected Cloudflare Access login, redirect, or denial"
  };
}

const results = await Promise.all(targets.map(checkTarget));

for (const result of results) {
  const outcome = result.ok ? "PASS" : "FAIL";
  const location = result.location ? ` location=${result.location}` : "";
  const robots = result.xRobotsTag ? ` x-robots-tag=${JSON.stringify(result.xRobotsTag)}` : "";
  const guard = result.dashboardGuard ? ` dashboard-guard=${JSON.stringify(result.dashboardGuard)}` : "";
  console.log(`${outcome} ${result.url} status=${result.status}${location}${robots}${guard} - ${result.reason}`);
}

if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}

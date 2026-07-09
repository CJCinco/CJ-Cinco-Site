const allowedDashboardHosts = new Set([
  "cjcinco.com",
  "www.cjcinco.com",
  "cj-cinco-site.pages.dev",
]);

function isDashboardPath(pathname) {
  return pathname === "/dashboard" || pathname === "/dashboard.html" || pathname.startsWith("/dashboard/");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (isDashboardPath(url.pathname) && !allowedDashboardHosts.has(url.hostname)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "x-cj-cinco-dashboard-guard": "preview-blocked",
        "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  return context.next();
}

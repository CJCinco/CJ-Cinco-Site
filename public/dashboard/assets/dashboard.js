(function () {
  const data = window.AOS_DASHBOARD_DATA || { meta: {} };
  const chunks = window.AOS_DASHBOARD_DATA_CHUNKS || {};
  Object.keys(chunks).forEach((key) => {
    if (chunks[key] && typeof chunks[key] === "object") {
      Object.assign(data, chunks[key]);
    }
  });
  window.AOS_DASHBOARD_DATA = data;
  const PREP_RADAR_DAYS = 90;
  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = value || "";
  }

  function showDashboardDataError(detail) {
    if (window.__AOS_DASHBOARD_DATA_ERROR_SHOWN) return;
    window.__AOS_DASHBOARD_DATA_ERROR_SHOWN = true;
    const host = document.querySelector(".app-shell") || document.querySelector(".page") || document.body;
    if (!host) return;
    const node = document.createElement("div");
    node.className = "dashboard-data-alert";
    node.innerHTML =
      '<strong>Dashboard detail data unavailable.</strong><span>' +
      escapeText(detail || "Rebuild the dashboard or open it from the dashboard-system folder.") +
      "</span>";
    const nav = host.querySelector(".war-nav");
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(node, nav.nextSibling);
    } else {
      host.insertBefore(node, host.firstChild);
    }
  }

  function statusLabel(value) {
    if (value === "red") return "Red";
    if (value === "green") return "Green";
    return "Yellow";
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[char];
    });
  }

  function shortOneThing(value) {
    return String(value || "")
      .replace(/\s+by clearing\b.*$/i, "")
      .replace(/\s+before\b.*$/i, "")
      .replace(/\.$/, "")
      .trim() + ".";
  }

  function doneWhen(value) {
    const proof = String(value || "");
    if (/gym boxes|rack footprint|delivery path/i.test(proof)) {
      return "The gym zone can receive and stage the rack without moving clutter again.";
    }
    return proof;
  }

  function formatEventDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return value || "";
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return days[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()];
  }

  const PREP_PHASES = [
    { key: "radar", label: "On radar" },
    { key: "plan", label: "Plan" },
    { key: "finalize", label: "Finalize" },
    { key: "ready", label: "Ready" },
  ];

  function normalizePrepStage(stage) {
    const value = String(stage || "radar").toLowerCase();
    return PREP_PHASES.some((phase) => phase.key === value) ? value : "radar";
  }

  function prepProgressMarkup(stage) {
    const currentStage = normalizePrepStage(stage);
    const currentIndex = Math.max(
      0,
      PREP_PHASES.findIndex((phase) => phase.key === currentStage)
    );
    return (
      '<div class="event-progress ' +
      escapeText(currentStage) +
      '" aria-label="Prep phase: ' +
      escapeText(currentStage) +
      '">' +
      PREP_PHASES.map((phase, index) => {
        const stateClass = [
          "phase-" + phase.key,
          index === currentIndex ? "current" : index < currentIndex ? "complete" : "waiting",
        ].join(" ");
        const currentAttr = index === currentIndex ? ' aria-current="step"' : "";
        return (
          '<span class="' +
          stateClass +
          '"' +
          currentAttr +
          '><strong>' +
          escapeText(phase.label) +
          "</strong></span>"
        );
      }).join("") +
      "</div>"
    );
  }

  function phaseLabel(stage) {
    const key = normalizePrepStage(stage);
    const phase = PREP_PHASES.find((item) => item.key === key);
    return phase ? phase.label : "Phase";
  }

  function prepGateSentence(event) {
    if (!event) return "";
    if (normalizePrepStage(event.prep_stage) === "ready") {
      return "Prep is marked ready. Keep visible, but no extra pressure unless reality changes.";
    }
    const daysOut = Number(event.days_out || 0);
    if (event.can_promote || daysOut <= 7) {
      return "Inside the 7-day action gate. Prep can override the One Thing.";
    }
    if (daysOut <= 14) {
      return "Inside the 14-day planning gate. Decide the prep move before it turns urgent.";
    }
    return "On radar. Watch it now; planning pressure starts at the 14-day gate.";
  }

  function gateFillPercent(daysOut) {
    return Math.max(4, Math.min(100, ((PREP_RADAR_DAYS - Number(daysOut || 0)) / PREP_RADAR_DAYS) * 100)).toFixed(0);
  }

  function gateLineMarkup(daysOut, className) {
    return '<div class="gate-line ' + escapeText(className || "") + '"><span style="width:' + gateFillPercent(daysOut) + '%"></span></div>';
  }

  function updateTimer() {
    const timer = $("shutdownTimer");
    if (!timer) return;
    const now = new Date();
    const shutdown = new Date(now);
    const shutdownHour = Number((data.meta && data.meta.shutdownHour) || 17);
    shutdown.setHours(shutdownHour, 0, 0, 0);
    let diff = shutdown - now;
    if (diff <= 0) {
      timer.textContent = "00:00:00";
      return;
    }
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000);
    diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);
    timer.textContent = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }

  function initHero() {
    if (!$("paceStatusChip") && !$("captainOneThing") && !$("definitionDone") && !$("nextProof")) return;
    if (!data.pace || !data.captain || !data.captain.oneThing) {
      showDashboardDataError("Missing cockpit-core data chunk.");
      return;
    }
    const pace = data.pace;
    const captain = data.captain.oneThing;
    const oneThingLabel = shortOneThing(captain.current);
    const chip = $("paceStatusChip");
    if (chip) {
      chip.textContent = pace.statusLabel;
      chip.className = "status-chip " + pace.status;
    }
    setText("captainOneThing", oneThingLabel);
    setText("definitionDone", pace.todayCompleted ? "Status: complete today." : "Status: not complete yet. Complete today's rhythm-fit One Thing.");
    setText("nextProof", doneWhen(captain.next_proof));
  }

  function getWindowedHistory(range) {
    if (!data.pace) return [];
    const history = data.pace.history || [];
    if (range === "ytd") {
      const count = Math.max(1, Math.min(data.pace.yearEndDayCount || history.length, history.length));
      return history.slice(0, count);
    }
    const count = Number(range || 30);
    return history.slice(0, Math.max(1, Math.min(count, history.length)));
  }

  function pointPath(points) {
    return points
      .map((point, index) => (index === 0 ? "M " : "L ") + point.x.toFixed(1) + " " + point.y.toFixed(1))
      .join(" ");
  }

  function renderChart(range) {
    const svg = $("paceChart");
    if (!svg) return;
    if (!data.pace) {
      showDashboardDataError("Missing cockpit-core data chunk.");
      return;
    }
    const history = getWindowedHistory(range);
    const width = 980;
    const height = 360;
    const left = 58;
    const right = 24;
    const top = 24;
    const bottom = 48;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const maxValue = Math.max(1, ...history.map((row) => Math.max(row.planned, row.actual)));
    const xFor = (index) => left + (history.length === 1 ? 0 : (index / (history.length - 1)) * chartWidth);
    const yFor = (value) => top + chartHeight - (value / maxValue) * chartHeight;
    const planned = history.map((row, index) => ({ x: xFor(index), y: yFor(row.planned) }));
    const elapsed = history
      .map((row, index) => ({ row, index }))
      .filter((item) => !item.row.future);
    const plannedElapsed = elapsed.map((item) => ({ x: xFor(item.index), y: yFor(item.row.planned) }));
    const actual = elapsed.map((item) => ({ x: xFor(item.index), y: yFor(item.row.actual) }));
    const gapPolygon =
      planned.length && actual.length
        ? plannedElapsed
            .concat(actual.slice().reverse())
            .map((point) => point.x.toFixed(1) + "," + point.y.toFixed(1))
            .join(" ")
        : "";

    const ticks = Array.from(new Set([0, 1, Math.ceil(maxValue / 2), maxValue])).filter((tick) => tick <= maxValue);
    const tickMarkup = ticks
      .map((tick) => {
        const y = yFor(tick);
        return (
          '<line class="grid-line" x1="' +
          left +
          '" y1="' +
          y +
          '" x2="' +
          (width - right) +
          '" y2="' +
          y +
          '"></line><text class="tick-label" x="20" y="' +
          (y + 4) +
          '">' +
          tick +
          "</text>"
        );
      })
      .join("");
    const verticalIndexes =
      history.length <= 8
        ? history.map((_, index) => index)
        : Array.from(new Set([0, Math.round((history.length - 1) * 0.25), Math.round((history.length - 1) * 0.5), Math.round((history.length - 1) * 0.75), history.length - 1]));
    const verticalMarkup = verticalIndexes
      .map((index) => {
        const x = xFor(index);
        const row = history[index];
        const labelY = index === 0 || index === history.length - 1 ? 338 : 320;
        return (
          '<line class="time-line" x1="' +
          x +
          '" y1="' +
          top +
          '" x2="' +
          x +
          '" y2="' +
          (top + chartHeight) +
          '"></line><text class="axis-label" text-anchor="' +
          (index === 0 ? "start" : index === history.length - 1 ? "end" : "middle") +
          '" x="' +
          x +
          '" y="' +
          labelY +
          '">' +
          escapeText(row ? row.label : "") +
          "</text>"
        );
      })
      .join("");

    const startLabel = history[0] ? history[0].label : "";
    const endLabel = history[history.length - 1] ? history[history.length - 1].label : "";
    const actualClass = "actual-line " + data.pace.status;
    const dotClass = "chart-dot " + data.pace.status;
    const last = actual[actual.length - 1] || { x: left, y: yFor(0) };

    svg.innerHTML =
      tickMarkup +
      verticalMarkup +
      (gapPolygon ? '<polygon class="gap-fill" points="' + gapPolygon + '"></polygon>' : "") +
      '<path class="planned-line" d="' +
      pointPath(planned) +
      '"></path>' +
      '<path class="' +
      actualClass +
      '" d="' +
      pointPath(actual) +
      '"></path>' +
      '<circle class="' +
      dotClass +
      '" cx="' +
      last.x +
      '" cy="' +
      last.y +
      '" r="7"></circle>' +
      '<text class="axis-label" x="' +
      (width - 230) +
      '" y="34">planned</text><text class="axis-label" x="' +
      (width - 230) +
      '" y="56">actual</text>';

    setText("plannedReadout", "Planned: " + data.pace.plannedTotal);
    setText("actualReadout", "Actual: " + data.pace.actualTotal);
    setText("gapReadout", "Gap: " + data.pace.statusLabel);
  }

  function initChart() {
    document.querySelectorAll(".pace-segmented button").forEach((button) => {
      button.addEventListener("click", function () {
        document.querySelectorAll(".pace-segmented button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderChart(button.dataset.range);
      });
    });
    renderChart("30");
  }

  function initAreas() {
    const grid = $("areaGrid");
    if (!grid) return;
    if (!Array.isArray(data.areas)) {
      showDashboardDataError("Missing cockpit-core data chunk.");
      return;
    }
    grid.innerHTML = data.areas
      .map((area) => {
        const score = area.scorecard || {};
        return (
          '<article class="area-tile ' +
          escapeText(area.status) +
          '"><div class="area-top"><h3>' +
          escapeText(area.name) +
          '</h3><span class="status-dot" title="' +
          statusLabel(area.status) +
          '"></span></div><p class="area-one">' +
          escapeText(area.oneThing.current || "No One Thing found.") +
          '</p><div class="area-meta"><span class="tag">' +
          statusLabel(area.status) +
          '</span><span class="tag">' +
          escapeText(area.missionLink) +
          '</span><span class="tag">' +
          escapeText(score.grade || "Unknown") +
          '</span></div></article>'
        );
      })
      .join("");
  }

  function initEvents() {
    const node = $("eventRadar");
    const visual = $("prepVisual");
    if ((node || visual) && !Array.isArray(data.events)) {
      showDashboardDataError("Missing cockpit-core data chunk.");
      return;
    }
    if (visual) {
      const event = data.events[0];
      if (event) {
        const className = "prep-radar-core " + event.status;
        visual.innerHTML =
          '<div class="' +
          className +
          '"><div class="radar-rings"><span></span><span></span><strong>' +
          event.days_out +
          'd</strong></div><div class="prep-lead-copy"><h3>' +
          escapeText(event.name) +
          '</h3><p><strong>' +
          escapeText(formatEventDate(event.next_occurrence)) +
          "</strong> | " +
          escapeText(prepGateSentence(event)) +
          "</p>" +
          gateLineMarkup(event.days_out, "lead-gate-line") +
          '</div><div class="prep-lead-progress">' +
          prepProgressMarkup(event.prep_stage) +
          "<small>90-day radar | 14-day planning gate | 7-day action gate</small></div></div>";
      } else {
        visual.innerHTML = '<div class="prep-radar-core green"><div class="radar-rings"><span></span><span></span><strong>0</strong></div><div><h3>Radar clear</h3><p>No important dates inside 90 days.</p></div></div>';
      }
    }
    if (!node) return;
    if (!data.events.length) {
      node.innerHTML = '<p class="event-sub">No important dates inside the 90-day radar.</p>';
      return;
    }
    node.innerHTML = data.events
      .map(
        (event) =>
          '<div class="event-row ' +
          escapeText(event.status) +
          '"><div class="event-title-cell"><div class="event-name">' +
          escapeText(event.name) +
          '</div></div><div class="event-prep-cell"><div class="event-sub">' +
          escapeText(event.date_type) +
          " | " +
          escapeText(formatEventDate(event.next_occurrence)) +
          "</div>" +
          gateLineMarkup(event.days_out, "event-gate-line") +
          prepProgressMarkup(event.prep_stage) +
          '</div><div class="event-status-cell"><div class="event-days">' +
          event.days_out +
          'd</div><div class="prep-state">' +
          escapeText(event.prep_state) +
          "</div></div></div>"
      )
      .join("");
  }

  function initAllItems() {
    const list = $("allItemsList");
    if (!list) return;
    const cards = Array.from(document.querySelectorAll(".all-item-card"));
    const groups = Array.from(document.querySelectorAll(".item-group"));
    const search = $("itemSearch");
    const hierarchy = $("hierarchyFilter");
    const area = $("areaFilter");
    const status = $("statusFilter");
    const controls = [search, hierarchy, area, status].filter(Boolean);

    function valueOf(node) {
      return node ? String(node.value || "").toLowerCase().trim() : "";
    }

    function applyFilters() {
      const query = valueOf(search);
      const hierarchyValue = valueOf(hierarchy);
      const areaValue = valueOf(area);
      const statusValue = valueOf(status);
      let visible = 0;

      cards.forEach((card) => {
        const matchesQuery = !query || String(card.dataset.search || "").includes(query);
        const matchesHierarchy = !hierarchyValue || String(card.dataset.hierarchy || "").toLowerCase() === hierarchyValue;
        const matchesArea = !areaValue || String(card.dataset.area || "").toLowerCase() === areaValue;
        const matchesStatus = !statusValue || String(card.dataset.status || "").toLowerCase() === statusValue;
        const show = matchesQuery && matchesHierarchy && matchesArea && matchesStatus;
        card.hidden = !show;
        if (show) visible += 1;
      });

      groups.forEach((group) => {
        group.hidden = !group.querySelector(".all-item-card:not([hidden])");
      });
      setText("visibleItemCount", visible + " visible");
    }

    controls.forEach((control) => {
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", applyFilters);
    });
    applyFilters();
  }

  updateTimer();
  setInterval(updateTimer, 1000);
  initHero();
  initChart();
  initAreas();
  initEvents();
  initAllItems();
})();

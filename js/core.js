/* ============================================================
   ReactMeter core engine
   Shared by every test page: test registry, scoring/percentiles,
   localStorage stats & streaks, result rendering, share cards,
   confetti, toasts, header/footer chrome, ad + analytics mounts.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.RLCONFIG || {};
  var STORE_KEY = "reactmeter.v1";

  /* ---------------- tiny helpers ---------------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---------------- inline SVG icon set ---------------- */

  var I = function (paths, fill) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="' + (fill ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="' + (fill ? 0 : 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  };

  var ICONS = {
    bolt: I('<path d="M13 2 4.6 13.4h5.2L8.6 22l8.8-11.4h-5.2L13 2z"/>', true),
    target: I('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>'),
    grid: I('<circle cx="5" cy="5" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/><circle cx="5" cy="19" r="1.8"/><circle cx="12" cy="19" r="1.8"/><circle cx="19" cy="19" r="1.8"/>'),
    hash: I('<path d="M9 3 7 21M17 3l-2 18M4 8h17M3 16h17"/>'),
    eye: I('<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    keys: I('<rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
    tiles: I('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/>'),
    chat: I('<path d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12z"/><path d="M9 11h6"/>'),
    flame: I('<path d="M12 2c1 4-4 5.5-4 10a4 4 0 0 0 8 0c0-1.5-.5-2.5-1-3.5 2 .5 4 2.5 4 5.5a7 7 0 0 1-14 0C5 8 10 6.5 12 2z"/>', true),
    trophy: I('<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 5H4a4 4 0 0 0 4 4M16 5h4a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>')
  };

  /* ---------------- test registry ----------------
     dist: approximate player-population distributions used to
     estimate percentiles. type "log" = log-normal, "norm" = normal.
     m = median score, g = score at the 90th percentile of players. */

  var TESTS = {
    reaction: {
      name: "Reaction Time", icon: "bolt", path: "reaction-time/",
      blurb: "Click as fast as you can when the box turns green.",
      lowerBetter: true, dist: { type: "log", m: 275, g: 207 },
      fmt: function (v) { return Math.round(v) + '<span>ms</span>'; },
      fmtText: function (v) { return Math.round(v) + " ms"; }
    },
    aim: {
      name: "Aim Trainer", icon: "target", path: "aim-trainer/",
      blurb: "Hit 30 targets as quickly and accurately as you can.",
      lowerBetter: true, dist: { type: "log", m: 500, g: 320 },
      fmt: function (v) { return Math.round(v) + '<span>ms / target</span>'; },
      fmtText: function (v) { return Math.round(v) + " ms per target"; }
    },
    sequence: {
      name: "Sequence Memory", icon: "grid", path: "sequence-memory/",
      blurb: "Repeat an ever-growing pattern of flashing tiles.",
      lowerBetter: false, dist: { type: "norm", m: 8, g: 13 },
      fmt: function (v) { return "Level " + v; },
      fmtText: function (v) { return "Level " + v; }
    },
    number: {
      name: "Number Memory", icon: "hash", path: "number-memory/",
      blurb: "How many digits can you hold in your head?",
      lowerBetter: false, dist: { type: "norm", m: 7, g: 10.5 },
      fmt: function (v) { return v + '<span>digits</span>'; },
      fmtText: function (v) { return v + " digits"; }
    },
    visual: {
      name: "Visual Memory", icon: "eye", path: "visual-memory/",
      blurb: "Memorize the flashing tiles, then find them all.",
      lowerBetter: false, dist: { type: "norm", m: 9, g: 13.5 },
      fmt: function (v) { return "Level " + v; },
      fmtText: function (v) { return "Level " + v; }
    },
    typing: {
      name: "Typing Speed", icon: "keys", path: "typing-test/",
      blurb: "30 seconds. How many words per minute can you hit?",
      lowerBetter: false, dist: { type: "log", m: 42, g: 73 },
      fmt: function (v) { return Math.round(v) + '<span>WPM</span>'; },
      fmtText: function (v) { return Math.round(v) + " WPM"; }
    },
    chimp: {
      name: "Chimp Test", icon: "tiles", path: "chimp-test/",
      blurb: "Numbers flash, then hide. Click them in order.",
      lowerBetter: false, dist: { type: "norm", m: 9, g: 12.5 },
      fmt: function (v) { return v + '<span>numbers</span>'; },
      fmtText: function (v) { return v + " numbers"; }
    },
    verbal: {
      name: "Verbal Memory", icon: "chat", path: "verbal-memory/",
      blurb: "Seen this word before, or is it new? Keep your streak.",
      lowerBetter: false, dist: { type: "log", m: 33, g: 80 },
      fmt: function (v) { return v + '<span>words</span>'; },
      fmtText: function (v) { return v + " words"; }
    }
  };

  /* ---------------- percentile math ---------------- */

  // Abramowitz & Stegun 7.1.26 approximation of erf(x)
  function erf(x) {
    var sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  var Z90 = 1.281552; // z-score of the 90th percentile

  // Returns "better than X% of players" (0.1 .. 99.9)
  function percentile(testId, value) {
    var t = TESTS[testId];
    if (!t) return 50;
    var d = t.dist, z;
    if (d.type === "log") {
      var x = Math.max(0.5, value);
      var sigma = Math.abs(Math.log(d.g) - Math.log(d.m)) / Z90;
      z = (Math.log(x) - Math.log(d.m)) / sigma;
      if (t.lowerBetter) z = -z;
    } else {
      var s = Math.abs(d.g - d.m) / Z90;
      z = (value - d.m) / s;
      if (t.lowerBetter) z = -z;
    }
    var p = cdf(z) * 100;
    return Math.min(99.9, Math.max(0.1, p));
  }

  function grade(pct) {
    if (pct >= 99) return { label: "S+", cls: "g-splus" };
    if (pct >= 90) return { label: "S", cls: "g-s" };
    if (pct >= 75) return { label: "A", cls: "g-a" };
    if (pct >= 50) return { label: "B", cls: "g-b" };
    if (pct >= 25) return { label: "C", cls: "g-c" };
    return { label: "D", cls: "g-d" };
  }

  /* ---------------- storage / stats ---------------- */

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* private mode etc. */ }
    return { plays: 0, results: {}, streak: { last: "", count: 0 } };
  }
  function saveStore(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  function bestOf(history, lowerBetter) {
    if (!history || !history.length) return null;
    var vals = history.map(function (h) { return h.v; });
    return lowerBetter ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
  }

  function recordResult(testId, value) {
    var s = loadStore();
    var t = TESTS[testId];
    if (!s.results[testId]) s.results[testId] = { history: [] };
    var hist = s.results[testId].history;
    var prevBest = bestOf(hist, t.lowerBetter);
    hist.push({ v: value, t: Date.now() });
    if (hist.length > 60) hist.splice(0, hist.length - 60);
    s.plays = (s.plays || 0) + 1;

    // daily streak
    var today = todayStr();
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yesterday = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
    if (s.streak.last !== today) {
      s.streak.count = (s.streak.last === yesterday) ? (s.streak.count || 0) + 1 : 1;
      s.streak.last = today;
    }

    saveStore(s);
    var isRecord = prevBest === null || (t.lowerBetter ? value < prevBest : value > prevBest);
    return {
      prevBest: prevBest,
      best: bestOf(hist, t.lowerBetter),
      isRecord: isRecord,
      attempts: hist.length,
      history: hist
    };
  }

  function getBest(testId) {
    var s = loadStore();
    var r = s.results[testId];
    return r ? bestOf(r.history, TESTS[testId].lowerBetter) : null;
  }

  /* ---------------- toast ---------------- */

  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------------- confetti ---------------- */

  function confetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var colors = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#ffffff"];
    var parts = [];
    for (var i = 0; i < 110; i++) {
      parts.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 240,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 10 - 3,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0]
      });
    }
    var frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(function (p) {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.max(0, 1 - frames / 80);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frames++;
      if (frames < 85) requestAnimationFrame(tick);
      else canvas.remove();
    })();
  }

  /* ---------------- share ---------------- */

  function pageUrl() {
    if (CFG.baseUrl) {
      var root = document.body.getAttribute("data-root") || "";
      var path = location.pathname;
      // best effort: baseUrl + current folder name
      var seg = path.replace(/index\.html?$/i, "");
      var parts = seg.split("/").filter(Boolean);
      var folder = parts.length ? parts[parts.length - 1] + "/" : "";
      return CFG.baseUrl.replace(/\/$/, "") + "/" + (root === "" ? "" : folder);
    }
    return location.origin === "null" ? location.href : location.origin + location.pathname;
  }

  function share(testId, value) {
    var t = TESTS[testId];
    var pct = Math.round(percentile(testId, value));
    var g = grade(percentile(testId, value));
    var text = (CFG.siteName || "ReactMeter") + " | " + t.name + "\n" +
      "My score: " + t.fmtText(value) + " - better than " + pct + "% of players (rank " + g.label + ")\n" +
      "Think you can beat me? " + pageUrl();
    doShare(text);
  }

  function shareSite() {
    var text = (CFG.siteName || "ReactMeter") + " - " + (CFG.tagline || "free reflex and memory tests") + "\n" + pageUrl();
    doShare(text);
  }

  function doShare(text) {
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () { /* user cancelled */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast("Challenge copied - paste it anywhere");
      }, function () { toast("Could not copy, sorry"); });
    } else {
      toast("Sharing not supported in this browser");
    }
  }

  /* ---------------- sparkline ---------------- */

  function drawSpark(canvas, history, lowerBetter) {
    var vals = history.map(function (h) { return h.v; }).slice(-20);
    if (vals.length < 2) { canvas.style.display = "none"; return; }
    var dpr = window.devicePixelRatio || 1;
    var W = 280, H = 56;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (min === max) { min -= 1; max += 1; }
    var pad = 7;
    function px(i) { return pad + (i / (vals.length - 1)) * (W - pad * 2); }
    function py(v) {
      var norm = (v - min) / (max - min);        // 0 = min, 1 = max
      if (lowerBetter) norm = 1 - norm;          // up = better
      return H - pad - norm * (H - pad * 2);
    }
    ctx.strokeStyle = "rgba(34,211,238,0.85)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    vals.forEach(function (v, i) { i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v)); });
    ctx.stroke();
    vals.forEach(function (v, i) {
      ctx.beginPath();
      ctx.arc(px(i), py(v), i === vals.length - 1 ? 4 : 2.2, 0, Math.PI * 2);
      ctx.fillStyle = i === vals.length - 1 ? "#a78bfa" : "rgba(139,152,184,0.8)";
      ctx.fill();
    });
  }

  /* ---------------- result rendering ---------------- */

  function affiliateHtml() {
    var items = CFG.affiliates || [];
    if (!items.length) return "";
    var rows = items.slice(0, 3).map(function (a) {
      return '<a class="aff-item" href="' + esc(a.url) + '" target="_blank" rel="sponsored noopener">' +
        "<b>" + esc(a.name) + "</b><span>" + esc(a.note || "") + "</span></a>";
    }).join("");
    return '<div class="aff-card"><h3>Level up your gear</h3>' + rows +
      '<p class="aff-disclosure">Affiliate links - purchases support ' + esc(CFG.siteName || "this site") + " at no extra cost to you.</p></div>";
  }

  /**
   * Finish a game: records the score, renders the result card into stageEl.
   * opts: { detail: string, onRetry: function }
   */
  function finish(stageEl, testId, value, opts) {
    opts = opts || {};
    var t = TESTS[testId];
    var rec = recordResult(testId, value);
    var pct = percentile(testId, value);
    var g = grade(pct);
    updateStreakPill();

    stageEl.className = "stage stage-result";
    stageEl.innerHTML =
      '<div class="result">' +
        '<div class="result-top">' +
          '<div class="grade ' + g.cls + '">' + g.label + "</div>" +
          '<div class="result-main">' +
            '<div class="result-score">' + t.fmt(value) + "</div>" +
            '<div class="result-sub">Better than <b>' + Math.round(pct) + "%</b> of players</div>" +
            '<div class="pct-bar"><i style="width:0%"></i></div>' +
          "</div>" +
        "</div>" +
        '<div class="result-meta">' +
          (opts.detail ? esc(opts.detail) + "<br>" : "") +
          "Personal best: <b>" + t.fmtText(rec.best) + "</b> - attempt #" + rec.attempts +
          (rec.isRecord && rec.attempts > 1 ? '<span class="badge-new">NEW BEST</span>' : "") +
        "</div>" +
        '<canvas class="spark" aria-hidden="true"></canvas>' +
        '<div class="result-actions">' +
          '<button class="btn" data-retry>Try again</button>' +
          '<button class="btn btn-ghost" data-share>Challenge a friend</button>' +
          '<a class="btn btn-ghost" href="' + (document.body.getAttribute("data-root") || "") + '">All tests</a>' +
        "</div>" +
        affiliateHtml() +
        '<p class="tiny result-note">Percentiles are estimates based on typical player distributions.</p>' +
      "</div>";

    var retryBtn = $("[data-retry]", stageEl);
    if (retryBtn && opts.onRetry) {
      retryBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        opts.onRetry();
      });
    }
    var shareBtn = $("[data-share]", stageEl);
    if (shareBtn) {
      shareBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        share(testId, value);
      });
    }

    requestAnimationFrame(function () {
      var bar = $(".pct-bar i", stageEl);
      if (bar) bar.style.width = pct + "%";
      var spark = $(".spark", stageEl);
      if (spark) drawSpark(spark, rec.history, t.lowerBetter);
    });

    if (rec.isRecord && rec.attempts > 1) confetti();
  }

  /* ---------------- chrome: header, ads, analytics ---------------- */

  function updateStreakPill() {
    var pill = $("#streakPill");
    if (!pill) return;
    var s = loadStore();
    var count = (s.streak.last === todayStr()) ? s.streak.count : 0;
    if (count >= 1) {
      pill.hidden = false;
      pill.innerHTML = ICONS.flame + " <b>" + count + "</b>&nbsp;day" + (count > 1 ? "s" : "");
      pill.title = "Daily streak - play any test each day to keep it";
    } else {
      pill.hidden = true;
    }
  }

  function mountAds() {
    var slots = $all(".ad-slot");
    if (!slots.length) return;

    if (CFG.adsense && CFG.adsense.client) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(CFG.adsense.client);
      s.setAttribute("crossorigin", "anonymous");
      document.head.appendChild(s);
      slots.forEach(function (slot) {
        var ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.style.width = "100%";
        ins.setAttribute("data-ad-client", CFG.adsense.client);
        if (CFG.adsense.slotDisplay) ins.setAttribute("data-ad-slot", CFG.adsense.slotDisplay);
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        slot.appendChild(ins);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } else {
      // House card until AdSense is configured - keeps layout honest & useful.
      slots.forEach(function (slot) {
        var donate = CFG.donateUrl
          ? '<a class="btn btn-ghost btn-sm" href="' + esc(CFG.donateUrl) + '" target="_blank" rel="noopener">Support us</a>'
          : "";
        slot.innerHTML =
          '<div class="house-ad">' +
            '<div class="ha-text"><b>Enjoying ' + esc(CFG.siteName || "ReactMeter") + "?</b>" +
            "<p>Share it with a friend - it is the best way to keep it free.</p></div>" +
            '<button class="btn btn-sm" data-share-site>Share the site</button>' + donate +
          "</div>";
      });
    }
  }

  function mountAnalytics() {
    var a = CFG.analytics || {};
    if (a.plausibleDomain) {
      var p = document.createElement("script");
      p.defer = true;
      p.setAttribute("data-domain", a.plausibleDomain);
      p.src = "https://plausible.io/js/script.js";
      document.head.appendChild(p);
    }
    if (a.gaMeasurementId) {
      var g = document.createElement("script");
      g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(a.gaMeasurementId);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", a.gaMeasurementId);
    }
  }

  function mountChrome() {
    $all(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $all(".js-sitename").forEach(function (el) { el.textContent = CFG.siteName || "ReactMeter"; });
    updateStreakPill();
    mountAds();
    mountAnalytics();

    // close the nav dropdown when clicking outside it
    document.addEventListener("click", function (e) {
      $all("details.nav-drop[open]").forEach(function (d) {
        if (!d.contains(e.target)) d.removeAttribute("open");
      });
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-share-site]");
      if (btn) shareSite();
    });
  }

  /* ---------------- expose ---------------- */

  window.RL = {
    TESTS: TESTS,
    ICONS: ICONS,
    $: $,
    $all: $all,
    esc: esc,
    percentile: percentile,
    grade: grade,
    store: { load: loadStore, recordResult: recordResult, getBest: getBest },
    finish: finish,
    share: share,
    shareSite: shareSite,
    toast: toast,
    confetti: confetti,
    updateStreakPill: updateStreakPill
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountChrome);
  } else {
    mountChrome();
  }
})();

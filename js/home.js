/* Home page: renders the test grid, "Test of the day", and your local stats. */
(function () {
  "use strict";

  var grid = document.getElementById("testsGrid");
  var order = ["reaction", "aim", "typing", "sequence", "number", "visual", "chimp", "verbal"];

  // deterministic daily pick
  var dayN = Math.floor(Date.now() / 86400000);
  var todId = order[dayN % order.length];

  order.forEach(function (id) {
    var t = RL.TESTS[id];
    var best = RL.store.getBest(id);
    var bestHtml = "";
    if (best !== null) {
      var g = RL.grade(RL.percentile(id, best));
      bestHtml = '<div class="tc-best">' + RL.ICONS.trophy + " Best: <b>" + t.fmtText(best) + "</b> (" + g.label + ")</div>";
    } else {
      bestHtml = '<div class="tc-best">Not played yet - be honest, you are curious.</div>';
    }
    var a = document.createElement("a");
    a.className = "test-card";
    a.href = t.path;
    a.innerHTML =
      (id === todId ? '<span class="tod-badge">Test of the day</span>' : "") +
      '<div class="tc-icon">' + RL.ICONS[t.icon] + "</div>" +
      "<h3>" + t.name + "</h3>" +
      "<p>" + t.blurb + "</p>" +
      bestHtml;
    grid.appendChild(a);
  });

  // local stats strip
  var s = RL.store.load();
  var played = Object.keys(s.results || {}).length;
  var strip = document.getElementById("statsStrip");
  if (s.plays > 0 && strip) {
    strip.hidden = false;
    var today = new Date();
    var todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    var streak = s.streak.last === todayStr ? s.streak.count : 0;
    strip.innerHTML =
      '<div class="stat"><b>' + s.plays + "</b><span>games played</span></div>" +
      '<div class="stat"><b>' + played + "/" + order.length + "</b><span>tests tried</span></div>" +
      '<div class="stat"><b>' + streak + "</b><span>day streak</span></div>";
  }
})();

/* Aim Trainer: click 30 targets as fast as you can. Score = avg ms per target. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var TARGETS = 30, SIZE = 54;
  var left, hits, misses, times, tShown, arena, hudEl, playing = false;

  function init() {
    playing = false;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.target + "</div>" +
        "<h2>Aim Trainer</h2>" +
        "<p>Hit <b>" + TARGETS + " targets</b> as fast as you can. Clicks that miss hurt your accuracy.</p>" +
        '<button class="btn" id="aimStart">Start</button>' +
      "</div>";
    RL.$("#aimStart", stage).addEventListener("click", start);
  }

  function start() {
    left = TARGETS; hits = 0; misses = 0; times = [];
    playing = true;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Remaining <b id="aimLeft">' + left + "</b></span>" +
        '<span class="hud-item">Avg <b id="aimAvg">-</b></span>' +
        '<span class="hud-item">Accuracy <b id="aimAcc">100%</b></span>' +
      "</div>" +
      '<div class="aim-arena" id="aimArena"></div>';
    arena = RL.$("#aimArena", stage);
    arena.addEventListener("pointerdown", function (e) {
      if (!playing) return;
      // pointerdown that reaches the arena = miss (targets stop propagation)
      misses++;
      updateHud();
    });
    spawn();
  }

  function updateHud() {
    RL.$("#aimLeft", stage).textContent = left;
    var total = hits + misses;
    RL.$("#aimAcc", stage).textContent = total ? Math.round((hits / total) * 100) + "%" : "100%";
    if (times.length) {
      var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
      RL.$("#aimAvg", stage).textContent = Math.round(avg) + " ms";
    }
  }

  function spawn() {
    var pad = 10;
    var w = arena.clientWidth - SIZE - pad * 2;
    var h = arena.clientHeight - SIZE - pad * 2;
    var x = pad + Math.random() * Math.max(1, w);
    var y = pad + Math.random() * Math.max(1, h);
    var t = document.createElement("div");
    t.className = "aim-target";
    t.style.left = x + "px";
    t.style.top = y + "px";
    t.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (!playing) return;
      times.push(performance.now() - tShown);
      hits++;
      left--;
      t.remove();
      updateHud();
      if (left <= 0) end();
      else spawn();
    });
    arena.appendChild(t);
    tShown = performance.now();
  }

  function end() {
    playing = false;
    var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
    var total = hits + misses;
    var acc = total ? Math.round((hits / total) * 100) : 100;
    RL.finish(stage, "aim", avg, {
      detail: "Accuracy " + acc + "% (" + misses + " missed click" + (misses === 1 ? "" : "s") + ")",
      onRetry: init
    });
  }

  init();
})();

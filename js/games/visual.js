/* Visual Memory: memorize flashing tiles, click them all. 3 lives. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var level, lives, strikes, targetSet, found, accepting;

  function gridSize(tiles) {
    if (tiles <= 4) return 3;
    if (tiles <= 7) return 4;
    if (tiles <= 11) return 5;
    if (tiles <= 16) return 6;
    return 7;
  }

  function init() {
    level = 1; lives = 3;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.eye + "</div>" +
        "<h2>Visual Memory</h2>" +
        "<p>Tiles flash for a moment - click every one you saw. 3 mistakes in a level costs a life. You have 3 lives.</p>" +
        '<button class="btn" id="visStart">Start</button>' +
      "</div>";
    RL.$("#visStart", stage).addEventListener("click", playLevel);
  }

  function livesHtml() {
    var h = '<span class="lives" aria-label="' + lives + ' lives left">';
    for (var i = 0; i < 3; i++) h += '<i class="' + (i < lives ? "" : "off") + '"></i>';
    return h + "</span>";
  }

  function playLevel() {
    strikes = 0;
    found = 0;
    accepting = false;
    var tileCount = level + 2;
    var n = gridSize(tileCount);
    var cells = n * n;

    targetSet = {};
    var picked = 0;
    while (picked < tileCount) {
      var idx = (Math.random() * cells) | 0;
      if (!targetSet[idx]) { targetSet[idx] = true; picked++; }
    }

    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Level <b>' + level + "</b></span>" +
        '<span class="hud-item">Tiles <b>' + tileCount + "</b></span>" +
        '<span class="hud-item">' + livesHtml() + "</span>" +
      "</div>" +
      '<div class="stage-body"><div class="vis-grid" id="visGrid" style="--n:' + n + '"></div></div>';

    var grid = RL.$("#visGrid", stage);
    var tiles = [];
    for (var i = 0; i < cells; i++) {
      (function (idx) {
        var d = document.createElement("div");
        d.className = "vis-tile";
        d.addEventListener("pointerdown", function () { tap(idx, d, tileCount); });
        grid.appendChild(d);
        tiles.push(d);
      })(i);
    }

    // reveal pattern
    setTimeout(function () {
      tiles.forEach(function (t, idx) { if (targetSet[idx]) t.classList.add("show"); });
      setTimeout(function () {
        tiles.forEach(function (t) { t.classList.remove("show"); });
        accepting = true;
      }, 1200);
    }, 600);
  }

  function tap(idx, el, tileCount) {
    if (!accepting) return;
    if (targetSet[idx]) {
      if (el.classList.contains("hit")) return;
      el.classList.add("hit");
      found++;
      if (found >= tileCount) {
        accepting = false;
        level++;
        setTimeout(playLevel, 650);
      }
    } else {
      if (el.classList.contains("miss")) return;
      el.classList.add("miss");
      strikes++;
      if (strikes >= 3) {
        accepting = false;
        lives--;
        if (lives <= 0) {
          var score = level - 1;
          setTimeout(function () {
            RL.finish(stage, "visual", score, {
              detail: score === 0 ? "Rough start - the grid resets fast, go again." : "You cleared " + score + " level" + (score === 1 ? "" : "s") + ".",
              onRetry: init
            });
          }, 500);
        } else {
          setTimeout(playLevel, 650);
        }
      }
    }
  }

  init();
})();

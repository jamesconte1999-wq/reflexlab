/* Chimp Test: numbers appear, then hide after your first click. Click 1..N in order. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var COLS = 8, ROWS = 5;
  var level, strikes, bestCompleted, next, masked, cells;

  function init() {
    level = 4; strikes = 0; bestCompleted = 0;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.tiles + "</div>" +
        "<h2>Chimp Test</h2>" +
        "<p>Click the numbers in order. After you click <b>1</b>, the rest turn blank. Chimpanzees crush this test - can you?</p>" +
        '<button class="btn" id="chStart">Start</button>' +
      "</div>";
    RL.$("#chStart", stage).addEventListener("click", playLevel);
  }

  function strikesHtml() {
    var lives = 3 - strikes;
    var h = '<span class="lives" aria-label="' + lives + ' tries left">';
    for (var i = 0; i < 3; i++) h += '<i class="' + (i < lives ? "" : "off") + '"></i>';
    return h + "</span>";
  }

  function playLevel() {
    next = 1;
    masked = false;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Numbers <b>' + level + "</b></span>" +
        '<span class="hud-item">' + strikesHtml() + "</span>" +
      "</div>" +
      '<div class="stage-body"><div class="chimp-grid" id="chGrid"></div></div>';

    var grid = RL.$("#chGrid", stage);
    var total = COLS * ROWS;
    var picks = [];
    while (picks.length < level) {
      var idx = (Math.random() * total) | 0;
      if (picks.indexOf(idx) === -1) picks.push(idx);
    }

    cells = [];
    for (var i = 0; i < total; i++) {
      var cell = document.createElement("div");
      cell.className = "chimp-cell";
      var order = picks.indexOf(i);
      if (order !== -1) {
        cell.className += " has";
        cell.textContent = order + 1;
        cell.setAttribute("data-n", order + 1);
        cell.addEventListener("pointerdown", onCell);
      }
      grid.appendChild(cell);
      cells.push(cell);
    }
  }

  function onCell(e) {
    var cell = e.currentTarget;
    if (cell.classList.contains("gone")) return;
    var n = parseInt(cell.getAttribute("data-n"), 10);
    if (n === next) {
      cell.classList.add("gone");
      if (!masked && next === 1 && level > 1) {
        masked = true;
        cells.forEach(function (c) {
          if (c.classList.contains("has") && !c.classList.contains("gone")) c.classList.add("masked");
        });
      }
      next++;
      if (next > level) {
        bestCompleted = level;
        level++;
        setTimeout(playLevel, 550);
      }
    } else {
      strikes++;
      // reveal everything briefly so the player sees what went wrong
      cells.forEach(function (c) { c.classList.remove("masked"); });
      if (strikes >= 3) {
        setTimeout(function () {
          RL.finish(stage, "chimp", bestCompleted, {
            detail: bestCompleted === 0 ? "Three strikes on the opener - shake it off." : "Three strikes. Highest cleared: " + bestCompleted + " numbers.",
            onRetry: init
          });
        }, 600);
      } else {
        setTimeout(playLevel, 800);
      }
    }
  }

  init();
})();

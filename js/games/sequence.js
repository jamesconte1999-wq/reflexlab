/* Sequence Memory: repeat a growing pattern of flashing tiles. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var seq = [], level = 1, inputIdx = 0, accepting = false, tiles = [];

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function init() {
    seq = []; level = 1;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.grid + "</div>" +
        "<h2>Sequence Memory</h2>" +
        "<p>Watch the tiles flash, then repeat the pattern. It grows by one every level.</p>" +
        '<button class="btn" id="seqStart">Start</button>' +
      "</div>";
    RL.$("#seqStart", stage).addEventListener("click", startRun);
  }

  function board() {
    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Level <b id="seqLevel">' + level + "</b></span>" +
        '<span class="hud-item" id="seqState">Watch&hellip;</span>' +
      "</div>" +
      '<div class="stage-body"><div class="seq-grid" id="seqGrid"></div></div>';
    var grid = RL.$("#seqGrid", stage);
    tiles = [];
    for (var i = 0; i < 9; i++) {
      (function (idx) {
        var d = document.createElement("div");
        d.className = "seq-tile";
        d.addEventListener("pointerdown", function () { tap(idx, d); });
        grid.appendChild(d);
        tiles.push(d);
      })(i);
    }
  }

  function startRun() {
    seq = [];
    level = 1;
    board();
    nextLevel();
  }

  async function nextLevel() {
    accepting = false;
    inputIdx = 0;
    seq.push((Math.random() * 9) | 0);
    RL.$("#seqLevel", stage).textContent = level;
    RL.$("#seqState", stage).textContent = "Watch\u2026";
    await sleep(650);
    var on = Math.max(170, 420 - level * 12);
    var off = Math.max(90, 220 - level * 6);
    for (var i = 0; i < seq.length; i++) {
      var t = tiles[seq[i]];
      t.classList.add("lit");
      await sleep(on);
      t.classList.remove("lit");
      await sleep(off);
    }
    RL.$("#seqState", stage).textContent = "Your turn";
    accepting = true;
  }

  async function tap(idx, el) {
    if (!accepting) return;
    if (idx === seq[inputIdx]) {
      el.classList.add("lit");
      setTimeout(function () { el.classList.remove("lit"); }, 180);
      inputIdx++;
      if (inputIdx >= seq.length) {
        accepting = false;
        level++;
        await sleep(500);
        nextLevel();
      }
    } else {
      accepting = false;
      el.classList.add("wrong-flash");
      await sleep(450);
      var score = level - 1;
      RL.finish(stage, "sequence", score, {
        detail: score === 0 ? "The first tile got you - it happens." : "You repeated " + score + " level" + (score === 1 ? "" : "s") + " perfectly.",
        onRetry: init
      });
    }
  }

  init();
})();

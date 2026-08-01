/* Reaction Time test: wait for green, click as fast as possible. 5 rounds. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var ROUNDS = 5;
  var times = [], phase = "idle", tGo = 0, waitTimer = null;

  function dots() {
    var h = '<div class="round-dots" style="margin-top:18px">';
    for (var i = 0; i < ROUNDS; i++) h += '<i class="' + (i < times.length ? "on" : "") + '"></i>';
    return h + "</div>";
  }

  function center(iconHtml, title, sub, extra) {
    return '<div class="stage-center">' +
      (iconHtml || "") +
      "<h2>" + title + "</h2>" +
      "<p>" + sub + "</p>" +
      (extra || "") +
      dots() + "</div>";
  }

  function init() {
    times = [];
    phase = "idle";
    stage.className = "stage";
    stage.style.cursor = "pointer";
    stage.innerHTML = center(
      '<div class="stage-icon">' + RL.ICONS.bolt + "</div>",
      "Reaction Time",
      "When red turns <b>green</b>, click (or press space) as fast as you can. " + ROUNDS + " rounds.",
      '<button class="btn">Start test</button>'
    );
  }

  function armRound() {
    phase = "wait";
    stage.className = "stage rx-wait";
    stage.innerHTML = center("", "Wait for green&hellip;", "Round " + (times.length + 1) + " of " + ROUNDS);
    waitTimer = setTimeout(function () {
      phase = "go";
      stage.className = "stage rx-go";
      stage.innerHTML = '<div class="stage-center"><div class="rx-big">CLICK!</div><p>Go go go</p>' + dots() + "</div>";
      requestAnimationFrame(function () { tGo = performance.now(); });
    }, 1500 + Math.random() * 2800);
  }

  function press() {
    if (phase === "idle" || phase === "between") {
      armRound();
    } else if (phase === "wait") {
      clearTimeout(waitTimer);
      phase = "early";
      stage.className = "stage rx-early";
      stage.innerHTML = center("", "Too soon!", "You clicked before it turned green. Click to retry this round.");
    } else if (phase === "early") {
      armRound();
    } else if (phase === "go") {
      var dt = performance.now() - tGo;
      times.push(dt);
      if (times.length >= ROUNDS) {
        phase = "done";
        stage.style.cursor = "default";
        var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
        RL.finish(stage, "reaction", avg, {
          detail: "Rounds: " + times.map(function (t) { return Math.round(t); }).join(" / ") + " ms",
          onRetry: init
        });
      } else {
        phase = "between";
        stage.className = "stage";
        stage.innerHTML = center(
          '<div class="rx-ms">' + Math.round(dt) + '<span class="muted" style="font-size:0.4em"> ms</span></div>',
          "", "Click for round " + (times.length + 1)
        );
      }
    }
  }

  stage.addEventListener("pointerdown", function (e) {
    if (phase === "done") return;
    e.preventDefault();
    press();
  });
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space" && phase !== "done") {
      e.preventDefault();
      press();
    }
  });

  init();
})();

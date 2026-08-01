/* Number Memory: memorize a number that grows one digit per level. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var level = 1, current = "";

  function init() {
    level = 1;
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.hash + "</div>" +
        "<h2>Number Memory</h2>" +
        "<p>A number appears briefly. Type it from memory. Each level adds a digit - the average person reaches 7.</p>" +
        '<button class="btn" id="numStart">Start</button>' +
      "</div>";
    RL.$("#numStart", stage).addEventListener("click", showNumber);
  }

  function randomNumber(digits) {
    var s = String(1 + (Math.random() * 9) | 0);
    for (var i = 1; i < digits; i++) s += (Math.random() * 10) | 0;
    return s;
  }

  function showNumber() {
    current = randomNumber(level);
    var showMs = Math.min(1100 + level * 650, 9000);
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="num-label">Level ' + level + " - " + level + " digit" + (level > 1 ? "s" : "") + "</div>" +
        '<div class="num-display">' + current + "</div>" +
        '<div class="num-bar"><i style="animation: bar-drain ' + showMs + 'ms linear forwards"></i></div>' +
      "</div>";
    setTimeout(askAnswer, showMs);
  }

  function askAnswer() {
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="num-label">What was the number?</div>' +
        '<div style="margin:18px 0 14px"><input class="num-input" id="numInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Type the number"></div>' +
        '<button class="btn" id="numSubmit">Submit</button>' +
      "</div>";
    var input = RL.$("#numInput", stage);
    input.focus();
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
    });
    RL.$("#numSubmit", stage).addEventListener("click", submit);

    function submit() {
      var val = input.value.trim();
      if (!val) return;
      if (val === current) {
        level++;
        showNumber();
      } else {
        reveal(val);
      }
    }
  }

  function compareRow(label, str, refStr) {
    var wrap = document.createElement("div");
    var lab = document.createElement("div");
    lab.className = "num-label";
    lab.textContent = label;
    var row = document.createElement("div");
    row.className = "num-compare";
    for (var i = 0; i < str.length; i++) {
      var span = document.createElement("span");
      span.textContent = str[i];
      span.className = refStr !== null && str[i] === refStr[i] ? "ok" : (refStr === null ? "ok" : "err");
      row.appendChild(span);
    }
    wrap.appendChild(lab);
    wrap.appendChild(row);
    return wrap;
  }

  function reveal(answer) {
    var score = level - 1;
    var box = document.createElement("div");
    box.className = "stage-center";
    box.appendChild(compareRow("The number was", current, null));
    box.appendChild(compareRow("You typed", answer, current));
    var btn = document.createElement("button");
    btn.className = "btn";
    btn.style.marginTop = "22px";
    btn.textContent = "See my result";
    btn.addEventListener("click", function () {
      RL.finish(stage, "number", score, {
        detail: score === 0 ? "One digit slipped away - warm up and go again." : "You held " + score + " digit" + (score === 1 ? "" : "s") + " in memory.",
        onRetry: init
      });
    });
    box.appendChild(btn);
    stage.innerHTML = "";
    stage.appendChild(box);
  }

  init();
})();

/* Verbal Memory: has this word appeared before? SEEN or NEW. 3 lives. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var pool, seen, unseen, lives, score, currentWord, currentIsSeen, playing = false;

  function init() {
    stage.className = "stage";
    stage.innerHTML =
      '<div class="stage-center">' +
        '<div class="stage-icon">' + RL.ICONS.chat + "</div>" +
        "<h2>Verbal Memory</h2>" +
        "<p>Words appear one at a time. Press <b>SEEN</b> if the word already appeared this run, <b>NEW</b> if it has not. Keys: <span class='kbd'>S</span> / <span class='kbd'>N</span></p>" +
        '<button class="btn" id="vbStart">Start</button>' +
      "</div>";
    RL.$("#vbStart", stage).addEventListener("click", start);
  }

  function start() {
    pool = window.RLWORDS.verbal.slice();
    // shuffle
    for (var i = pool.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    unseen = pool;
    seen = [];
    lives = 3;
    score = 0;
    playing = true;

    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Score <b id="vbScore">0</b></span>' +
        '<span class="hud-item" id="vbLives"></span>' +
      "</div>" +
      '<div class="stage-body">' +
        '<div class="vb-word" id="vbWord"></div>' +
        '<div class="vb-btns">' +
          '<button class="btn btn-ghost" id="vbSeen">SEEN</button>' +
          '<button class="btn" id="vbNew">NEW</button>' +
        "</div>" +
      "</div>";

    RL.$("#vbSeen", stage).addEventListener("click", function () { answer(true); });
    RL.$("#vbNew", stage).addEventListener("click", function () { answer(false); });
    renderLives();
    nextWord();
  }

  function renderLives() {
    var el = RL.$("#vbLives", stage);
    var h = '<span class="lives" aria-label="' + lives + ' lives left">';
    for (var i = 0; i < 3; i++) h += '<i class="' + (i < lives ? "" : "off") + '"></i>';
    el.innerHTML = h + "</span>";
  }

  function nextWord() {
    var showSeen = seen.length > 2 && (Math.random() < 0.4 || unseen.length === 0);
    if (showSeen) {
      currentWord = seen[(Math.random() * seen.length) | 0];
      currentIsSeen = true;
    } else {
      currentWord = unseen.pop();
      currentIsSeen = false;
      seen.push(currentWord);
    }
    RL.$("#vbWord", stage).textContent = currentWord;
  }

  function answer(saidSeen) {
    if (!playing) return;
    if (saidSeen === currentIsSeen) {
      score++;
      RL.$("#vbScore", stage).textContent = score;
    } else {
      lives--;
      renderLives();
      var w = RL.$("#vbWord", stage);
      w.classList.add("shake");
      setTimeout(function () { w.classList.remove("shake"); }, 350);
      if (lives <= 0) {
        playing = false;
        setTimeout(function () {
          RL.finish(stage, "verbal", score, {
            detail: "You kept " + seen.length + " word" + (seen.length === 1 ? "" : "s") + " in play.",
            onRetry: init
          });
        }, 400);
        return;
      }
    }
    nextWord();
  }

  window.addEventListener("keydown", function (e) {
    if (!playing) return;
    if (e.key === "s" || e.key === "S") { e.preventDefault(); answer(true); }
    if (e.key === "n" || e.key === "N") { e.preventDefault(); answer(false); }
  });

  init();
})();

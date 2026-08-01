/* Typing Speed: 30-second WPM test on common English words. */
(function () {
  "use strict";
  var stage = document.getElementById("game");
  var DURATION = 30;
  var WORD_COUNT = 90;
  var words, wordEls, wIdx, started, startT, timerInt;
  var correctChars, typedChars, wordsDone, box, wordsEl, input, running = false;

  function pickWords() {
    var pool = window.RLWORDS.typing;
    var out = [];
    for (var i = 0; i < WORD_COUNT; i++) out.push(pool[(Math.random() * pool.length) | 0]);
    return out;
  }

  function init() {
    words = pickWords();
    wIdx = 0; started = false; running = true;
    correctChars = 0; typedChars = 0; wordsDone = 0;
    clearInterval(timerInt);

    stage.className = "stage";
    stage.innerHTML =
      '<div class="hud">' +
        '<span class="hud-item">Time <b id="tpTime">' + DURATION + "s</b></span>" +
        '<span class="hud-item">WPM <b id="tpWpm">-</b></span>' +
        '<span class="hud-item">Accuracy <b id="tpAcc">100%</b></span>' +
      "</div>" +
      '<div class="stage-body"><div class="type-wrap">' +
        '<div class="type-box blurred" id="tpBox">' +
          '<div class="type-words" id="tpWords"></div>' +
          '<input class="type-input" id="tpInput" type="text" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" aria-label="Type here">' +
        "</div>" +
        '<p class="tiny" style="text-align:center;margin-top:10px">Timer starts on your first keystroke. Space submits a word.</p>' +
      "</div></div>";

    box = RL.$("#tpBox", stage);
    wordsEl = RL.$("#tpWords", stage);
    input = RL.$("#tpInput", stage);

    wordEls = words.map(function (w, i) {
      var span = document.createElement("span");
      span.className = "word" + (i === 0 ? " active" : "");
      for (var c = 0; c < w.length; c++) {
        var ch = document.createElement("span");
        ch.className = "char" + (i === 0 && c === 0 ? " cur" : "");
        ch.textContent = w[c];
        span.appendChild(ch);
      }
      wordsEl.appendChild(span);
      return span;
    });
    wordsEl.style.transform = "translateY(0)";

    box.addEventListener("click", function () { input.focus(); });
    input.addEventListener("focus", function () { box.classList.remove("blurred"); });
    input.addEventListener("blur", function () { if (running && !started) box.classList.add("blurred"); });
    input.addEventListener("input", onType);
    input.focus();
  }

  function startClock() {
    started = true;
    startT = performance.now();
    timerInt = setInterval(function () {
      var elapsed = (performance.now() - startT) / 1000;
      var leftS = Math.max(0, Math.ceil(DURATION - elapsed));
      RL.$("#tpTime", stage).textContent = leftS + "s";
      updateLive(elapsed);
      if (elapsed >= DURATION) end();
    }, 100);
  }

  function updateLive(elapsed) {
    if (elapsed > 1) {
      var wpm = (correctChars / 5) / (elapsed / 60);
      RL.$("#tpWpm", stage).textContent = Math.round(wpm);
    }
    RL.$("#tpAcc", stage).textContent = typedChars ? Math.round((correctChars / typedChars) * 100) + "%" : "100%";
  }

  function paintCurrentWord(val) {
    var wordSpan = wordEls[wIdx];
    var target = words[wIdx];
    var chars = wordSpan.querySelectorAll(".char");
    for (var i = 0; i < chars.length; i++) {
      chars[i].className = "char";
      if (i < val.length) chars[i].className += val[i] === target[i] ? " ok" : " err";
      else if (i === val.length) chars[i].className += " cur";
    }
  }

  function commitWord(val) {
    var target = words[wIdx];
    var wordSpan = wordEls[wIdx];
    var okWhole = val === target;
    for (var i = 0; i < target.length; i++) {
      typedChars++;
      if (i < val.length && val[i] === target[i]) correctChars++;
    }
    typedChars++; // the space
    if (okWhole) { correctChars++; wordsDone++; }
    wordSpan.classList.remove("active");
    wordSpan.classList.add("done");

    wIdx++;
    if (wIdx >= words.length) { end(); return; }
    wordEls[wIdx].classList.add("active");
    paintCurrentWord("");

    // scroll: keep the active word on the first two visible lines
    var lineH = wordEls[0].offsetHeight || 35;
    var offset = wordEls[wIdx].offsetTop - wordsEl.offsetTop;
    if (offset > lineH * 1.5) {
      wordsEl.style.transform = "translateY(-" + (offset - lineH) + "px)";
    }
  }

  function onType() {
    if (!running) return;
    if (!started && input.value.length) startClock();
    var val = input.value;
    if (val.indexOf(" ") !== -1) {
      var parts = val.split(" ");
      var word = parts[0];
      if (word.length) commitWord(word);
      input.value = parts.slice(1).join(" ");
      if (running) paintCurrentWord(input.value);
    } else {
      paintCurrentWord(val);
    }
  }

  function end() {
    if (!running) return;
    running = false;
    clearInterval(timerInt);
    var elapsed = Math.min(DURATION, (performance.now() - startT) / 1000) || DURATION;
    var wpm = (correctChars / 5) / (elapsed / 60);
    var acc = typedChars ? Math.round((correctChars / typedChars) * 100) : 100;
    RL.finish(stage, "typing", Math.max(0, wpm), {
      detail: acc + "% accuracy - " + wordsDone + " word" + (wordsDone === 1 ? "" : "s") + " completed",
      onRetry: init
    });
  }

  init();
})();

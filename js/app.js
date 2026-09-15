(function () {
  "use strict";

  // ---- Role data ---------------------------------------------------------

  var ROLES = {
    SHERIFF: {
      label: "Sheriff", tag: "law", startLife: 60, public: true,
      cond: "Wins when both Outlaws are dead."
    },
    DEPUTY: {
      label: "Deputy", tag: "law", startLife: 40,
      cond: "Wins when both Outlaws are dead."
    },
    OUTLAW: {
      label: "Outlaw", tag: "outlaw", startLife: 40,
      cond: "Wins when the Sheriff is dead."
    },
    GUNSLINGER: {
      label: "Gunslinger", tag: "wild", startLife: 40,
      cond: "Wins when the Deputy, one Outlaw, and the Warrior are dead.",
      special: "When you'd die, don't: phase out your permanents, return your commander to the command zone, shuffle your library, keep your hand, then re-enter at 20 life. Your life total is locked and you have protection from everything until your next turn. Reveal this role the moment it happens."
    },
    WARRIOR: {
      label: "Warrior", tag: "outlaw", startLife: 40,
      cond: "Wins when the Deputy, one Outlaw, and the Gunslinger are dead.",
      special: "Whoever's source deals your killing blow is eliminated too. Reveal this role the moment you die."
    },
    CIVILIAN: {
      label: "Civilian", tag: "wild", startLife: 40,
      cond: "Wins alongside whoever wins the game.",
      special: "Stay hidden until someone else has already won — then reveal and claim your share."
    }
  };

  var ROLE_ORDER = ["SHERIFF", "DEPUTY", "OUTLAW", "GUNSLINGER", "WARRIOR", "CIVILIAN"];

  function roleSetFor(count) {
    var set = ["SHERIFF", "DEPUTY", "OUTLAW", "OUTLAW", "GUNSLINGER"];
    if (count >= 6) set.push("WARRIOR");
    if (count >= 7) set.push("CIVILIAN");
    return set;
  }

  function rosterFor(count) {
    var lines = [
      ["5 players", "Sheriff, Deputy, 2× Outlaw, Gunslinger"],
      ["6 players", "+ Warrior"],
      ["7 players", "+ Civilian"]
    ];
    return lines.map(function (l, i) {
      var n = i + 5;
      return '<tr class="' + (n === count ? "current-row" : "") + '"><td>' + l[0] + "</td><td>" + l[1] + "</td></tr>";
    }).join("");
  }

  // ---- Small utils --------------------------------------------------------

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function encodePayload(obj) {
    var json = JSON.stringify(obj);
    var b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodePayload(str) {
    try {
      var b64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      var json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function simpleHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return "wg_" + Math.abs(h);
  }

  // ---- DOM shells ----------------------------------------------------------

  var app = document.getElementById("app");
  var rulesToggle = document.getElementById("rulesToggle");
  var rulesBody = document.getElementById("rulesBody");

  rulesToggle.addEventListener("click", function () {
    var open = !rulesBody.hidden;
    rulesBody.hidden = open;
    rulesToggle.setAttribute("aria-expanded", String(!open));
    rulesToggle.textContent = (open ? "▸" : "▾") + " How roles & win conditions work";
  });

  function setRulesFor(count) {
    rulesBody.innerHTML =
      "<p>The Sheriff is always in the deck and is public from the start. Every other role is dealt secretly and stays hidden until the situation on its card says to flip it.</p>" +
      "<table>" + rosterFor(count || 5) + "</table>" +
      '<p style="margin-top:10px;">If a win condition names a role that isn’t in play at your table size, treat that role as already dead for the purpose of checking the condition.</p>';
  }
  setRulesFor(5);

  // ---- Deal screen (host) --------------------------------------------------

  function renderDealScreen() {
    var selectedCount = 5;

    app.innerHTML =
      '<div class="setup">' +
        "<h2>Deal a new game</h2>" +
        '<p class="hint">Pick your pod size and name the seats. You’ll get one private link per player — copy each one into a DM to that person. Nobody’s role ever touches a server; it lives only inside the link itself.</p>' +
        '<div class="field"><label>Players</label>' +
          '<div class="count-row" id="countRow">' +
            [5, 6, 7].map(function (n) {
              return '<button type="button" class="count-btn' + (n === 5 ? " active" : "") + '" data-n="' + n + '">' + n + " players</button>";
            }).join("") +
          "</div>" +
        "</div>" +
        '<div class="field"><label>Seat names (optional — blank becomes "Seat 1", "Seat 2", ...)</label>' +
          '<div class="name-inputs" id="nameInputs"></div>' +
        "</div>" +
        '<button class="primary-btn" id="dealBtn" type="button">Shuffle &amp; Deal</button>' +
      "</div>";

    function renderNameInputs(n) {
      var box = document.getElementById("nameInputs");
      var existing = Array.prototype.map.call(box.querySelectorAll("input"), function (i) { return i.value; });
      var html = "";
      for (var i = 0; i < n; i++) {
        var val = existing[i] ? escapeHtml(existing[i]) : "";
        html += '<input type="text" maxlength="24" placeholder="Seat ' + (i + 1) + '" value="' + val + '">';
      }
      box.innerHTML = html;
    }
    renderNameInputs(selectedCount);
    setRulesFor(selectedCount);

    document.getElementById("countRow").addEventListener("click", function (e) {
      var btn = e.target.closest(".count-btn");
      if (!btn) return;
      selectedCount = parseInt(btn.dataset.n, 10);
      Array.prototype.forEach.call(document.querySelectorAll(".count-btn"), function (b) {
        b.classList.toggle("active", b === btn);
      });
      renderNameInputs(selectedCount);
      setRulesFor(selectedCount);
    });

    document.getElementById("dealBtn").addEventListener("click", function () {
      var inputs = Array.prototype.slice.call(document.querySelectorAll("#nameInputs input"));
      var names = [];
      for (var i = 0; i < selectedCount; i++) {
        var v = inputs[i] && inputs[i].value.trim();
        names.push(v || ("Seat " + (i + 1)));
      }
      var roles = shuffle(roleSetFor(selectedCount));
      var sheriffIdx = roles.indexOf("SHERIFF");
      var sheriffName = names[sheriffIdx];

      var seats = names.map(function (name, i) {
        return { name: name, role: roles[i] };
      });

      var base = location.origin + location.pathname;
      var links = seats.map(function (seat) {
        var payload = {
          v: 1,
          pc: selectedCount,
          n: seat.name,
          r: seat.role,
          sh: sheriffName,
          ro: names
        };
        return { name: seat.name, role: seat.role, url: base + "#s=" + encodePayload(payload) };
      });

      renderLinkList(links, selectedCount);
    });
  }

  function discordBlockFor(links) {
    return links.map(function (l) {
      return "**" + l.name + (l.role === "SHERIFF" ? " ★" : "") + "**: ||<" + l.url + ">||";
    }).join("\n");
  }

  function renderLinkList(links, count) {
    var html = "";
    html += '<div class="deal-warning">Dealt for ' + count + ' players. Safest is DMing each link privately below. Or use <strong>Copy all for Discord</strong> to post one spoiler-tagged message in the pod’s channel — it works the same as a physical deal: everyone can technically peek at any line, so only click the one with your own name.</div>';
    html += '<div class="new-game-row" style="margin:0 0 16px;"><button class="primary-btn" id="copyAllBtn" type="button">Copy all for Discord</button></div>';
    html += '<div class="link-list">';
    links.forEach(function (l, i) {
      html += '<div class="link-card" data-i="' + i + '">' +
        '<div class="who">' + escapeHtml(l.name) + (l.role === "SHERIFF" ? " ★" : "") + "</div>" +
        '<a class="link-url" href="' + escapeHtml(l.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(l.url) + "</a>" +
        '<div class="link-actions">' +
          '<button class="mini-btn" data-act="copy" data-i="' + i + '" type="button">Copy link</button>' +
        "</div>" +
      "</div>";
    });
    html += "</div>";
    html += '<div class="new-game-row"><button class="ghost-btn" id="redealBtn" type="button">Start over</button></div>';

    app.innerHTML = html;

    function copyWithFeedback(text, btn, defaultLabel) {
      var mark = function () {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function () { btn.textContent = defaultLabel; btn.classList.remove("copied"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(mark).catch(function () { fallbackCopy(text, mark); });
      } else {
        fallbackCopy(text, mark);
      }
    }

    app.querySelectorAll('[data-act="copy"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.dataset.i, 10);
        copyWithFeedback(links[i].url, btn, "Copy link");
        btn.closest(".link-card").classList.add("sent");
      });
    });

    document.getElementById("copyAllBtn").addEventListener("click", function () {
      copyWithFeedback(discordBlockFor(links), document.getElementById("copyAllBtn"), "Copy all for Discord");
    });

    document.getElementById("redealBtn").addEventListener("click", function () {
      renderDealScreen();
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  // ---- Reveal screen (player) ---------------------------------------------

  function renderRevealScreen(payload) {
    var def = ROLES[payload.r];
    if (!def) { renderDealScreen(); return; }

    setRulesFor(payload.pc);

    var storeKey = simpleHash(location.hash) + "_life";
    var savedLife = null;
    try { savedLife = parseInt(localStorage.getItem(storeKey), 10); } catch (e) {}
    var life = isNaN(savedLife) ? def.startLife : savedLife;

    var html = "";
    html += '<div class="reveal-card">';
    html += '<div class="player-name">' + escapeHtml(payload.n) + "</div>";
    html += '<div class="role-name ' + def.tag + '">' + def.label + "</div>";
    html += '<div class="' + (def.public ? "public-tag" : "private-tag") + '">' + (def.public ? "Public role — reveal now" : "Private role — keep hidden") + "</div>";
    html += '<div class="win-cond">' + def.cond + "</div>";
    if (def.special) html += '<div class="special">' + def.special + "</div>";
    html += "</div>";

    html += '<div class="panel"><h3>The Sheriff</h3><div class="sheriff-line"><span class="badge">★</span><span>' +
      escapeHtml(payload.sh) + " starts at 60 life and is known to everyone from the start.</span></div></div>";

    if (payload.ro && payload.ro.length) {
      html += '<div class="panel"><h3>Table</h3><div class="roster">' +
        payload.ro.map(function (name) {
          return '<span class="' + (name === payload.n ? "me" : "") + '">' + escapeHtml(name) + (name === payload.n ? " (you)" : "") + "</span>";
        }).join("") +
        "</div></div>";
    }

    html += '<div class="panel"><h3>Your life total</h3>' +
      '<div class="life-row">' +
        '<button class="life-btn" id="lifeMinus" type="button">−</button>' +
        '<span class="life-val" id="lifeVal">' + life + "</span>" +
        '<button class="life-btn" id="lifePlus" type="button">+</button>' +
      "</div>" +
      '<div class="life-hint">Tracked only on this device — nothing here is shared with the table.</div>' +
    "</div>";

    html += '<div class="new-game-row"><a class="ghost-btn" href="' + location.origin + location.pathname + '">Deal a new game</a></div>';

    app.innerHTML = html;

    var lifeVal = document.getElementById("lifeVal");
    function saveLife() { try { localStorage.setItem(storeKey, String(life)); } catch (e) {} }
    document.getElementById("lifeMinus").addEventListener("click", function () { life--; lifeVal.textContent = life; saveLife(); });
    document.getElementById("lifePlus").addEventListener("click", function () { life++; lifeVal.textContent = life; saveLife(); });
  }

  // ---- Boot -----------------------------------------------------------------

  function boot() {
    var m = /[#&]s=([A-Za-z0-9\-_]+)/.exec(location.hash);
    if (m) {
      var payload = decodePayload(m[1]);
      if (payload && payload.r) {
        renderRevealScreen(payload);
        return;
      }
    }
    renderDealScreen();
  }

  window.addEventListener("hashchange", boot);
  boot();
})();

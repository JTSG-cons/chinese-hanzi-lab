// Reading, listening, overview, characters grid, palace page.
import { $, h, LESSONS, CHARS, BY_CHAR, HANZI, OVERVIEW, chips, speak, speech, colorPinyin, plain, toneOf, withTone, review, fstore, dueTime, charLevel, shuffle, pick, esc, read, write } from "./core.js";
import { openCard } from "./card.js";
import { palace, toneScene, timeline } from "./scenes.js";
import { charMeaning } from "./drills.js";

// ---------- READING ----------
let readingLesson = 1;
function dialogue(lines) {
  return h("ol", { class: "dlg" }, ...lines.map(l => {
    if (!l[2]) return h("li", { class: "head" }, l[1]);
    const li = h("li", { tabindex: "0" }, h("span", { class: "who" }, l[0]),
      h("div", {}, h("div", { class: "hz" }, l[1]), h("div", { class: "py", html: colorPinyin(l[2]) }), h("div", { class: "en" }, l[3])));
    let s = 0;
    const step = () => { s = (s + 1) % 3; li.className = s ? "s" + s : ""; if (s === 1) speak(l[1]); };
    li.addEventListener("click", step); li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); step(); } });
    return li;
  }));
}
export function readingQuestions(n, count = 4) {
  const L = LESSONS[n - 1];
  const lines = [...L.practice, ...((window.BOOK_TEXTS && window.BOOK_TEXTS[n]) || [])].filter(l => l[2]);
  const others = LESSONS.flatMap(x => x.practice).filter(l => l[2]);
  return pick(lines, count).map(l => {
    const wrong = pick(others.filter(o => o[3] !== l[3]), 3).map(o => o[3]);
    const opts = shuffle([l[3], ...wrong]);
    return { q: `What does <span class="zh">${esc(l[1])}</span> mean?`, opts, ans: opts.indexOf(l[3]), why: `${esc(l[1])} · ${esc(l[2])}` };
  });
}
function renderReading() {
  const n = readingLesson, L = LESSONS[n - 1];
  const book = window.BOOK_TEXTS && window.BOOK_TEXTS[n];
  $("reading-text").replaceChildren(
    h("h2", {}, h("span", { class: "zh" }, `第${"一二三四五六七八"[n - 1]}课 ${L.zh}`), " ", h("small", { class: "muted" }, L.en)),
    book ? h("div", {}, h("p", {}, h("span", { class: "src-tag" }, "课文 · textbook text (your local copy)")), dialogue(book)) : null,
    h("p", { style: "margin-top:14px" }, h("span", { class: "src-tag" }, "Practice dialogue: same words, new sentences")),
    dialogue(L.practice),
    h("button", { class: "small ghost", type: "button", style: "margin-top:10px", onclick: () => speak((book || L.practice).filter(l => l[2]).map(l => l[1]).join("。"), .75) }, "🔊 Read whole dialogue"));
  const qs = readingQuestions(n);
  const qbox = h("div");
  qs.forEach((q, i) => {
    const box = h("div", { class: "mq" }, h("div", { class: "q", html: `${i + 1}. ${q.q}` }));
    q.opts.forEach((o, k) => {
      const lab = h("label", {}, h("input", { type: "radio", name: `rq${i}` }), o);
      lab.querySelector("input").onchange = () => { box.className = "mq " + (k === q.ans ? "ok" : "no"); lab.classList.add("picked"); box.querySelectorAll("label")[q.ans].classList.add("correct"); };
      box.append(lab);
    });
    box.append(h("div", { class: "why", html: q.why })); qbox.append(box);
  });
  $("reading-side").replaceChildren(
    h("h2", {}, "Notes"),
    h("dl", { class: "notes" }, ...L.notes.flatMap(([t, d]) => [h("dt", {}, t), h("dd", {}, d)])),
    h("h2", { style: "margin-top:18px" }, "Check yourself"), qbox,
    h("h3", { style: "margin-top:18px" }, "New words"),
    h("div", { class: "tile-row" }, ...CHARS.filter(r => r.lesson === n).map(r => tile(r))));
}
export function enterReading(arg) { if (arg) { readingLesson = +arg; readingChips?.(); } renderReading(); }
let readingChips;
function initReading() {
  const draw = () => $("reading-lessons").replaceChildren(...LESSONS.map(L => h("button", { class: "chip" + (L.n === readingLesson ? " on" : ""), type: "button", onclick: () => { readingLesson = L.n; draw(); renderReading(); } }, `L${L.n} ${L.zh}`)));
  readingChips = draw; draw();
}

// ---------- LISTENING ----------
const AMBIG = new Set("行便还了的么吗吧子头识系气宜谁哪那妈爸哥弟妹".split(""));
const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "z", "c", "s", "r"];
export function split(py) {
  const p = plain(py).toLowerCase();
  const ini = INITIALS.find(i => p.startsWith(i)) || "";
  let fin = p.slice(ini.length);
  if ("jqx".includes(ini) && ini && fin.startsWith("u")) fin = "ü" + fin.slice(1);
  if (fin === "iu") fin = "iou"; if (fin === "ui") fin = "uei"; if (fin === "un" && !"jqx".includes(ini)) fin = "uen";
  return { ini, fin };
}
export const listenChars = ls => CHARS.filter(r => ls.includes(r.lesson) && !AMBIG.has(r.c) && toneOf(r.py) && HANZI[r.c]);
let getListenLs, getListenMode, toneCtl;
const LMODES = [["tone", "Mark the tone"], ["same", "Same or different"], ["initial", "Initial"], ["final", "Final"], ["sentence", "Sentence"]];
function listenItem() {
  const ls = getListenLs().map(Number), mode = getListenMode()[0];
  const card = $("listen-card");
  const pool = listenChars(ls);
  const fb = h("p", { class: "feedback" });
  const next = h("button", { class: "btn", type: "button", style: "display:none;margin-top:12px", onclick: listenItem }, "Next →");
  let done = false;
  const finish = (id, ok, msg) => { if (done) return; done = true; review(id, ok, { kind: "listen" }); fb.className = "feedback " + (ok ? "good" : "bad"); fb.innerHTML = (ok ? "✓ " : "✗ ") + msg; next.style.display = "inline-flex"; };
  const play = (txt, r = .7) => { speak(txt, r); };
  const btns = (labels, correct, onPick, cls = "") => h("div", { class: "opts" }, ...labels.map(([k, html]) => {
    const b = h("button", { class: "opt " + cls, type: "button", html });
    b.onclick = () => { if (done) return; const ok = k === correct; b.classList.add(ok ? "right" : "wrong"); onPick(ok); };
    return b;
  }));
  let body = [];
  if (mode === "sentence") {
    const lines = ls.flatMap(n => [...LESSONS[n - 1].practice, ...((window.BOOK_TEXTS && window.BOOK_TEXTS[n]) || [])]).filter(l => l[2]);
    const l = lines[Math.random() * lines.length | 0];
    const opts = shuffle([l, ...pick(lines.filter(x => x[1] !== l[1]), 3)]);
    body = [h("button", { class: "btn big-btn", type: "button", onclick: () => play(l[1], .75) }, "🔊 Play sentence"),
      btns(opts.map(o => [o[1], esc(o[1])]), l[1], ok => finish(`ls:${l[1]}`, ok, `${esc(l[1])}<br><span class="muted">${esc(l[2])} · ${esc(l[3])}</span>`), "zh")];
    setTimeout(() => play(l[1], .75), 250);
  } else {
    const r = pool[Math.random() * pool.length | 0];
    if (!r) { card.replaceChildren(h("p", {}, "Pick a lesson.")); return; }
    const t = toneOf(r.py), { ini, fin } = split(r.py);
    const reveal = `${r.c} <b>${colorPinyin(r.py)}</b> · ${esc(charMeaning(r))}`;
    const playBtn = h("button", { class: "btn big-btn", type: "button", onclick: () => { play(r.c); toneCtl?.play(t); } }, "🔊 Play");
    if (mode === "tone") {
      body = [playBtn, h("p", { class: "muted" }, plain(r.py) + " — which tone?"),
        btns([1, 2, 3, 4].map(k => [k, `<span class="t${k}">${withTone(plain(r.py), k)} · tone ${k}</span>`]), t, ok => { toneCtl?.play(t); finish(`lt:${r.c}`, ok, reveal); })];
    } else if (mode === "same") {
      const same = Math.random() < .5;
      const shown = same ? r.py : withTone(plain(r.py), [1, 2, 3, 4].filter(k => k !== t)[Math.random() * 3 | 0]);
      body = [playBtn, h("div", { class: "prompt sm", html: colorPinyin(shown) }), h("p", { class: "muted" }, "Is this what you hear?"),
        btns([[true, "✓ Same"], [false, "✗ Different"]], same, ok => finish(`lsd:${r.c}`, ok, reveal))];
    } else if (mode === "initial") {
      const others = shuffle([...new Set(pool.map(x => split(x.py).ini).filter(x => x && x !== ini))]).slice(0, 3);
      const opts = shuffle([ini || "(none)", ...others]);
      body = [playBtn, h("p", { class: "muted" }, "Which initial (声母)?"), btns(opts.map(o => [o, o]), ini || "(none)", ok => finish(`li:${r.c}`, ok, reveal))];
    } else {
      const others = shuffle([...new Set(pool.map(x => split(x.py).fin).filter(x => x && x !== fin))]).slice(0, 3);
      const opts = shuffle([fin, ...others]);
      body = [playBtn, h("p", { class: "muted" }, "Which final (韵母)?"), btns(opts.map(o => [o, o]), fin, ok => finish(`lf:${r.c}`, ok, reveal))];
    }
    setTimeout(() => play(r.c), 250);
  }
  card.replaceChildren(h("p", { class: "eyebrow" }, LMODES.find(m => m[0] === mode)[1]), ...body, fb, next);
}
function ttsStatus() {
  const el = $("tts-status");
  if (!speech.ok) el.textContent = "This browser has no speech synthesis, so audio drills won't play. Try Chrome or Safari.";
  else if (!speech.voice) el.textContent = "No Chinese voice found yet. On Windows: Settings → Time & language → Speech → add Chinese (Simplified). On phones a Chinese voice is usually built in.";
  else el.textContent = `Voice: ${speech.voice.name}`;
}
function initListening() {
  getListenLs = chips($("listen-lessons"), [1, 2, 3, 4, 5].map(n => [String(n), `L${n}`]), { multi: true, initial: ["1", "2", "3", "4", "5"], key: "hzl-listen-ls", onChange: listenItem });
  getListenMode = chips($("listen-modes"), LMODES, { initial: ["tone"], key: "hzl-listen-mode", onChange: listenItem });
  $("tone-buttons").replaceChildren(...[1, 2, 3, 4].map(t => h("button", { class: "small ghost", type: "button", onclick: () => { toneCtl?.play(t); speak(["妈", "麻", "马", "骂"][t - 1], .6); } }, h("span", { class: "t" + t }, `${withTone("ma", t)} ${["妈", "麻", "马", "骂"][t - 1]}`))));
  addEventListener("voiceready", ttsStatus); ttsStatus();
}
export function enterListening() {
  if (!toneCtl) toneCtl = toneScene($("tone-3d"), { tones: [1, 2, 3, 4] });
  ttsStatus(); listenItem();
}

// ---------- CHARACTERS ----------
export function tile(r) {
  const lv = charLevel(r.c);
  return h("button", { class: "tile lv" + lv, type: "button", title: `${r.c} ${r.py}`, onclick: () => openCard(r.c) }, r.c, h("small", {}, r.py));
}
let paperTest = false;
function renderChars(ls) {
  const grid = $("chars-grid");
  grid.replaceChildren(
    h("div", { class: "row" }, h("label", { class: "row" }, h("input", { type: "checkbox", checked: paperTest ? "" : false, onchange: e => { paperTest = e.target.checked; renderChars(ls); } }), "Paper test: hide characters (write them on paper, tap to check)")),
    ...LESSONS.filter(L => ls.includes(String(L.n))).map(L => {
      const cs = CHARS.filter(r => r.lesson === L.n);
      return h("div", { class: "lesson-block" }, h("h3", {}, `L${L.n}`, h("span", { class: "zh" }, L.zh), h("small", { class: "muted" }, `${cs.length} characters`)),
        h("div", { class: "tile-row" }, ...cs.map(r => paperTest ? paperTile(r) : tile(r))));
    }));
}
function paperTile(r) {
  const b = h("button", { class: "tile", type: "button", style: "width:auto;min-width:92px;padding:4px 8px;font:13px/1.2 var(--sans);height:auto;min-height:58px" }, h("span", { html: colorPinyin(r.py) + "<br>" + esc(charMeaning(r).slice(0, 26)) }));
  b.onclick = () => { b.replaceChildren(r.c); b.style.font = ""; b.style.fontFamily = "var(--cjk)"; b.style.fontSize = "1.8rem"; b.onclick = () => openCard(r.c); };
  return b;
}
function initChars() {
  chips($("chars-filter"), LESSONS.map(L => [String(L.n), `L${L.n}`]), { multi: true, initial: ["1", "2", "3", "4", "5", "6", "7", "8"], key: "hzl-chars-ls", onChange: renderChars });
}
export function enterChars() { renderChars(read("hzl-chars-ls", ["1", "2", "3", "4", "5", "6", "7", "8"])); }

// ---------- PALACE ----------
let pal, room = 1;
function renderRoomList() {
  $("palace-rooms").replaceChildren(...LESSONS.map(L => h("button", { class: "chip" + (L.n === room ? " on" : ""), type: "button", onclick: () => { location.hash = `#palace/${L.n}`; } }, `${L.n} · ${L.room}`)));
  $("palace-list-title").textContent = `Room ${room}: ${LESSONS[room - 1].room} (${LESSONS[room - 1].zh})`;
  $("palace-list").replaceChildren(...CHARS.filter(r => r.lesson === room).map(tile));
}
export function enterPalace(arg) {
  if (arg) room = Math.min(8, Math.max(1, +arg || 1));
  if (!pal) pal = palace($("palace-3d"), { onPick: c => openCard(c), getRoom: () => room });
  else pal.setRoom(room);
  renderRoomList();
}

// ---------- OVERVIEW ----------
let tl;
function showEvent(i) {
  const e = OVERVIEW.timeline[i];
  const yr = e.y < 0 ? `${Math.abs(e.y).toLocaleString()} B.C.` : e.y;
  $("timeline-detail").replaceChildren(h("h3", {}, `${yr} · ${e.label} `, h("small", {}, e.era)), h("p", {}, e.note),
    h("div", { class: "row" }, h("button", { class: "small ghost", type: "button", disabled: i === 0 ? "" : false, onclick: () => showEvent(i - 1) }, "← Earlier"), h("button", { class: "small ghost", type: "button", disabled: i === OVERVIEW.timeline.length - 1 ? "" : false, onclick: () => showEvent(i + 1) }, "Later →")));
}
function ovQuiz(box) {
  const Q = OVERVIEW.quiz, now = Date.now();
  const ids = Q.map((q, i) => ({ i, id: `o:${i}`, due: dueTime(`o:${i}`) }));
  const due = ids.filter(x => fstore.cards[x.id] && x.due <= now);
  const fresh = ids.filter(x => !fstore.cards[x.id]);
  const it = due[0] || fresh[Math.random() * fresh.length | 0] || ids.sort((a, b) => a.due - b.due)[0];
  const [q, right, wrongs] = Q[it.i];
  const opts = shuffle([right, ...wrongs]);
  const fb = h("p", { class: "feedback" });
  let done = false;
  box.replaceChildren(h("p", { class: "eyebrow" }, `Quiz · ${due.length} due · ${fresh.length} new`), h("p", { style: "font-weight:600" }, q),
    h("div", { class: "opts" }, ...opts.map(o => { const b = h("button", { class: "opt", type: "button" }, o); b.onclick = () => { if (done) return; done = true; const ok = o === right; b.classList.add(ok ? "right" : "wrong"); review(it.id, ok, { kind: "ov" }); fb.className = "feedback " + (ok ? "good" : "bad"); fb.textContent = ok ? "✓ Right." : `✗ Answer: ${right}`; nx.style.display = "inline-flex"; }; return b; })),
    fb);
  const nx = h("button", { class: "btn", type: "button", style: "display:none", onclick: () => ovQuiz(box) }, "Next →"); box.append(nx);
}
function initOverview() {
  $("ov-sections").replaceChildren(...OVERVIEW.sections.map((s, i) => h("details", { open: i === 0 ? "" : false },
    h("summary", {}, s.title, s.zh ? h("span", { class: "zh" }, " " + s.zh) : null, h("small", {}, s.src)),
    h("ul", {}, ...s.points.map(p => h("li", { html: esc(p).replace(/KEY SENTENCE:/, "<b style='color:var(--seal)'>KEY SENTENCE:</b>") }))))));
  const qbox = h("div", { class: "drill-card", style: "margin:14px 0 0;text-align:left;min-height:0" });
  $("ov-keywords").replaceChildren(...OVERVIEW.keywords.map(([zh, py, en]) => h("div", { class: "kw" }, h("span", { class: "zh" }, zh), h("span", {}, h("span", { html: colorPinyin(py) }), h("br"), h("span", { class: "muted" }, en)))),
    h("h2", { style: "margin-top:16px" }, "Quiz round"), qbox);
  ovQuiz(qbox);
}
export function enterOverview() {
  if (!tl) { tl = true; timeline($("timeline-3d"), showEvent); }
}

export function initPages() { initReading(); initListening(); initChars(); initOverview(); addEventListener("progress", () => { if (location.hash.startsWith("#palace")) renderRoomList(); }); }

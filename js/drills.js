// FSRS-scheduled drills.
import { $, h, CHARS, LESSONS, BY_CHAR, HANZI, fstore, review, dueTime, chips, pick, shuffle, speak, colorPinyin, plain, toneOf, withTone, esc } from "./core.js";
import { makeWriter, openCard } from "./card.js";

const MODES = [
  ["mix", "Mixed"], ["meaning", "Character → meaning"], ["pinyin", "Character → pinyin"],
  ["write", "Meaning → write"], ["word", "Word → meaning"], ["order", "Sentence order"], ["hear", "Hear → character"]
];
let getLessons, getMode, recent = [];

// meaning for a single character
export function charMeaning(r) {
  const solo = r.words.find(w => w[0] === r.c);
  if (solo) return solo[3];
  const w = r.words[0];
  return `part of ${w[0]} (${w[3]})`;
}
function wordList(ls) {
  return ls.flatMap(n => LESSONS[n - 1].words.filter(w => [...w[0]].filter(c => /[一-鿿]/.test(c)).length >= 1 && w[4] !== "p").map(w => ({ w, n })));
}
export function sentences(ls) {
  const out = [];
  for (const n of ls) {
    const L = LESSONS[n - 1];
    const src = [...L.practice, ...((window.BOOK_TEXTS && window.BOOK_TEXTS[n]) || [])];
    for (const line of src) {
      const hz = line[1].replace(/[（(][^)）]*[)）]/g, "");
      const toks = tokenize(hz, n);
      if (toks.length >= 3 && toks.length <= 9) out.push({ n, hz, toks, py: line[2], en: line[3] });
    }
  }
  return out;
}
// split a sentence into known words (longest match on lesson vocab) + punctuation dropped
export function tokenize(s, upto = 8) {
  const vocab = LESSONS.slice(0, upto).flatMap(L => L.words.map(w => w[0].replace(/[（）()…]/g, ""))).filter(Boolean)
    .concat(["星期二", "星期四", "二十一", "二十九", "五十", "二十", "十二", "这是", "那是"]).sort((a, b) => b.length - a.length);
  const toks = []; let i = 0;
  const clean = s.replace(/[，。！？、：；“”]/g, "");
  while (i < clean.length) {
    const m = vocab.find(v => clean.startsWith(v, i));
    if (m) { toks.push(m); i += m.length; } else { toks.push(clean[i]); i++; }
  }
  return toks;
}

function candidates(ls, mode) {
  const chars = CHARS.filter(r => ls.includes(r.lesson) && (r.core || r.words.some(w => !w[4] || w[4] === "x")) && HANZI[r.c]);
  const items = [];
  const add = (id, kind, data) => items.push({ id, kind, data, due: dueTime(id) });
  const want = k => mode === "mix" || mode === "due" || mode === k;
  if (want("meaning")) chars.forEach(r => add(`m:${r.c}`, "meaning", r));
  if (want("pinyin")) chars.forEach(r => add(`p:${r.c}`, "pinyin", r));
  if (want("write")) chars.forEach(r => add(`w:${r.c}`, "write", r));
  if (want("word")) wordList(ls).filter(x => x.w[0].length > 1).forEach(x => add(`v:${x.w[0]}`, "word", x));
  if (want("hear")) wordList(ls).forEach(x => add(`l:${x.w[0]}`, "hear", x));
  if (want("order")) sentences(ls).forEach(s => add(`s:${s.hz}`, "order", s));
  return items;
}

function nextItem() {
  const ls = getLessons().map(Number), mode = getMode()[0];
  let items = candidates(ls, mode).filter(it => !recent.includes(it.id));
  const now = Date.now();
  const seen = items.filter(it => fstore.cards[it.id]);
  const due = seen.filter(it => it.due <= now).sort((a, b) => a.due - b.due);
  if (due.length) return due[0];
  // new items in lesson order, mixing kinds
  const fresh = items.filter(it => !fstore.cards[it.id]);
  if (fresh.length) {
    const minL = Math.min(...fresh.map(it => it.data.lesson || it.data.n));
    const pool = fresh.filter(it => (it.data.lesson || it.data.n) === minL);
    return pool[Math.random() * pool.length | 0];
  }
  // everything learned and nothing due: extra practice on the soonest-due items
  return seen.sort((a, b) => a.due - b.due)[Math.random() * Math.min(8, seen.length) | 0];
}

function stats() {
  const ls = getLessons().map(Number), mode = getMode()[0];
  const items = candidates(ls, mode), now = Date.now();
  const due = items.filter(it => fstore.cards[it.id] && it.due <= now).length;
  const fresh = items.filter(it => !fstore.cards[it.id]).length;
  $("drill-stats").textContent = `${due} due · ${fresh} new · ${items.length - fresh} learned in this selection`;
}

function optionButtons(opts, correct, onDone, cls = "") {
  const wrap = h("div", { class: "opts" });
  let done = false;
  opts.forEach(o => {
    const b = h("button", { class: "opt " + cls, type: "button", html: o.html ?? esc(o.label) });
    b.addEventListener("click", () => {
      if (done) return; done = true;
      const ok = o.key === correct;
      b.classList.add(ok ? "right" : "wrong");
      if (!ok) [...wrap.children].find(x => x.dataset.key === correct)?.classList.add("right");
      onDone(ok);
    });
    b.dataset.key = o.key; wrap.append(b);
  });
  return wrap;
}

function show() {
  const it = nextItem(); const card = $("drill-card");
  if (!it) { card.replaceChildren(h("p", {}, "Pick at least one lesson.")); return; }
  recent.push(it.id); if (recent.length > 6) recent.shift();
  const fb = h("p", { class: "feedback" });
  const nextBtn = h("button", { class: "btn", type: "button", style: "margin-top:12px;display:none", onclick: show }, "Next →");
  let finished = false;
  const finish = (ok, msg = "") => {
    if (finished) return; finished = true;
    review(it.id, ok, { kind: it.kind });
    fb.className = "feedback " + (ok ? "good" : "bad");
    fb.innerHTML = (ok ? "✓ Right. " : "✗ Not quite. ") + msg;
    nextBtn.style.display = "inline-flex"; nextBtn.focus();
    stats();
  };
  const tag = h("p", { class: "eyebrow" }, `${MODES.find(m => m[0] === it.kind)?.[1] || it.kind} · L${it.data.lesson || it.data.n}${fstore.cards[it.id] ? "" : " · new"}`);
  let content = [];
  const allChars = CHARS.filter(r => HANZI[r.c]);

  if (it.kind === "meaning") {
    const r = it.data, right = charMeaning(r);
    const dis = pick(allChars.filter(x => x.c !== r.c && charMeaning(x) !== right), 3).map(x => charMeaning(x));
    const opts = shuffle([right, ...dis]).map(m => ({ key: m, label: m }));
    content = [h("div", { class: "prompt" }, r.c),
      optionButtons(opts, right, ok => finish(ok, `${r.c} <b>${r.py}</b>: ${esc(right)}. <a href="#" data-open="${r.c}">Open card</a>`))];
    speak(r.c);
  } else if (it.kind === "pinyin") {
    const r = it.data, base = plain(r.py), t = toneOf(r.py);
    const set = new Set([r.py]);
    [1, 2, 3, 4].filter(x => x !== t).forEach(x => set.add(withTone(base, x)));
    const others = shuffle(allChars.filter(x => plain(x.py) !== base)).slice(0, 2).map(x => x.py);
    const opts = shuffle([...set].slice(0, 3).concat(others.slice(0, 1))).map(p => ({ key: p, html: colorPinyin(p) }));
    if (!opts.some(o => o.key === r.py)) opts[0] = { key: r.py, html: colorPinyin(r.py) };
    content = [h("div", { class: "prompt" }, r.c),
      optionButtons(shuffle(opts), r.py, ok => { speak(r.c); finish(ok, `${r.c} = <b>${r.py}</b> (tone ${t || "neutral"})`); })];
  } else if (it.kind === "write") {
    const r = it.data;
    const box = h("div", { class: "quiz-writer writer" });
    content = [h("div", { class: "prompt-en" }, charMeaning(r)), h("div", { class: "big-py", html: colorPinyin(r.py) }), box,
      h("div", { class: "row", style: "justify-content:center" },
        h("button", { class: "small ghost", type: "button", onclick: () => speak(r.c) }, "🔊"),
        h("button", { class: "small ghost", type: "button", onclick: () => { w?.cancelQuiz(); w?.showCharacter(); finish(false, `It was ${r.c}. Watch the strokes, then write it on paper 3×.`); w?.animateCharacter(); } }, "Show me"))];
    let w;
    queueMicrotask(() => {
      w = makeWriter(box, r.c, { size: 260, showCharacter: false });
      w?.quiz({ showHintAfterMisses: 3, onComplete: s => { const ok = s.totalMistakes <= 3; w.showCharacter(); finish(ok, `${s.totalMistakes} stroke mistakes. ${r.c} ${r.py}`); } });
    });
  } else if (it.kind === "word") {
    const { w } = it.data;
    const pool = wordList(LESSONS.map(L => L.n)).filter(x => x.w[3] !== w[3]);
    const opts = shuffle([w[3], ...pick(pool, 3).map(x => x.w[3])]).map(m => ({ key: m, label: m }));
    content = [h("div", { class: "prompt sm" }, w[0]), optionButtons(opts, w[3], ok => { speak(w[0]); finish(ok, `${esc(w[0])} <b>${w[1]}</b>: ${esc(w[3])}`); })];
  } else if (it.kind === "hear") {
    const { w } = it.data;
    const word = w[0].replace(/[（）()…]/g, "");
    const pool = wordList(LESSONS.map(L => L.n)).filter(x => x.w[0] !== w[0] && x.w[0].length === w[0].length);
    const opts = shuffle([w[0], ...pick(pool.length >= 3 ? pool : wordList([1, 2, 3, 4, 5, 6, 7, 8]), 3).map(x => x.w[0])]).map(m => ({ key: m, label: m }));
    content = [h("button", { class: "btn big-btn", type: "button", onclick: () => speak(word, .7) }, "🔊 Play"),
      optionButtons(opts, w[0], ok => finish(ok, `${esc(w[0])} <b>${w[1]}</b>: ${esc(w[3])}`), "zh")];
    setTimeout(() => speak(word, .7), 250);
  } else if (it.kind === "order") {
    const s = it.data, line = h("div", { class: "order-line" }), pool = h("div", { class: "order-pool" });
    const placed = [];
    const toks = shuffle(s.toks.map((t, i) => ({ t, i })));
    toks.forEach(tok => {
      const b = h("button", { type: "button" }, tok.t);
      b.onclick = () => {
        if (b.parentNode === pool) { line.append(b); placed.push(tok.t); } else { pool.append(b); placed.splice(placed.indexOf(tok.t), 1); }
        if (placed.length === s.toks.length) {
          const ok = placed.join("") === s.toks.join("");
          [...line.children, ...pool.children].forEach(x => x.disabled = true);
          speak(s.hz); finish(ok, `${esc(s.hz)}<br><span class="muted">${esc(s.py)} · ${esc(s.en)}</span>`);
        }
      };
      pool.append(b);
    });
    content = [h("div", { class: "prompt-en" }, s.en), h("p", { class: "muted" }, "Tap the words in the right order."), line, pool];
  }
  card.replaceChildren(tag, ...content, fb, nextBtn);
  stats();
}
document.addEventListener("click", e => {
  const a = e.target.closest?.("[data-open]");
  if (a && a.closest("#drill-card")) { e.preventDefault(); openCard(a.dataset.open); }
});

export function initDrill() {
  getLessons = chips($("drill-lessons"), LESSONS.map(L => [String(L.n), `L${L.n}`]), { multi: true, initial: ["1", "2", "3"], key: "hzl-drill-ls", onChange: show });
  getMode = chips($("drill-modes"), MODES, { initial: ["mix"], key: "hzl-drill-mode", onChange: show });
}
export function enterDrill() { show(); }

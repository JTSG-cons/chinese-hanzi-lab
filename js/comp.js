// Comprehensive Chinese exam page: practise each of the 10 mid-term question types,
// with the textbook's own exercises and recordings where they exist.
import { $, h, esc, colorPinyin, read, write, review } from "./core.js";
import { COMP_TYPES, renderQuestion, gradeQuestion, playQ, playClip } from "./mock.js";

const TIPS = {
  ini: "Initials come in look-alike sets: b/p · d/t · g/k (p, t, k have a puff of air) · j/q/x · z/c/s · zh/ch/sh/r · n/l · f/h.",
  fin: "Listen for the ending: -n (tongue front) vs -ng (back): an/ang, en/eng, in/ing. ü after j, q, x is written u.",
  word: "The options differ by one sound or one tone. Decide the tones first, then the initials.",
  insent: "Hear the whole sentence once, then find the one word that was in it.",
  sent: "Catch the question word (吗, 哪儿, 几…) and the verb; that usually decides it.",
  parts: "Initials go before the vowel; the tone mark sits on a, o, e first, else on the last of i/u/ü (nǐ, liù, guì).",
  py: "Write the dictionary tones, e.g. 不客气 bú kèqi (不 → bú before 4th tone).",
  hz: "Write it by hand on paper first; the exam is handwritten.",
  answer: "Answer with a full short sentence and reuse the words of the question: 你忙吗？→ 我很忙。",
  order: "Chinese order: who + when + where/verb + what. 吗 and question words stay at the end or in place."
};
const LISTEN = new Set(["ini", "fin", "word", "insent", "sent", "parts"]);
const STATS = "hzl-comp-stats";
const stats = () => read(STATS, {});
function bump(id, ok) { const s = stats(); const [r, t] = s[id] || [0, 0]; s[id] = [r + (ok ? 1 : 0), t + 1]; write(STATS, s); }

let current = null, streak = 0;
function drawTypes() {
  const s = stats();
  $("comp-types").replaceChildren(...COMP_TYPES.map(t => {
    const [r, n] = s[t.id] || [0, 0];
    const pct = n ? Math.round(r / n * 100) : null;
    return h("button", { type: "button", class: "ctype" + (current === t.id ? " on" : ""), onclick: () => start(t.id) },
      h("b", {}, t.title.split("、")[0]),
      h("span", {}, t.title.split("、")[1]),
      h("small", { class: "muted" }, LISTEN.has(t.id) ? "🎧 listening" : "✍ writing"),
      h("i", { class: "bar" }, h("i", { style: `width:${pct ?? 0}%` })),
      h("small", {}, n ? `${pct}% of ${n}` : "not tried yet"));
  }), h("button", { type: "button", class: "ctype mixed" + (current === "mix" ? " on" : ""), onclick: () => start("mix") }, h("b", {}, "✦"), h("span", {}, "Mixed: all 10 types"), h("small", { class: "muted" }, "like the exam"), h("i", { class: "bar" }, h("i", { style: "width:0" })), h("small", {}, "")));
}

function start(id) {
  current = id; streak = 0;
  drawTypes();
  next();
  $("comp-practice").scrollIntoView({ behavior: "smooth", block: "start" });
}
function next() {
  const T = current === "mix" ? COMP_TYPES[Math.random() * COMP_TYPES.length | 0] : COMP_TYPES.find(t => t.id === current);
  let q = null;
  for (let k = 0; k < 4 && !q; k++) q = T.gen(1)[0];
  const card = $("comp-practice");
  if (!q) { card.replaceChildren(h("p", {}, "No question available for this type.")); return; }
  const fb = h("p", { class: "feedback" });
  const nextBtn = h("button", { class: "btn", type: "button", style: "display:none", onclick: next }, "Next →");
  let done = false, has = false;
  const finish = () => {
    if (done || !has) return; done = true;
    const ok = gradeQuestion(q, ok2 => { const s = stats(), cur = s[T.id] || [0, 1], want = ok2 ? 1 : 0; cur[0] += want - (q.selfCounted || 0); q.selfCounted = want; s[T.id] = cur; write(STATS, s); fb.className = "feedback " + (ok2 ? "good" : "bad"); fb.textContent = ok2 ? "✓ Marked correct." : "✗ Marked wrong."; drawTypes(); });
    bump(T.id, ok);
    review(`c:${T.id}:${(q.answer || q.opts?.[q.ans] || "").slice(0, 40)}`, ok, { kind: "comp" });
    streak = ok ? streak + 1 : 0;
    fb.className = "feedback " + (ok ? "good" : "bad");
    fb.textContent = ok ? (streak >= 3 ? `✓ Correct · ${streak} in a row` : "✓ Correct") : q.kind === "self" ? "Not the same as the model: compare and mark yourself below." : "✗ Not quite: see the answer above.";
    check.style.display = "none"; nextBtn.style.display = "inline-flex"; nextBtn.focus({ preventScroll: true });
    drawTypes();
  };
  const box = renderQuestion(q, 0, v => { has = v; if (!q.kind && v) finish(); });
  const check = h("button", { class: "btn", type: "button", style: q.kind ? "" : "display:none", onclick: finish }, "Check");
  if (q.input) q.input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); finish(); } });
  const slow = (q.clip || q.play) ? h("button", { class: "small ghost", type: "button", onclick: () => q.clip ? playClip(q.clip, .75) : playQ(q) }, "🐢 Slower") : null;
  card.replaceChildren(
    h("p", { class: "eyebrow" }, T.title),
    h("p", { class: "note" }, "💡 " + TIPS[T.id]),
    box,
    h("div", { class: "row", style: "margin-top:12px" }, check, nextBtn, slow),
    fb);
  if (q.clip || q.play) setTimeout(() => playQ(q), 300);
  else q.input?.focus({ preventScroll: true });
}

// book exercise lists: tap an item to hear the real recording of it
function drawBook(l) {
  const B = (window.BOOKEX || {})[l], C = ((window.CLIPS || {}).ex || {})[l] || [];
  const lines = ((window.CLIPS || {}).lines || []).filter(x => x[6] === l);
  if (!B) { $("comp-book").replaceChildren(); return; }
  const NAMES = { initial: "辨别声母 · Distinguish the initials", final: "辨别韵母 · Distinguish the finals", mixed: "辨音辨调 · Sounds and tones", word: "辨音辨调 · Words" };
  $("comp-book").replaceChildren(
    h("p", { class: "muted" }, `Book p.${B.page}, recording ${B.track}. Tap an item to hear it. Grey items have no clip yet: use the full track on the Listening page.`),
    ...B.rows.map((g, gi) => h("div", { class: "bk-group" }, h("h4", {}, NAMES[g.kind] || g.kind),
      ...g.r.map((row, ri) => h("div", { class: "bk-row" }, ...row.split("|").map(s => s.trim()).map((py, ii) => {
        const t = C[gi] && C[gi][ri] && C[gi][ri][ii];
        return h("button", { type: "button", class: "bk-item" + (t ? "" : " off"), disabled: !t || null, html: colorPinyin(py), onclick: () => playClip({ f: B.track, s: t[0], e: t[1] }) });
      }))))),
    lines.length ? h("div", { class: "bk-group" }, h("h4", {}, "课文 · Text sentences (real recording)"),
      ...lines.map(([f, s, e, hz, py]) => h("button", { type: "button", class: "bk-line", onclick: () => playClip({ f, s, e }) }, h("span", { class: "zh" }, hz), h("small", { class: "muted" }, py)))) : null
  );
}

export function initComp() {
  drawTypes();
  const sel = read("hzl-comp-book", 1);
  const draw = l => { write("hzl-comp-book", l); $("comp-book-ls").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", +c.dataset.l === l)); drawBook(l); };
  $("comp-book-ls").replaceChildren(...[1, 2, 3, 4, 5].map(l => h("button", { type: "button", class: "chip", "data-l": l, onclick: () => draw(l) }, `L${l}`)));
  draw(sel);
}
export function enterComp(arg) {
  drawTypes();
  if (arg && (arg === "mix" || COMP_TYPES.some(t => t.id === arg))) start(arg);
  else if (!current) $("comp-practice").replaceChildren(h("p", { class: "muted center" }, "Pick a question type above to start. Start with your weakest one."));
}

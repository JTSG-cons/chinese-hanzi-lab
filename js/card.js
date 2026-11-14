// Character card dialog + Hanzi Writer helpers.
import { $, h, BY_CHAR, HANZI, LESSONS, CHARS, speak, colorPinyin, toneOf, charLevel, review, reduced } from "./core.js";
import { toneScene } from "./scenes.js";

export const loadChar = (c, done, fail) => fetch(`vendor/hanzi-data/${encodeURIComponent(c)}.json`)
  .then(r => { if (!r.ok) throw 0; return r.json(); }).then(done).catch(() => fail?.());

const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
const seal = () => getComputedStyle(document.documentElement).getPropertyValue("--seal").trim();

export function makeWriter(el, c, opts = {}) {
  if (!window.HanziWriter) { el.textContent = c; return null; }
  return HanziWriter.create(el, c, {
    width: opts.size || 240, height: opts.size || 240, padding: 12,
    strokeColor: ink(), radicalColor: seal(), outlineColor: "rgba(128,120,100,.25)",
    highlightColor: seal(), drawingColor: ink(), drawingWidth: 22,
    strokeAnimationSpeed: 1.1, delayBetweenStrokes: 220, showOutline: true,
    showCharacter: opts.showCharacter ?? true,
    charDataLoader: (ch, done) => loadChar(ch, done, () => { el.textContent = ch; }),
    ...opts.extra
  });
}

let toneCanvas = null, toneCtl = null;
const dlg = () => $("card");

export function openCard(c) {
  const r = BY_CHAR[c]; if (!r) return;
  const [parts, story, emoji] = HANZI[c] || ["", "", ""];
  const t = toneOf(r.py);
  const body = $("card-body");
  const writerEl = h("div", { class: "writer", "aria-label": `stroke order of ${c}` });
  if (!toneCanvas) toneCanvas = h("canvas", { class: "tone-mini" });
  const lv = charLevel(c);
  const status = ["Struggling: keep drilling", "Learning", "Solid ✓"][lv] || "New";
  const words = CHARS.length && LESSONS.flatMap(L => L.words.filter(w => w[0].includes(c)).map(w => ({ w, n: L.n })));
  const feedback = h("p", { class: "feedback" });
  let writer = null;

  body.replaceChildren(
    h("div", { class: "card-top" },
      h("div", {}, writerEl,
        h("div", { class: "row", style: "justify-content:center;margin-top:10px" },
          h("button", { class: "small", type: "button", onclick: () => writer?.animateCharacter() }, "▶ Strokes"),
          h("button", { class: "small ghost", type: "button", onclick: () => {
            if (!writer) return; feedback.textContent = "Write it stroke by stroke. Hints appear after 3 misses.";
            feedback.className = "feedback";
            writer.quiz({ showHintAfterMisses: 3, onComplete: s => {
              const ok = s.totalMistakes <= 2;
              review(`w:${c}`, ok, { kind: "write", c });
              feedback.textContent = ok ? `Great: ${s.totalMistakes} mistakes.` : `${s.totalMistakes} mistakes. It will come back soon.`;
              feedback.className = "feedback " + (ok ? "good" : "bad");
            } });
          } }, "✍ Write it")),
        feedback),
      h("div", {},
        h("div", { class: "row", style: "justify-content:space-between" },
          h("span", { class: "src-tag" }, `Lesson ${r.lesson} · ${LESSONS[r.lesson - 1].zh}${r.core ? "" : " · extra"}`),
          h("span", { class: "src-tag" }, status)),
        h("div", { class: "row", style: "gap:14px;margin:8px 0" },
          h("span", { class: "emoji", "aria-hidden": "true" }, emoji || ""),
          h("div", {},
            h("div", { class: "big-py", html: colorPinyin(r.py) }),
            h("div", { class: "muted" }, t ? `Tone ${t}` : "Neutral tone"))),
        h("button", { class: "small ghost", type: "button", onclick: () => { speak(c); toneCtl?.play(t); } }, "🔊 Hear it"),
        h("div", { class: "parts", style: "margin-top:10px" }, "Parts: ", parts),
        h("div", { class: "story" }, story),
        toneCanvas)),
    h("h3", { style: "margin-top:16px" }, "Words with ", h("span", { class: "zh" }, c)),
    h("ul", { class: "words-list" }, ...words.map(({ w, n }) => h("li", {},
      h("span", { class: "zh" }, w[0]), h("span", { html: colorPinyin(w[1]) }), h("span", { class: "muted" }, w[3]),
      h("span", { class: "src-tag" }, `L${n}`), h("button", { class: "small ghost", type: "button", onclick: () => speak(w[0].replace(/[（）()…]/g, "")) }, "🔊"))))
  );
  if (!dlg().open) dlg().showModal();
  writer = makeWriter(writerEl, c);
  if (writer && !reduced()) setTimeout(() => writer.animateCharacter(), 300);
  requestAnimationFrame(() => {
    if (!toneCtl) toneCtl = toneScene(toneCanvas, { tones: [t], spin: false });
    else toneCtl.set([t]);
    setTimeout(() => toneCtl.play(t), 400);
  });
}

export function initCard() {
  $("card-close").addEventListener("click", () => dlg().close());
  dlg().addEventListener("click", e => { if (e.target === dlg()) dlg().close(); });
}

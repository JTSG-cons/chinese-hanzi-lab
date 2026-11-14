// Timed mock exams. A fresh paper is generated every time.
import { $, h, LESSONS, CHARS, HANZI, OVERVIEW, shuffle, pick, esc, colorPinyin, plain, toneOf, withTone, speak, review, read, write } from "./core.js";
import { charMeaning, sentences, tokenize } from "./drills.js";
import { listenChars, split } from "./pages.js";

const MOCKS = {
  comp: { name: "Comprehensive Chinese L1-5", min: 40, ls: [1, 2, 3, 4, 5], desc: "Pinyin, tones, meanings, choosing the character, 不 tone change, filling in words, sentence meaning." },
  ov: { name: "China Overview", min: 30, desc: "Geography, agriculture, Confucianism, population, dialects + history slides." },
  read: { name: "Chinese Reading L1-8", min: 45, ls: [1, 2, 3, 4, 5, 6, 7, 8], desc: "Word meanings, cloze, sentence meaning, choosing the right reply." },
  listen: { name: "Chinese Listening L1-5", min: 35, ls: [1, 2, 3, 4, 5], desc: "Tones, same/different, initials, finals, sentences. Headphones on." }
};
const coreChars = ls => CHARS.filter(r => ls.includes(r.lesson) && r.core && HANZI[r.c]);
const words = ls => ls.flatMap(n => LESSONS[n - 1].words.filter(w => !w[4]).map(w => ({ w, n })));
const lines = ls => ls.flatMap(n => [...LESSONS[n - 1].practice, ...((window.BOOK_TEXTS && window.BOOK_TEXTS[n]) || [])].map(l => ({ l, n }))).filter(x => x.l[2]);
const mc = (q, right, wrongs, why, extra = {}) => { const opts = shuffle([right, ...wrongs]); return { q, opts, ans: opts.indexOf(right), why, ...extra }; };

function section(title, qs) { return { title, qs }; }

function buildComp() {
  const ls = MOCKS.comp.ls, cs = coreChars(ls), W = words(ls);
  const S = [];
  S.push(section("A. Choose the correct pinyin", pick(cs, 8).map(r => {
    const t = toneOf(r.py), base = plain(r.py);
    const w = [1, 2, 3, 4].filter(k => k !== t).map(k => withTone(base, k)).slice(0, 2).concat(pick(cs.filter(x => plain(x.py) !== base), 1).map(x => x.py));
    return mc(`<span class="zh">${r.c}</span>`, r.py, w, `${r.c} = ${r.py}: ${esc(charMeaning(r))}`, { html: true });
  })));
  S.push(section("B. Choose the character", pick(cs, 8).map(r => mc(`${esc(charMeaning(r))} · ${r.py}`, r.c, pick(cs.filter(x => x.c !== r.c), 3).map(x => x.c), `${r.c}: ${HANZI[r.c][1]}`, { zhOpts: true }))));
  S.push(section("C. What does it mean?", pick(W.filter(x => x.w[0].length > 1), 8).map(({ w }) => mc(`<span class="zh">${esc(w[0])}</span>`, w[3], pick(W.filter(x => x.w[3] !== w[3]), 3).map(x => x.w[3]), `${esc(w[0])} ${w[1]}`))));
  const buQs = [["不去", "bú qù", "bù qù"], ["不忙", "bù máng", "bú máng"], ["不太难", "bú tài nán", "bù tài nán"], ["不对", "bú duì", "bù duì"], ["不好", "bù hǎo", "bú hǎo"], ["不大", "bú dà", "bù dà"], ["不难", "bù nán", "bú nán"], ["不客气", "bú kèqi", "bù kèqi"]];
  S.push(section("D. Tone change: 不 and 3rd tones", [
    ...pick(buQs, 3).map(([zh, r, w]) => mc(`How is <span class="zh">${zh}</span> said?`, r, [w], "不 becomes bú only before a 4th tone.")),
    mc(`How is <span class="zh">你好</span> actually said?`, "ní hǎo", ["nǐ hǎo (both full 3rd)", "nì hǎo", "nī hǎo"], "3rd + 3rd → 2nd + 3rd."),
    mc(`How is <span class="zh">很好</span> actually said?`, "hén hǎo", ["hěn hǎo (both full 3rd)", "hèn hǎo", "hēn hǎo"], "3rd + 3rd → 2nd + 3rd.")
  ]));
  S.push(section("E. Fill in the blank", cloze(ls, 6)));
  S.push(section("F. Questions and answers", replies(ls, 5)));
  return S;
}
function cloze(ls, n) {
  const ss = sentences(ls);
  const vocab = words(ls).map(x => x.w[0].replace(/[（）()…]/g, "")).filter(v => v.length);
  const out = [];
  for (const s of shuffle(ss)) {
    const cand = s.toks.filter(t => vocab.includes(t));
    if (!cand.length) continue;
    const ans = cand[Math.random() * cand.length | 0];
    const blanked = s.toks.map(t => t === ans ? "____" : t).join("");
    out.push(mc(`<span class="zh">${esc(blanked)}</span><br><span class="muted">${esc(s.en)}</span>`, ans, pick(vocab.filter(v => v !== ans && v.length === ans.length), 3), `${esc(s.hz)} · ${esc(s.py)}`, { zhOpts: true }));
    if (out.length >= n) break;
  }
  return out;
}
function replies(ls, n) {
  const pairs = [];
  for (const k of ls) {
    for (const d of [LESSONS[k - 1].practice, (window.BOOK_TEXTS && window.BOOK_TEXTS[k]) || []]) {
      for (let i = 0; i < d.length - 1; i++) if (d[i][2] && d[i + 1][2] && /[？?]/.test(d[i][1]) && d[i][0] !== d[i + 1][0]) pairs.push([d[i], d[i + 1]]);
    }
  }
  const all = lines(ls).map(x => x.l[1]);
  return pick(pairs, n).map(([a, b]) => mc(`A: <span class="zh">${esc(a[1])}</span><br>B: ?`, b[1], pick(all.filter(x => x !== b[1] && x !== a[1]), 3), `${esc(a[3])} → ${esc(b[3])}`, { zhOpts: true }));
}
function buildOv() {
  const Q = pick(OVERVIEW.quiz, 25).map(([q, r, w]) => mc(esc(q), r, w, ""));
  const K = pick(OVERVIEW.keywords, 5).map(([zh, py, en]) => mc(`<span class="zh">${zh}</span> (${py}) means…`, en, pick(OVERVIEW.keywords.filter(k => k[0] !== zh), 3).map(k => k[2]), ""));
  return [section("A. Questions", Q), section("B. Key words", K)];
}
function buildRead() {
  const ls = MOCKS.read.ls, W = words(ls);
  const sents = shuffle(sentences(ls));
  return [
    section("A. Word meaning", pick(W.filter(x => x.w[0].length > 1 || x.n > 5), 10).map(({ w, n }) => mc(`<span class="zh">${esc(w[0])}</span>`, w[3], pick(W.filter(x => x.w[3] !== w[3]), 3).map(x => x.w[3]), `L${n}: ${esc(w[0])} ${w[1]}`))),
    section("B. Fill in the blank", cloze(ls, 8)),
    section("C. Sentence meaning", sents.slice(0, 8).map(s => mc(`<span class="zh">${esc(s.hz)}</span>`, s.en, pick(sents.filter(x => x.en !== s.en), 3).map(x => x.en), esc(s.py)))),
    section("D. Choose the right reply", replies(ls, 6))
  ];
}
function buildListen() {
  const ls = MOCKS.listen.ls, pool = listenChars(ls);
  const toneQ = pick(pool, 10).map(r => { const t = toneOf(r.py); return mc(`🔊 Which tone? <span class="muted">(${plain(r.py)})</span>`, `tone ${t}`, [1, 2, 3, 4].filter(k => k !== t).map(k => `tone ${k}`), `${r.c} ${r.py}`, { play: r.c }); });
  const sameQ = pick(pool, 8).map(r => { const t = toneOf(r.py), same = Math.random() < .5; const shown = same ? r.py : withTone(plain(r.py), [1, 2, 3, 4].filter(k => k !== t)[Math.random() * 3 | 0]); return mc(`🔊 Is it <b>${shown}</b>?`, same ? "same" : "different", [same ? "different" : "same"], `${r.c} ${r.py}`, { play: r.c }); });
  const iniQ = pick(pool.filter(r => split(r.py).ini), 6).map(r => { const { ini } = split(r.py); return mc("🔊 Which initial?", ini, shuffle([...new Set(pool.map(x => split(x.py).ini).filter(x => x && x !== ini))]).slice(0, 3), `${r.c} ${r.py}`, { play: r.c }); });
  const finQ = pick(pool, 6).map(r => { const { fin } = split(r.py); return mc("🔊 Which final?", fin, shuffle([...new Set(pool.map(x => split(x.py).fin).filter(x => x && x !== fin))]).slice(0, 3), `${r.c} ${r.py}`, { play: r.c }); });
  const L = lines(ls);
  const senQ = pick(L, 6).map(({ l }) => mc("🔊 Which sentence did you hear?", l[1], pick(L.filter(x => x.l[1] !== l[1]), 3).map(x => x.l[1]), `${esc(l[2])} · ${esc(l[3])}`, { play: l[1], zhOpts: true }));
  return [section("A. Mark the tone", toneQ), section("B. Same or different", sameQ), section("C. Initials", iniQ), section("D. Finals", finQ), section("E. Sentences", senQ)];
}
const BUILD = { comp: buildComp, ov: buildOv, read: buildRead, listen: buildListen };

let timer = null;
function run(id) {
  const M = MOCKS[id], S = BUILD[id]();
  const total = S.reduce((a, s) => a + s.qs.length, 0);
  const end = Date.now() + M.min * 6e4;
  const clock = h("b", {}, `${M.min}:00`);
  const answered = new Map();
  const form = h("div");
  let qn = 0;
  S.forEach(sec => {
    form.append(h("h3", { style: "margin-top:20px" }, sec.title));
    sec.qs.forEach(q => {
      const i = qn++;
      const box = h("div", { class: "mq", "data-i": i }, h("div", { class: "q", html: `${i + 1}. ${q.q}` }));
      if (q.play) box.append(h("button", { class: "small", type: "button", onclick: () => speak(q.play, .7) }, "🔊 Play"));
      q.opts.forEach((o, k) => {
        const lab = h("label", {}, h("input", { type: "radio", name: `q${i}`, value: k }), h("span", { class: q.zhOpts ? "zh" : "", style: q.zhOpts ? "font-size:1.3rem" : "", html: /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(o) && o.length < 16 ? colorPinyin(o) : esc(o) }));
        lab.querySelector("input").onchange = () => answered.set(i, k);
        box.append(lab);
      });
      box.append(h("div", { class: "why", html: q.why || "" }));
      q.box = box; form.append(box);
    });
  });
  const submit = h("button", { class: "btn", type: "button", style: "margin:20px 0", onclick: () => grade() }, "Submit and mark");
  const result = h("div");
  $("mock-run").replaceChildren(h("div", { class: "timer" }, h("span", {}, M.name), clock, h("span", { class: "muted", id: "mock-count" }, `0/${total}`)), form, submit, result);
  $("mock-run").scrollIntoView({ behavior: "smooth" });
  form.addEventListener("change", () => { $("mock-count").textContent = `${answered.size}/${total}`; });
  clearInterval(timer);
  timer = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    clock.textContent = `${Math.floor(left / 6e4)}:${String(Math.floor(left % 6e4 / 1000)).padStart(2, "0")}`;
    if (!left) grade();
  }, 1000);
  let graded = false;
  function grade() {
    if (graded) return; graded = true; clearInterval(timer);
    let score = 0, i = 0;
    S.forEach(sec => sec.qs.forEach(q => {
      const pickd = answered.get(i), ok = pickd === q.ans;
      if (ok) score++;
      q.box.classList.add(ok ? "ok" : "no");
      const labs = q.box.querySelectorAll("label");
      labs[q.ans]?.classList.add("correct"); if (pickd != null && !ok) labs[pickd]?.classList.add("picked");
      q.box.querySelectorAll("input").forEach(x => x.disabled = true);
      i++;
    }));
    const pct = Math.round(score / total * 100);
    const hist = read("hzl-mocks", []); hist.push({ id, pct, t: Date.now() }); write("hzl-mocks", hist);
    result.replaceChildren(h("div", { class: "panel" }, h("div", { class: "score" }, `${score}/${total} · ${pct}%`),
      h("p", {}, pct >= 85 ? "Exam-ready. Keep the daily reviews going." : pct >= 65 ? "Close. Read every red answer below, then drill those lessons." : "Not yet. Go back to the plan blocks for the weak sections, then try a fresh mock."),
      h("button", { class: "btn ghost", type: "button", onclick: () => run(id) }, "New paper")));
    submit.remove();
    result.scrollIntoView({ behavior: "smooth" });
  }
}

export function initMock() {
  const hist = () => read("hzl-mocks", []);
  const draw = () => $("mock-pick").replaceChildren(...Object.entries(MOCKS).map(([id, M]) => {
    const last = hist().filter(x => x.id === id).slice(-1)[0];
    return h("div", { class: "panel" }, h("h3", {}, M.name), h("p", { class: "muted" }, M.desc), h("p", {}, `⏱ ${M.min} min${last ? ` · last: ${last.pct}%` : ""}`), h("a", { class: "btn", href: `#mock/${id}` }, "Start"));
  }));
  draw();
  addEventListener("hashchange", draw);
}
export function enterMock(arg) { if (arg && MOCKS[arg]) run(arg); }

// Timed mock exams. A fresh paper is generated every time.
import { $, h, LESSONS, CHARS, HANZI, OVERVIEW, PY, shuffle, pick, esc, colorPinyin, plain, toneOf, withTone, speak, read, write } from "./core.js";
import { sentences } from "./drills.js";
import { listenChars, split } from "./pages.js";

const MOCKS = {
  comp: { name: "Comprehensive Chinese L1-5", min: 60, ls: [1, 2, 3, 4, 5], desc: "The 10 mid-term question types, in order: initials, finals, word / word-in-sentence / sentence you hear, missing pinyin parts, pinyin for characters, characters for pinyin, answering in characters, word order. Headphones on." },
  ov: { name: "China Overview", min: 30, desc: "Geography, agriculture, Confucianism, population, dialects + history slides." },
  read: { name: "Chinese Reading L1-8", min: 45, ls: [1, 2, 3, 4, 5, 6, 7, 8], desc: "Word meanings, cloze, sentence meaning, choosing the right reply." },
  listen: { name: "Chinese Listening L1-5", min: 35, ls: [1, 2, 3, 4, 5], desc: "Tones, same/different, initials, finals, sentences. Headphones on." }
};
const words = ls => ls.flatMap(n => LESSONS[n - 1].words.filter(w => !w[4]).map(w => ({ w, n })));
const lines = ls => { const seen = new Set(); return ls.flatMap(n => [...LESSONS[n - 1].practice, ...((window.BOOK_TEXTS && window.BOOK_TEXTS[n]) || [])].map(l => ({ l, n }))).filter(x => x.l[2] && !seen.has(x.l[1]) && seen.add(x.l[1])); };
const mc = (q, right, wrongs, why, extra = {}) => { const opts = shuffle([right, ...wrongs]); return { q, opts, ans: opts.indexOf(right), why, ...extra }; };
function section(title, qs, note = "") { return { title, qs, note }; }

// ---------- pinyin parsing (accepts tone marks or numbers: lǎoshī = lao3shi1, ü = v) ----------
const MARK = { "\u0304": 1, "\u0301": 2, "\u030c": 3, "\u0300": 4 };
function parsePy(str) {
  const s = String(str).toLowerCase().replace(/u:/g, "ü").replace(/v/g, "ü").normalize("NFD");
  const L = [], T = {}, D = {};
  for (const ch of s) {
    if (ch === "\u0308") { if (L[L.length - 1] === "u") L[L.length - 1] = "ü"; }
    else if (MARK[ch]) T[L.length - 1] = MARK[ch];
    else if (/[0-5]/.test(ch)) { if (L.length) D[L.length - 1] = +ch % 5; }
    else if (/[a-z]/.test(ch)) L.push(ch);
  }
  for (let i = 1; i < L.length; i++) if (L[i] === "ü" && "jqxy".includes(L[i - 1])) L[i] = "u"; // jü = ju
  return { L, T, D };
}
// does the typed answer match these syllables (letters and tones)?
function matchPy(input, syls) {
  const u = parsePy(input); let pos = 0;
  for (const e of syls) {
    const E = parsePy(e), n = E.L.length, tone = Object.values(E.T)[0] || 0;
    if (u.L.slice(pos, pos + n).join("") !== E.L.join("")) return false;
    let t = 0; for (let k = pos; k < pos + n; k++) if (u.T[k]) t = u.T[k];
    if (u.D[pos + n - 1] != null) t = u.D[pos + n - 1];
    if (t !== tone) return false;
    pos += n;
  }
  return pos === u.L.length;
}
const hanOnly = s => [...s].filter(c => /[\u4e00-\u9fff]/.test(c));
// split a word's pinyin into one marked syllable per character, guided by each character's own pinyin
function wordSyls(w) {
  const cs = hanOnly(w[0]); if (!cs.length || cs.length !== w[0].length) return null;
  const raw = [...w[1].normalize("NFC").replace(/[\s'’·-]/g, "")];
  const out = []; let pos = 0;
  for (const c of cs) {
    if (!PY[c]) return null;
    const p = [...plain(PY[c]).toLowerCase()], n = p.length;
    const seg = raw.slice(pos, pos + n).join("");
    if (plain(seg).toLowerCase() !== p.join("")) return null;
    out.push(seg.toLowerCase()); pos += n;
  }
  return pos === raw.length ? out : null;
}
const INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "z", "c", "s", "r"];
const iniOf = syl => INITIALS.find(i => plain(syl).startsWith(i)) || "";
const INI_GROUPS = [["b", "p", "m"], ["d", "t", "n", "l"], ["g", "k", "h"], ["j", "q", "x"], ["z", "c", "s"], ["zh", "ch", "sh", "r"], ["z", "zh"], ["c", "ch"], ["s", "sh"], ["f", "h"], ["n", "l"]];
const FIN_GROUPS = [["an", "ang"], ["en", "eng"], ["in", "ing"], ["ian", "iang"], ["uan", "uang"], ["ong", "eng"], ["ai", "ei"], ["ao", "ou"], ["uo", "ou"], ["ie", "üe"], ["u", "ü"], ["i", "ü"], ["iao", "iou"], ["uei", "ei"], ["uen", "un"], ["e", "ei"], ["a", "ai"]];
const near = (groups, x) => [...new Set(groups.filter(g => g.includes(x)).flat())].filter(y => y !== x);
function distract(groups, right, pool, n) {
  const out = shuffle(near(groups, right)).slice(0, n);
  for (const y of shuffle(pool)) { if (out.length >= n) break; if (y && y !== right && !out.includes(y)) out.push(y); }
  return out;
}
// one syllable changed (tone, initial or final): for "choose the word you hear"
function mutate(syls) {
  const s = [...syls], i = Math.random() * s.length | 0, syl = s[i], t = toneOf(syl);
  const p = plain(syl), ini = iniOf(syl), fin = p.slice(ini.length), r = Math.random();
  if (r < .4 || (!ini && r < .7)) { const nt = [1, 2, 3, 4].filter(k => k !== t)[Math.random() * 3 | 0]; s[i] = withTone(p, nt); }
  else if (r < .7) { const alt = near(INI_GROUPS, ini); if (!alt.length) return null; s[i] = withTone(pick(alt, 1)[0] + fin, t); }
  else { const alt = near(FIN_GROUPS, fin).filter(f => !f.startsWith("ü") || "nl".includes(ini)); if (!alt.length) return null; s[i] = withTone(ini + pick(alt, 1)[0], t); }
  return s.join("");
}

// ---------- Comprehensive Chinese mid-term: the 10 question types ----------
function buildComp() {
  const ls = MOCKS.comp.ls;
  const pool = listenChars(ls);
  const W = words(ls).filter(x => x.w[4] !== "p").map(x => ({ ...x, syls: wordSyls(x.w) })).filter(x => x.syls);
  const multi = W.filter(x => x.syls.length >= 2);
  const S = [];

  // 一 initials
  const allIni = [...new Set(pool.map(r => split(r.py).ini).filter(Boolean))];
  S.push(section("一、Underline the initial you hear", pick(pool.filter(r => split(r.py).ini), 6).map(r => {
    const { ini } = split(r.py);
    return mc("🔊 Which initial?", ini, distract(INI_GROUPS, ini, allIni, 2), `${r.c} ${r.py}`, { play: r.c });
  })));
  // 二 finals
  const allFin = [...new Set(pool.map(r => split(r.py).fin).filter(Boolean))];
  S.push(section("二、Underline the final you hear", pick(pool, 6).map(r => {
    const { fin } = split(r.py);
    return mc("🔊 Which final?", fin, distract(FIN_GROUPS, fin, allFin, 2), `${r.c} ${r.py} → final <b>${fin}</b>`, { play: r.c });
  })));
  // 三 word you hear: pinyin options that differ by one tone, initial or final
  S.push(section("三、Choose the word you hear", pick(multi, 6).map(x => {
    const right = x.syls.join(""), wrongs = new Set();
    for (let k = 0; k < 30 && wrongs.size < 3; k++) { const m = mutate(x.syls); if (m && m !== right) wrongs.add(m); }
    return mc("🔊 Which word did you hear?", right, [...wrongs], `${esc(x.w[0])} ${x.w[1]}: ${esc(x.w[3])}`, { play: x.w[0], pyOpts: true });
  })));
  // 四 word you hear in the sentence
  const ss = sentences(ls);
  const vocab = W.map(x => x.w);
  const q4 = [];
  for (const s of shuffle(ss)) {
    const inS = vocab.filter(w => s.toks.includes(w[0]) && w[0].length >= 1 && !"的吗了吧呢".includes(w[0]));
    if (!inS.length) continue;
    const right = pick(inS, 1)[0];
    const others = vocab.filter(w => !s.hz.includes(w[0]) && w[0].length === right[0].length);
    if (others.length < 3) continue;
    const fmt = w => `${w[0]} ${w[1]}`;
    q4.push(mc("🔊 Which word is in the sentence you hear?", fmt(right), pick(others, 3).map(fmt), `${esc(s.hz)} · ${esc(s.py)}`, { play: s.hz, zhOpts: true }));
    if (q4.length >= 5) break;
  }
  S.push(section("四、Choose the word you hear in the sentence", q4));
  // 五 sentence you hear
  const L = lines(ls);
  S.push(section("五、Choose the sentence you hear", pick(L, 5).map(({ l }) => mc("🔊 Which sentence did you hear?", l[1], pick(L.filter(x => x.l[1] !== l[1]), 3).map(x => x.l[1]), `${esc(l[2])} · ${esc(l[3])}`, { play: l[1], zhOpts: true }))));
  // 六 fill in missing pinyin parts: initials, finals, tones
  const q6 = [];
  const withIni = multi.filter(x => x.syls.every(iniOf));
  pick(withIni, 2).forEach(x => {
    const shown = x.syls.map(s => "__" + s.slice(iniOf(s).length)).join(" ");
    const ans = x.syls.map(iniOf);
    q6.push({ kind: "text", q: `🔊 <span class="zh">${esc(x.w[0])}</span> &nbsp; <b>${shown}</b> <span class="muted">(write the initials)</span>`, ph: "e.g. l sh", play: x.w[0], answer: ans.join(" "),
      check: v => { const t = v.toLowerCase().split(/[\s,，/、]+/).filter(Boolean); return t.length === ans.length && t.every((y, i) => y === ans[i]); }, why: `${esc(x.w[0])} ${x.w[1]}` });
  });
  pick(multi, 2).forEach(x => {
    const shown = x.syls.map(s => iniOf(s) + "__").join(" ");
    const fins = x.syls.map(s => s.slice(iniOf(s).length));
    q6.push({ kind: "text", q: `🔊 <span class="zh">${esc(x.w[0])}</span> &nbsp; <b>${shown}</b> <span class="muted">(write the finals with tones)</span>`, ph: "e.g. ao3 i1", play: x.w[0], answer: fins.join(" "),
      check: v => { const t = v.split(/[\s,，/、]+/).filter(Boolean); return t.length === fins.length && t.every((y, i) => matchPy(y, [fins[i]])); }, why: `${esc(x.w[0])} ${x.w[1]}` });
  });
  pick(multi, 2).forEach(x => {
    const tones = x.syls.map(toneOf);
    q6.push({ kind: "text", q: `🔊 <span class="zh">${esc(x.w[0])}</span> &nbsp; <b>${x.syls.map(plain).join(" ")}</b> <span class="muted">(write the tones: 1-4, 0 = neutral)</span>`, ph: "e.g. 3 1", play: x.w[0], answer: tones.join(" "),
      check: v => { const d = (v.match(/[0-5]/g) || []).map(n => +n % 5); return (d.length === tones.length && d.every((y, i) => y === tones[i])) || matchPy(v, x.syls); }, why: `${esc(x.w[0])} ${colorPinyin(x.w[1])}` });
  });
  S.push(section("六、Fill in the missing pinyin parts: initials, finals and tones", q6, "Type finals as ao3 or ǎo, and ü as v."));
  // 七 pinyin for each character
  S.push(section("七、Write the pinyin for each Chinese character", pick(W, 6).map(x => {
    const cit = hanOnly(x.w[0]).map(c => PY[c]);
    return { kind: "text", q: `<span class="zh" style="font-size:1.6rem">${esc(x.w[0])}</span>`, ph: "pinyin, e.g. lao3shi1 or lǎoshī", answer: x.w[1],
      check: v => matchPy(v, x.syls) || matchPy(v, cit), why: `${colorPinyin(x.w[1])}: ${esc(x.w[3])}` };
  }), "Tone marks or tone numbers both count (nǐ hǎo = ni3 hao3)."));
  // 八 Chinese words for each pinyin
  const byPy = {};
  W.forEach(x => { const k = x.syls.join(""); (byPy[k] = byPy[k] || new Set()).add(x.w[0]); });
  S.push(section("八、Write the Chinese words for each pinyin", pick(W, 6).map(x => {
    const ok = byPy[x.syls.join("")];
    return { kind: "text", zh: true, q: `<b style="font-size:1.3rem">${colorPinyin(x.w[1])}</b>`, ph: "汉字", answer: [...ok].join(" / "),
      check: v => ok.has(v.replace(/[\s，。！？,.!?]/g, "")), why: `${esc(x.w[0])}: ${esc(x.w[3])}` };
  }), "Write it on paper first (the real exam is handwritten), then type it to check."));
  // 九 answer the questions in characters (self-marked against a model answer)
  const pairs = [];
  for (const k of ls) for (const d of [LESSONS[k - 1].practice, (window.BOOK_TEXTS && window.BOOK_TEXTS[k]) || []])
    for (let i = 0; i < d.length - 1; i++) if (/[？?]/.test(d[i][1]) && d[i][0] !== d[i + 1][0] && !/[？?]/.test(d[i + 1][1])) pairs.push([d[i], d[i + 1]]);
  const strip = v => v.replace(/[\s，。！？,.!?、：:；;“”]/g, "");
  S.push(section("九、Answer the questions in Chinese characters", pick(pairs, 4).map(([a, b]) => ({
    kind: "self", zh: true, q: `<span class="zh" style="font-size:1.4rem">${esc(a[1])}</span>`, ph: "用汉字回答", answer: b[1],
    check: v => strip(v) === strip(b[1]), why: `${esc(a[2])} (${esc(a[3])})<br>Model: <span class="zh">${esc(b[1])}</span> ${esc(b[2])} (${esc(b[3])})` })), "Any correct answer counts. After marking, compare with the model answer and mark yourself."));
  // 十 word order
  S.push(section("十、Put the words in order to make a sentence", pick(ss.filter(s => s.toks.length >= 3 && s.toks.length <= 7 && new Set(s.toks).size === s.toks.length && !s.toks.every(t => /^[一二三四五六七八九十]+$/.test(t))), 5).map(s => {
    let toks = shuffle(s.toks); for (let k = 0; k < 5 && toks.join("") === s.toks.join(""); k++) toks = shuffle(s.toks);
    return { kind: "order", toks, answer: s.hz.replace(/[，。！？、]/g, ""), check: v => v === s.toks.join(""), q: "Tap the words in order.", why: `${esc(s.hz)} · ${esc(s.py)} (${esc(s.en)})` };
  })));
  return S.filter(x => x.qs.length);
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

// ---------- answer widgets ----------
const isPy = o => /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(o) && o.length < 24;
function optHtml(q, o) {
  if (q.zhOpts) { const m = o.match(/^(\S+) (.+)$/); return m && isPy(m[2]) ? `${esc(m[1])} <small class="muted" style="font-family:var(--sans);font-size:.85rem">${colorPinyin(m[2])}</small>` : esc(o); }
  return isPy(o) ? colorPinyin(o) : esc(o);
}
function orderWidget(q, onChange) {
  const line = h("div", { class: "order-line" }), pool = h("div", { class: "order-pool" });
  const val = () => [...line.children].map(b => b.textContent).join("");
  q.toks.forEach(t => {
    const b = h("button", { type: "button", class: "small" }, t);
    b.onclick = () => { if (b.disabled) return; (b.parentNode === pool ? line : pool).append(b); onChange(line.children.length > 0); };
    pool.append(b);
  });
  q.get = val; q.lock = () => [...line.children, ...pool.children].forEach(b => b.disabled = true);
  return [line, pool];
}

let timer = null;
function run(id) {
  const M = MOCKS[id], S = BUILD[id]();
  const total = S.reduce((a, s) => a + s.qs.length, 0);
  const end = Date.now() + M.min * 6e4;
  const clock = h("b", {}, `${M.min}:00`);
  const answered = new Set();
  const count = () => { $("mock-count").textContent = `${answered.size}/${total}`; };
  const form = h("div");
  let qn = 0;
  S.forEach(sec => {
    form.append(h("h3", { style: "margin-top:22px" }, sec.title));
    if (sec.note) form.append(h("p", { class: "note" }, sec.note));
    sec.qs.forEach(q => {
      const i = qn++;
      const box = h("div", { class: "mq", "data-i": i }, h("div", { class: "q", html: `${i + 1}. ${q.q}` }));
      if (q.play) box.append(h("button", { class: "small", type: "button", onclick: () => speak(q.play, .7) }, "🔊 Play"));
      if (!q.kind) {
        q.opts.forEach((o, k) => {
          const lab = h("label", {}, h("input", { type: "radio", name: `q${i}`, value: k }), h("span", { class: q.zhOpts ? "zh" : "", style: q.zhOpts ? "font-size:1.3rem" : q.pyOpts ? "font-size:1.15rem" : "", html: optHtml(q, o) }));
          lab.querySelector("input").onchange = () => { q.picked = k; answered.add(i); count(); };
          box.append(lab);
        });
      } else if (q.kind === "order") {
        box.append(...orderWidget(q, has => { has ? answered.add(i) : answered.delete(i); count(); }));
      } else {
        const inp = h("input", { type: "text", placeholder: q.ph || "", autocomplete: "off", autocapitalize: "off", spellcheck: "false", class: q.zh ? "zh" : "", lang: q.zh ? "zh-CN" : "en" });
        inp.oninput = () => { inp.value.trim() ? answered.add(i) : answered.delete(i); count(); };
        q.get = () => inp.value.trim(); q.lock = () => inp.disabled = true;
        box.append(h("div", {}, inp));
      }
      box.append(h("div", { class: "why", html: (q.kind ? `<b>Answer:</b> <span class="zh">${esc(q.answer)}</span><br>` : "") + (q.why || "") }));
      q.box = box; form.append(box);
    });
  });
  const submit = h("button", { class: "btn", type: "button", style: "margin:20px 0", onclick: () => grade() }, "Submit and mark");
  const result = h("div");
  $("mock-run").replaceChildren(h("div", { class: "timer" }, h("span", {}, M.name), clock, h("span", { class: "muted", id: "mock-count" }, `0/${total}`)), form, submit, result);
  $("mock-run").scrollIntoView({ behavior: "smooth" });
  clearInterval(timer);
  timer = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    clock.textContent = `${Math.floor(left / 6e4)}:${String(Math.floor(left % 6e4 / 1000)).padStart(2, "0")}`;
    if (!left) grade();
  }, 1000);
  let graded = false, histIdx = -1;
  const all = S.flatMap(s => s.qs);
  function showScore() {
    const score = all.filter(q => q.ok).length, pct = Math.round(score / total * 100);
    const hist = read("hzl-mocks", []);
    if (histIdx < 0) { hist.push({ id, pct, t: Date.now() }); histIdx = hist.length - 1; } else if (hist[histIdx]) hist[histIdx].pct = pct;
    write("hzl-mocks", hist);
    const weak = S.map(s => [s.title, s.qs.filter(q => !q.ok).length, s.qs.length]).filter(x => x[1]);
    result.replaceChildren(h("div", { class: "panel" }, h("div", { class: "score" }, `${score}/${total} · ${pct}%`),
      h("p", {}, pct >= 85 ? "Exam-ready. Keep the daily reviews going." : pct >= 65 ? "Close. Read every red answer above, then drill the weak sections." : "Not yet. Go back to the plan blocks for the weak sections, then try a fresh mock."),
      weak.length ? h("ul", {}, ...weak.map(([t, bad, n]) => h("li", {}, `${t}: ${bad}/${n} wrong`))) : "",
      h("button", { class: "btn ghost", type: "button", onclick: () => run(id) }, "New paper")));
  }
  function grade() {
    if (graded) return; graded = true; clearInterval(timer);
    all.forEach(q => {
      if (!q.kind) {
        q.ok = q.picked === q.ans;
        const labs = q.box.querySelectorAll("label");
        labs[q.ans]?.classList.add("correct"); if (q.picked != null && !q.ok) labs[q.picked]?.classList.add("picked");
        q.box.querySelectorAll("input").forEach(x => x.disabled = true);
      } else {
        const v = q.get(); q.ok = !!v && q.check(v); q.lock();
        if (q.kind === "self" && !q.ok && v) {
          const mark = ok => { q.ok = ok; q.box.classList.toggle("ok", ok); q.box.classList.toggle("no", !ok); showScore(); };
          q.box.append(h("div", { class: "row", style: "margin-top:6px" }, h("span", { class: "muted" }, "Compare with the model. Was yours correct?"),
            h("button", { class: "small", type: "button", onclick: () => mark(true) }, "✓ Yes"), h("button", { class: "small ghost", type: "button", onclick: () => mark(false) }, "✗ No")));
        }
      }
      q.box.classList.add(q.ok ? "ok" : "no");
    });
    submit.remove();
    showScore();
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
export const _test = { parsePy, matchPy, wordSyls, mutate, buildComp };

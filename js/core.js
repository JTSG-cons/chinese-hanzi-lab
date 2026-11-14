// Shared data, storage, speech and FSRS helpers.

// Dictionary (citation) pinyin for each character. Inside words some become neutral tone (爸爸 bàba).
const PY_RAW = "你nǐ 好hǎo 一yī 五wǔ 八bā 大dà 不bù 口kǒu 白bái 女nǚ 马mǎ 忙máng 吗ma 很hěn 汉hàn 语yǔ 难nán 太tài 爸bà 妈mā 他tā 她tā 男nán 哥gē 弟dì 妹mèi 学xué 英yīng 阿ā 拉lā 伯bó 德dé 俄é 法fǎ 韩hán 国guó 日rì 西xī 班bān 牙yá 去qù 对duì 邮yóu 局jú 寄jì 信xìn 银yín 行háng 取qǔ 钱qián 明míng 天tiān 见jiàn 六liù 七qī 九jiǔ 北běi 京jīng 今jīn 昨zuó 星xīng 期qī 二èr 三sān 四sì 几jǐ 哪nǎ 儿ér 那nà 我wǒ 回huí 校xiào 再zài 起qǐ 没méi 关guān 系xì 安ān 门mén 这zhè 是shì 老lǎo 师shī 您nín 请qǐng 进jìn 坐zuò 喝hē 茶chá 谢xiè 客kè 气qì 工gōng 作zuò 身shēn 体tǐ 十shí 王wáng 问wèn 贵guì 姓xìng 叫jiào 名míng 字zì 人rén 认rèn 识shí 高gāo 兴xìng 也yě 习xí 什shén 么me 发fā 音yīn 书shū 谁shéi 的de 杂zá 志zhì 文wén 中zhōng 朋péng 友yǒu 麦mài 克kè 张zhāng 东dōng 美měi 本běn 午wǔ 吃chī 饭fàn 食shí 堂táng 馒mán 头tóu 要yào 个gè 米mǐ 碗wǎn 鸡jī 蛋dàn 汤tāng 啤pí 酒jiǔ 些xiē 饺jiǎo 子zǐ 包bāo 面miàn 条tiáo 玛mǎ 丽lì 买mǎi 水shuǐ 果guǒ 苹píng 斤jīn 公gōng 多duō 少shǎo 块kuài 元yuán 角jiǎo 毛máo 分fēn 了le 便pián 宜yí 点diǎn 来lái 吧ba 还hái 别bié 橘jú 怎zěn 卖mài 两liǎng 共gòng 给gěi 找zhǎo";
export const PY = Object.fromEntries(PY_RAW.split(" ").map(s => [s[0], s.slice(1)]));

export const LESSONS = window.LESSONS;
export const HANZI = window.HANZI;
export const OVERVIEW = window.OVERVIEW;

const TONE_MARKS = { 1: "āēīōūǖĀĒĪŌŪ", 2: "áéíóúǘÁÉÍÓÚ", 3: "ǎěǐǒǔǚǍĚǏǑǓ", 4: "àèìòùǜÀÈÌÒÙ" };
export function toneOf(syl) {
  for (const t of [1, 2, 3, 4]) if ([...syl].some(ch => TONE_MARKS[t].includes(ch))) return t;
  return 0;
}
// Strip tone marks: "hǎo" → "hao"
export function plain(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ü/g, "ü").normalize("NFC");
}
const BASE = { a: "āáǎà", e: "ēéěè", i: "īíǐì", o: "ōóǒò", u: "ūúǔù", "ü": "ǖǘǚǜ" };
// Put tone t on a plain syllable following the standard placement rule.
export function withTone(p, t) {
  if (!t) return p;
  const s = p;
  let idx = s.indexOf("a"); if (idx < 0) idx = s.indexOf("e");
  if (idx < 0 && s.includes("ou")) idx = s.indexOf("o");
  if (idx < 0) { for (let k = s.length - 1; k >= 0; k--) if ("iouü".includes(s[k])) { idx = k; break; } }
  if (idx < 0) return s;
  return s.slice(0, idx) + BASE[s[idx]][t - 1] + s.slice(idx + 1);
}
export const toneClass = t => "t" + t;
export function colorPinyin(py) {
  return py.split(/(\s+|·|'|…+)/).map(part => {
    if (!part.trim()) return part;
    return `<span class="${toneClass(toneOf(part))}">${part}</span>`;
  }).join("");
}

// ---------- character index ----------
export const CHARS = [];       // {c, py, lesson, words:[word arrays], core:bool}
export const BY_CHAR = {};
for (const L of LESSONS) {
  for (const w of L.words) {
    const [hz, , , , flag = ""] = w;
    for (const c of hz) {
      if (!/[一-鿿]/.test(c)) continue;
      let rec = BY_CHAR[c];
      if (!rec) { rec = BY_CHAR[c] = { c, py: PY[c] || "", lesson: L.n, words: [], core: false }; CHARS.push(rec); }
      if (!rec.words.includes(w)) rec.words.push(w);
      if (flag === "") rec.core = true;
    }
  }
}
export const lessonChars = n => CHARS.filter(r => r.lesson === n);
export const lessonWords = (n, withExtra = true) => LESSONS[n - 1].words.filter(w => withExtra || !w[4]);
export const allWords = (lessons, withExtra = false) => lessons.flatMap(n => lessonWords(n, withExtra).map(w => ({ w, n })));

// ---------- storage ----------
export function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
export function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// ---------- speech ----------
let zhVoice = null;
export const speech = { ok: "speechSynthesis" in window, voice: null };
function pickVoice() {
  if (!speech.ok) return;
  const vs = speechSynthesis.getVoices();
  zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || vs.find(v => /Chinese|中文|普通话/i.test(v.name)) || null;
  speech.voice = zhVoice;
  dispatchEvent(new Event("voiceready"));
}
if (speech.ok) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
export function speak(text, rate = 0.8) {
  if (!speech.ok) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN"; if (zhVoice) u.voice = zhVoice; u.rate = rate;
  speechSynthesis.speak(u);
  return true;
}

// ---------- FSRS ----------
const FS = window.FSRS;
const scheduler = FS ? FS.fsrs(FS.generatorParameters({ enable_fuzz: false, enable_short_term: true })) : null;
const FKEY = "hzl-fsrs";
export const fstore = read(FKEY, { cards: {}, log: [] });
export function review(id, ok, meta = {}) {
  const now = new Date();
  let rec = fstore.cards[id];
  if (!rec) rec = fstore.cards[id] = { card: FS ? FS.createEmptyCard(now) : { due: now }, right: 0, wrong: 0, ...meta };
  if (scheduler) rec.card = scheduler.next(rec.card, now, ok ? FS.Rating.Good : FS.Rating.Again).card;
  else rec.card.due = new Date(now.getTime() + (ok ? 864e5 : 6e4));
  ok ? rec.right++ : rec.wrong++;
  rec.last = now.getTime(); rec.lastOk = ok;
  fstore.log.push([now.getTime(), ok ? 1 : 0]);
  if (fstore.log.length > 3000) fstore.log.splice(0, 1000);
  write(FKEY, fstore);
  dispatchEvent(new Event("progress"));
}
export const dueTime = id => { const r = fstore.cards[id]; return r ? new Date(r.card.due).getTime() : 0; };
export const isDue = id => { const r = fstore.cards[id]; return !r || new Date(r.card.due).getTime() <= Date.now(); };
// 0 = struggling, 1 = learning, 2 = solid, -1 = unseen. Uses the char's "meaning" and "write" cards.
export function charLevel(c) {
  const ids = [`m:${c}`, `w:${c}`, `p:${c}`].map(k => fstore.cards[k]).filter(Boolean);
  if (!ids.length) return -1;
  const right = ids.reduce((a, r) => a + r.right, 0), wrong = ids.reduce((a, r) => a + r.wrong, 0);
  if (ids.some(r => r.lastOk === false)) return 0;
  return right >= 3 && right > wrong * 2 ? 2 : 1;
}

// ---------- DOM helpers ----------
export const $ = id => document.getElementById(id);
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(kid));
  return e;
}
export const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a, n) => shuffle(a).slice(0, n);
export const esc = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

// chips helper: renders toggle chips, returns getter
export function chips(container, items, { multi = false, initial = [], onChange, key } = {}) {
  let sel = new Set(key ? read(key, initial) : initial);
  const draw = () => {
    container.replaceChildren(...items.map(([val, label]) => h("button", {
      class: "chip" + (sel.has(val) ? " on" : ""), type: "button",
      onclick: () => {
        if (multi) { sel.has(val) ? sel.delete(val) : sel.add(val); if (!sel.size) sel.add(val); }
        else sel = new Set([val]);
        if (key) write(key, [...sel]);
        draw(); onChange?.([...sel]);
      }
    }, label)));
  };
  draw();
  return () => [...sel];
}

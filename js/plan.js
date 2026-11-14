// Today view: exam countdowns, the hour-by-hour plan, "right now" block, progress.
import { $, h, read, write, CHARS, charLevel, fstore, isDue, LESSONS } from "./core.js";

const YEAR = 2026;
const EXAMS = [
  { id: "comp", name: "Comprehensive Chinese L1-5", day: "11-16", c: "var(--seal)" },
  { id: "ov", name: "China Overview", day: "11-16", c: "var(--gold)" },
  { id: "read", name: "Chinese Reading L1-8", day: "11-18", c: "var(--jade)" },
  { id: "listen", name: "Chinese Listening L1-5", day: "11-19", c: "var(--sky)" }
];
const examTimes = read("hzl-examtimes", { comp: "09:00", ov: "13:00", read: "09:00", listen: "09:00" });
const examDate = e => new Date(`${YEAR}-${e.day}T${examTimes[e.id] || "09:00"}:00`);

// [start "HH:MM", minutes, title, detail, link]
export const PLAN = [
  { date: "11-14", label: "Sat 14 Nov", sub: "Lessons 1-4 + Overview pass 1", blocks: [
    ["14:00", 25, "Lessons 1-2 characters", "Palace rooms 1-2. Open every tile: watch the strokes, read the picture story, then write it 3× on paper without looking.", "#palace/1"],
    ["14:30", 25, "Drill L1-2", "Meaning and Write modes. Say each answer out loud before you tap.", "#drill"],
    ["15:00", 25, "Lesson 3 characters", "Palace room 3 (post office): 学 去 邮局 寄信 银行 取钱…", "#palace/3"],
    ["15:30", 25, "Drill L1-3 mixed", "Mixed lessons on purpose: harder now, better on Monday.", "#drill"],
    ["16:00", 25, "Tones and pinyin L1-3", "Play the textbook 语音 + 练习 recordings for L1-3 (Listening page), repeating aloud. Then the tone and initial/final drills. Know 不 bù → bú before 4th tone.", "#listening"],
    ["16:30", 25, "Overview pass 1: geography", "Notes: terrain, enclosed environment, monsoon, man and nature. Say each KEY SENTENCE out loud.", "#overview"],
    ["17:00", 60, "Break · dinner · walk", "Real rest. No phone scrolling: your brain is filing what you learned.", ""],
    ["18:00", 25, "Lesson 4 characters", "Palace room 4 (Tian'anmen): days of the week, 几 哪儿 我 回 学校 再见 对不起 没关系.", "#palace/4"],
    ["18:30", 25, "Drill L1-4 mixed", "Include Pinyin mode.", "#drill"],
    ["19:00", 25, "Overview pass 1: culture", "Notes: Confucianism, population, dialects. Then the history slides: early history and Confucius.", "#overview"],
    ["19:30", 25, "Reading L1-4", "Read the dialogues hanzi-first; tap for pinyin only when stuck. Read the grammar notes.", "#reading/1"],
    ["20:00", 25, "Overview: 3D timeline", "Scroll the timeline twice. Close your eyes and recall the order of events.", "#overview"],
    ["20:30", 25, "Review everything due", "Drill → 'Due now'. Finish the stack.", "#drill"],
    ["21:00", 15, "Palace walk, eyes closed", "Walk rooms 1-4 in your head and see each tile. Then sleep: sleep is when memories stick.", "#palace/1"]
  ]},
  { date: "11-15", label: "Sun 15 Nov", sub: "Lesson 5, both mocks, close the gaps", blocks: [
    ["08:30", 25, "Warm-up: due reviews", "Yesterday's cards first, before any new material.", "#drill"],
    ["09:00", 25, "Lesson 5 characters", "Palace room 5 (tea room): 这 是 老师 您 请进 坐 喝茶 谢谢 不客气 工作 身体.", "#palace/5"],
    ["09:30", 25, "Drill L1-5, Write mode", "Write each character stroke by stroke from the meaning.", "#drill"],
    ["10:00", 25, "Grammar L1-5", "吗 questions, 3rd-tone change, 不 tone change, V不V, 是 sentences, 请 + verb, days of the week.", "#reading/5"],
    ["10:30", 15, "Break", "", ""],
    ["10:45", 25, "Overview: history", "Zhang Qian, Wu Zetian, modern timeline. Learn the dates: 138 B.C., 690, 1840, 1911, 1937-45, 1949.", "#overview"],
    ["11:15", 30, "Overview quiz round", "All the flash questions. Re-read the notes for any you miss.", "#overview"],
    ["12:00", 60, "Lunch", "", ""],
    ["13:00", 25, "Listening L1-5", "Textbook 练习 recordings L4-5 at 0.9×, then the initial/final drills: this is the listening half of the Comprehensive exam.", "#listening"],
    ["13:30", 60, "MOCK: Comprehensive L1-5", "The real mid-term's 10 question types. Headphones on, write the typed answers on paper too.", "#mock/comp"],
    ["14:35", 25, "Fix the mock mistakes", "Comprehensive page: practise the 2 weakest question types until each is 80%+.", "#comp"],
    ["15:00", 30, "MOCK: China Overview", "Timed.", "#mock/ov"],
    ["15:45", 30, "Fix Overview gaps", "Re-read only the notes behind wrong answers. Say the key sentences.", "#overview"],
    ["16:30", 30, "Break", "", ""],
    ["17:00", 40, "Write L1-5 from memory", "Paper test: read the English and pinyin from the Characters page and write every character. Circle the misses.", "#chars"],
    ["17:45", 25, "Due reviews", "", "#drill"],
    ["19:00", 60, "MOCK 2: Comprehensive (fresh paper)", "A new paper. Aim for 85%+. Only check the red answers afterwards.", "#mock/comp"],
    ["20:15", 15, "Light pass", "Palace walk L1-5 + one timeline scroll. Then sleep early (before 22:30).", "#palace/1"]
  ]},
  { date: "11-16", label: "Mon 16 Nov", sub: "EXAM: Comprehensive + Overview · start L6", blocks: [
    ["07:30", 30, "Warm-up", "Comprehensive page: Mixed practice, 15 questions with the book audio. Then Overview key words. Nothing new.", "#comp/mix"],
    ["exam:comp", 0, "EXAM: Comprehensive Chinese L1-5", "", ""],
    ["exam:ov", 0, "EXAM: China Overview", "", ""],
    ["18:00", 25, "Lesson 6 characters", "Palace room 6 (library): 请问 贵姓 叫 名字 哪国人 认识 高兴 学习 什么 书 谁 的…", "#palace/6"],
    ["18:30", 25, "Drill L6", "", "#drill"],
    ["19:00", 25, "Reading L6", "Both dialogues. 的 for possession; 贵姓 vs 叫什么名字.", "#reading/6"],
    ["19:30", 25, "Due reviews", "", "#drill"]
  ]},
  { date: "11-17", label: "Tue 17 Nov", sub: "Lessons 7-8 + Reading mock", blocks: [
    ["09:00", 25, "Due reviews", "", "#drill"],
    ["09:30", 25, "Lesson 7 characters", "Palace room 7 (dining hall): food words, 要, 个, 些.", "#palace/7"],
    ["10:00", 25, "Drill L6-7", "", "#drill"],
    ["10:30", 25, "Reading L7", "一 tone change: yì before 1-3, yí before 4.", "#reading/7"],
    ["11:00", 25, "Lesson 8 characters", "Palace room 8 (fruit market): money, 两, 多少, 便宜, 太…了.", "#palace/8"],
    ["11:30", 25, "Drill L8", "", "#drill"],
    ["12:00", 60, "Lunch", "", ""],
    ["13:30", 25, "Reading L8", "Prices: 二 vs 两, 块/毛/分, 吧.", "#reading/8"],
    ["14:00", 30, "Mixed reading drills L1-8", "Sentence order + word meaning across all lessons.", "#drill"],
    ["14:45", 45, "MOCK: Reading L1-8", "Timed.", "#mock/read"],
    ["15:45", 30, "Fix the mock mistakes", "", "#drill"],
    ["19:00", 40, "Write L1-8 from memory", "Paper test from the Characters page.", "#chars"],
    ["19:45", 25, "Due reviews · sleep", "", "#drill"]
  ]},
  { date: "11-18", label: "Wed 18 Nov", sub: "EXAM: Reading · Listening prep", blocks: [
    ["07:30", 30, "Warm-up", "Read every lesson dialogue once, hanzi only.", "#reading/1"],
    ["exam:read", 0, "EXAM: Chinese Reading L1-8", "", ""],
    ["18:00", 25, "Listening L1-3", "Replay the L1-3 练习 recordings, then tone marking + same/different.", "#listening"],
    ["18:30", 25, "Listening L4-5", "z c s / zh ch sh r, finals with u.", "#listening"],
    ["19:00", 35, "MOCK: Listening L1-5", "Use headphones.", "#mock/listen"],
    ["19:45", 25, "Fix tone errors · sleep", "", "#listening"]
  ]},
  { date: "11-19", label: "Thu 19 Nov", sub: "EXAM: Listening", blocks: [
    ["07:30", 25, "Ear warm-up", "Tone ribbons + 20 tone questions.", "#listening"],
    ["exam:listen", 0, "EXAM: Chinese Listening L1-5", "", ""]
  ]}
];

const METHODS = [
  ["Retrieval practice", "Testing yourself beats re-reading. Every drill makes you recall before you see the answer."],
  ["Spaced repetition", "FSRS brings each card back just before you'd forget it. Missed cards return within minutes."],
  ["Interleaving", "After the first pass, drills mix lessons. It feels harder, and that is why it sticks."],
  ["Dual coding", "Each character has a picture, a colour-coded tone and the real stroke motion: words plus images."],
  ["Method of loci", "The 3D palace gives every character a fixed place. Location memory is very strong."],
  ["Generation", "Write from memory (Write mode + paper). Producing a character beats recognising it."],
  ["Sleep", "Sleep consolidates memory. Hard sessions end in the evening and the next day starts with review."],
  ["Mock exams", "One timed mock the day before each exam shows the gaps while there is still time to fix them."]
];

const ticks = read("hzl-ticks", {});

function blockTimes(day, b) {
  if (b[0].startsWith("exam:")) {
    const ex = EXAMS.find(e => e.id === b[0].slice(5));
    const s = examDate(ex); return [s, new Date(s.getTime() + 90 * 6e4), ex];
  }
  const s = new Date(`${YEAR}-${day.date}T${b[0]}:00`);
  return [s, new Date(s.getTime() + b[1] * 6e4), null];
}

function fmt(d) { return d.toTimeString().slice(0, 5); }

function renderCountdowns() {
  const now = Date.now();
  $("countdowns").replaceChildren(...EXAMS.map(e => {
    const t = examDate(e).getTime(), diff = t - now;
    const d = Math.floor(diff / 864e5), hr = Math.floor(diff % 864e5 / 36e5), mi = Math.floor(diff % 36e5 / 6e4);
    const input = h("input", { type: "time", value: examTimes[e.id], "aria-label": `${e.name} start time`, style: "font:inherit;font-size:.8rem;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink);padding:1px 4px",
      onchange: ev => { examTimes[e.id] = ev.target.value; write("hzl-examtimes", examTimes); renderAll(); } });
    return h("div", { class: "cd" + (diff < 0 ? " done" : ""), style: `--c:${e.c}` },
      h("span", {}, e.name),
      h("b", {}, diff < 0 ? "done" : d > 0 ? `${d}d ${hr}h` : `${hr}h ${mi}m`),
      h("span", {}, `${e.day.replace("11-", "Nov ")} · `, input));
  }));
}

function renderPlan() {
  const now = Date.now();
  let current = null, next = null;
  const wrap = h("div");
  for (const day of PLAN) {
    const list = h("div");
    for (const b of day.blocks) {
      const [s, e, ex] = blockTimes(day, b);
      const id = `${day.date}|${b[0]}`;
      const isNow = now >= s && now < e;
      if (isNow) current = { b, s, e, ex };
      if (!next && s > now) next = { b, s, e, ex };
      const cb = h("input", { type: "checkbox", "aria-label": "done", checked: ticks[id] ? "" : false,
        onchange: ev => { ticks[id] = ev.target.checked; write("hzl-ticks", ticks); row.classList.toggle("ticked", ev.target.checked); } });
      const what = h("div", { class: "what" }, h("b", {}, b[2]), b[3] ? h("span", {}, b[3]) : null, b[4] ? h("div", {}, h("a", { href: b[4] }, "Open →")) : null);
      const row = h("div", { class: "block" + (isNow ? " now" : "") + (ex ? " exam" : "") + (ticks[id] ? " ticked" : "") },
        cb, h("time", {}, ex ? fmt(s) + " ✎" : `${b[0]}–${fmt(e)}`), what);
      list.append(row);
    }
    wrap.append(h("div", { class: "day" }, h("h3", {}, day.label, h("small", {}, day.sub)), list));
  }
  $("plan").replaceChildren(wrap);
  const nb = $("now-block");
  const show = (lab, x) => h("div", {}, h("p", { class: "eyebrow" }, lab),
    h("h3", {}, x.b[2]), h("p", { class: "muted" }, `${x.s.toDateString().slice(0, 10)} · ${fmt(x.s)}–${fmt(x.e)}`),
    x.b[3] ? h("p", {}, x.b[3]) : null, x.b[4] ? h("a", { class: "btn", href: x.b[4] }, "Go") : null);
  nb.replaceChildren(current ? show("Now", current) : next ? show("Next up", next) : h("p", {}, "All exams done. 加油 and well done!"));
}

function renderProgress() {
  const now = Date.now();
  const due = Object.entries(fstore.cards).filter(([, r]) => new Date(r.card.due).getTime() <= now).length;
  const rows = LESSONS.map(L => {
    const cs = CHARS.filter(r => r.lesson === L.n);
    const solid = cs.filter(r => charLevel(r.c) === 2).length, seen = cs.filter(r => charLevel(r.c) >= 0).length;
    return h("div", {}, h("div", { class: "row", style: "justify-content:space-between" }, h("span", {}, `L${L.n} ${L.zh}`), h("span", { class: "muted" }, `${solid} solid · ${seen}/${cs.length} seen`)),
      h("div", { class: "bar" }, h("i", { style: `width:${(solid / cs.length) * 100}%` })));
  });
  const today = new Date().toDateString();
  const doneToday = fstore.log.filter(([t]) => new Date(t).toDateString() === today);
  const acc = doneToday.length ? Math.round(doneToday.filter(x => x[1]).length / doneToday.length * 100) : 0;
  $("progress").replaceChildren(
    h("div", { class: "row", style: "gap:18px;margin-bottom:10px" },
      h("div", {}, h("b", { style: "font-size:1.6rem" }, String(due)), h("div", { class: "muted" }, "cards due")),
      h("div", {}, h("b", { style: "font-size:1.6rem" }, String(doneToday.length)), h("div", { class: "muted" }, "answers today")),
      h("div", {}, h("b", { style: "font-size:1.6rem" }, acc + "%"), h("div", { class: "muted" }, "accuracy today"))),
    ...rows);
}

function renderAll() { renderCountdowns(); renderPlan(); renderProgress(); }

export function initToday() {
  $("methods").replaceChildren(...METHODS.map(([t, d]) => h("div", { class: "method" }, h("b", {}, t), d)));
  renderAll();
  setInterval(() => { renderCountdowns(); }, 30000);
  setInterval(renderPlan, 120000);
  addEventListener("progress", renderProgress);
}

// Textbook recordings (汉语教程 Book 1A audio). The MP3s are copyrighted, so they are never published:
// locally they load from private/audio/, on the public site you add them once and they stay in this browser (IndexedDB).
import { h, esc } from "./core.js";

const T = (n, parts) => parts.map(([k, label]) => [`${String(n).padStart(2, "0")}-${k}`, label]);
const EX = "练习 Exercises: tones, 辨音辨调 (tell sounds apart), read aloud";
export const TRACKS = {
  1: T(1, [[1, "课文 Text"], [2, "生词 New words"], [3, "语音 Phonetics: initials, finals, tones"], [4, EX]]),
  2: T(2, [[1, "课文 Text"], [2, "生词 New words"], [3, "语音 Phonetics"], [4, EX]]),
  3: T(3, [[1, "课文 (一) 学汉语"], [2, "课文 (二) 明天见"], [3, "生词 New words"], [4, "语音 Phonetics: j q x, i/ü finals"], [5, EX]]),
  4: T(4, [[1, "课文 (一) Text 1"], [2, "课文 (二) Text 2"], [3, "生词 New words"], [4, "语音 Phonetics"], [5, EX]]),
  5: T(5, [[1, "课文 Text"], [2, "生词 New words"], [3, "语音 Phonetics"], [4, EX]])
};

// ---------- tiny IndexedDB store ----------
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open("hzl-audio", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("t");
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  return dbp;
}
async function idb(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => { const tx = d.transaction("t", mode); const q = fn(tx.objectStore("t")); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); });
}
const urls = new Map();
async function urlFor(id) {
  if (urls.has(id)) return urls.get(id);
  let u = null;
  try { const b = await idb("readonly", s => s.get(id)); if (b) u = URL.createObjectURL(b); } catch {}
  if (!u) { try { const r = await fetch(`private/audio/L${id}.mp3`, { method: "HEAD" }); if (r.ok) u = `private/audio/L${id}.mp3`; } catch {} }
  urls.set(id, u);
  return u;
}
async function addFiles(files) {
  let n = 0;
  for (const f of files) {
    const m = f.name.match(/(\d{2})-(\d)\.mp3$/i);
    if (!m) continue;
    const id = `${m[1]}-${m[2]}`;
    try { await idb("readwrite", s => s.put(f, id)); urls.delete(id); n++; } catch {}
  }
  try { navigator.storage?.persist?.(); } catch {}
  return n;
}

// ---------- player panel ----------
export function audioPanel(lesson) {
  const box = h("div", { class: "panel book-audio" });
  const draw = async () => {
    const tracks = TRACKS[lesson];
    if (!tracks) { box.replaceChildren(); box.style.display = "none"; return; }
    box.style.display = "";
    const got = await Promise.all(tracks.map(([id]) => urlFor(id)));
    const audio = h("audio", { controls: "", preload: "none", style: "width:100%;margin-top:8px" });
    let rate = 1;
    const now = h("div", { class: "muted", style: "font-size:.88rem;margin-top:6px" }, "Pick a track.");
    const list = h("div", { class: "tracks" }, ...tracks.map(([id, label], i) => {
      const b = h("button", { type: "button", class: "track" + (got[i] ? "" : " missing"), disabled: !got[i] || null },
        h("b", {}, id), h("span", {}, label));
      b.onclick = () => {
        list.querySelectorAll(".track").forEach(x => x.classList.toggle("on", x === b));
        audio.src = got[i]; audio.playbackRate = rate; audio.play().catch(() => {});
        now.innerHTML = `Playing <b>${esc(id)}</b>: ${esc(label)}. Follow along in the book from p.${esc(String(lessonPage(lesson)))}.`;
      };
      return b;
    }));
    const speed = h("div", { class: "row", style: "margin-top:8px" }, h("span", { class: "muted" }, "Speed"),
      ...[0.75, 0.9, 1].map(r => h("button", { type: "button", class: "chip" + (r === 1 ? " on" : ""), onclick: e => { rate = r; audio.playbackRate = r; e.target.parentNode.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === e.target)); } }, `${r}×`)),
      h("button", { type: "button", class: "small ghost", onclick: () => { audio.currentTime = Math.max(0, audio.currentTime - 5); } }, "⟲ 5 s back"));
    const have = got.filter(Boolean).length;
    const pickFiles = h("input", { type: "file", multiple: "", accept: ".mp3,audio/mpeg", style: "display:none" });
    pickFiles.onchange = async () => { const n = await addFiles(pickFiles.files); add.textContent = `Added ${n} file${n === 1 ? "" : "s"}`; draw(); };
    const add = h("button", { type: "button", class: have ? "small ghost" : "small", onclick: () => pickFiles.click() }, have ? "Replace recordings" : "➕ Add the recordings");
    box.replaceChildren(
      h("h3", {}, `🎧 Textbook recordings · Lesson ${lesson}`),
      have ? null : h("p", { class: "note" }, "Not added in this browser yet. Tap “Add the recordings” and select the MP3s from School/Chinese/textbook-audio (L01-1.mp3 … L05-4.mp3, or the original 01-1.mp3 names). They stay on this device only."),
      list, have ? h("div", {}, audio, speed, now) : null, h("div", { class: "row", style: "margin-top:8px" }, add, pickFiles));
  };
  draw();
  return box;
}
const lessonPage = n => (window.LESSONS[n - 1] && window.LESSONS[n - 1].page) || "";

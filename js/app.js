// Router + theme + boot.
import { $, read, write } from "./core.js";
import { initToday } from "./plan.js";
import { hero } from "./scenes.js";
import { initCard } from "./card.js";
import { initDrill, enterDrill } from "./drills.js";
import { initPages, enterReading, enterListening, enterChars, enterPalace, enterOverview } from "./pages.js";
import { initMock, enterMock } from "./mock.js";

// theme: auto → paper → ink
const ORDER = ["auto", "light", "dark"], NAMES = { auto: "Auto", light: "Paper", dark: "Ink" };
const getTheme = () => read("hzl-theme", "auto");
function applyTheme(m) {
  if (m === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = m;
  $("theme-btn").textContent = "◐ " + NAMES[m];
  dispatchEvent(new Event("themechange"));
}
$("theme-btn").addEventListener("click", () => { const n = ORDER[(ORDER.indexOf(getTheme()) + 1) % 3]; write("hzl-theme", n); applyTheme(n); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (getTheme() === "auto") applyTheme("auto"); });
applyTheme(getTheme());

const ENTER = { drill: enterDrill, reading: enterReading, listening: enterListening, chars: enterChars, palace: enterPalace, overview: enterOverview, mock: enterMock };
function route() {
  const [view, arg] = (location.hash.slice(1) || "today").split("/");
  const v = document.querySelector(`section[data-view="${view}"]`) ? view : "today";
  document.querySelectorAll("section[data-view]").forEach(s => s.classList.toggle("on", s.dataset.view === v));
  document.querySelectorAll("#tabs a").forEach(a => {
    if (a.getAttribute("href") === "#" + v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.querySelector(`#tabs a[href="#${v}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  try { ENTER[v]?.(arg); } catch (e) { console.error(e); }
  if (v !== "mock" || !arg) scrollTo({ top: 0 });
}

initCard(); initToday(); initDrill(); initPages(); initMock();
hero($("hero-3d"));
addEventListener("hashchange", route);
route();

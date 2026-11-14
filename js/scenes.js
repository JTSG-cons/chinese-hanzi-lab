// three.js scenes: hero, memory palace, tone ribbons, history timeline.
import * as THREE from "three";
import { CHARS, LESSONS, OVERVIEW, charLevel, cssVar, reduced, PY, toneOf } from "./core.js";

const CJK = '"KaiTi","STKaiti","Kaiti SC","Noto Serif SC","Songti SC","SimSun",serif';
const SANS = 'system-ui,"Segoe UI","Microsoft YaHei","PingFang SC",sans-serif';
const isDark = () => document.documentElement.dataset.theme === "dark" ||
  (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
const col = name => new THREE.Color(cssVar(name) || "#888");

// ---------- shared helpers ----------
const texCache = new Map();
export function charTexture(c, { fg = "#1d1a16", bg = "#fffaf0", border = "#b8322a", size = 256, sub = "" } = {}) {
  const key = [c, fg, bg, border, sub].join("|");
  if (texCache.has(key)) return texCache.get(key);
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const g = cv.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, size, size);
  g.strokeStyle = border; g.lineWidth = size * 0.05; g.strokeRect(size * .04, size * .04, size * .92, size * .92);
  g.setLineDash([size * .03, size * .03]); g.strokeStyle = border + "55"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(size / 2, size * .08); g.lineTo(size / 2, size * .92); g.moveTo(size * .08, size / 2); g.lineTo(size * .92, size / 2); g.stroke();
  g.setLineDash([]);
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `${size * (sub ? .58 : .7)}px ${CJK}`;
  g.fillText(c, size / 2, size * (sub ? .45 : .53));
  if (sub) { g.font = `600 ${size * .13}px ${SANS}`; g.fillStyle = border; g.fillText(sub, size / 2, size * .85); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}
function labelTexture(lines, { w = 512, h = 256, bg = "rgba(0,0,0,0)", fg = "#fff", accent = "#e0533f" } = {}) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.textAlign = "center";
  lines.forEach(([txt, px, color, font], i) => {
    g.font = font === "cjk" ? `${px}px ${CJK}` : `700 ${px}px ${SANS}`;
    g.fillStyle = color || fg;
    const y = lines.slice(0, i).reduce((a, l) => a + l[1] * 1.25, 0) + px;
    wrapText(g, txt, w / 2, y + 10, w - 30, px * 1.15);
  });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function wrapText(g, text, x, y, maxW, lh) {
  const words = String(text).split(" "); let line = "", yy = y;
  for (const w of words) { const test = line ? line + " " + w : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
  g.fillText(line, x, yy);
}

function makeRenderer(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}
function fit(renderer, camera, canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return false;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  return true;
}
const visible = el => el.offsetParent !== null && document.visibilityState === "visible";

// Minimal orbit: drag rotates, wheel/pinch zooms.
function orbit(canvas, camera, target, { dist = 14, minD = 5, maxD = 30, phi = 1.05, theta = 0, minPhi = .35, maxPhi = 1.45, auto = 0 } = {}) {
  const s = { dist, phi, theta, vt: 0, vp: 0, dragging: false, moved: 0, auto };
  const pts = new Map();
  let last = null, pinch = 0;
  canvas.addEventListener("pointerdown", e => { pts.set(e.pointerId, [e.clientX, e.clientY]); canvas.setPointerCapture(e.pointerId); s.dragging = true; s.moved = 0; last = [e.clientX, e.clientY]; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
  canvas.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); s.dist = THREE.MathUtils.clamp(s.dist * pinch / d, minD, maxD); pinch = d; s.moved += 10; return; }
    const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
    s.moved += Math.abs(dx) + Math.abs(dy);
    s.vt = -dx * .006; s.vp = -dy * .004; s.theta += s.vt; s.phi = THREE.MathUtils.clamp(s.phi + s.vp, minPhi, maxPhi);
  });
  const up = e => { pts.delete(e.pointerId); if (!pts.size) s.dragging = false; };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("wheel", e => { e.preventDefault(); s.dist = THREE.MathUtils.clamp(s.dist * (1 + Math.sign(e.deltaY) * .08), minD, maxD); }, { passive: false });
  s.update = () => {
    if (!s.dragging) { s.theta += s.vt; s.phi = THREE.MathUtils.clamp(s.phi + s.vp, minPhi, maxPhi); s.vt *= .92; s.vp *= .9; if (s.auto && !reduced()) s.theta += s.auto; }
    camera.position.set(target.x + s.dist * Math.sin(s.phi) * Math.sin(s.theta), target.y + s.dist * Math.cos(s.phi), target.z + s.dist * Math.sin(s.phi) * Math.cos(s.theta));
    camera.lookAt(target);
  };
  return s;
}

// ---------- HERO ----------
export function hero(canvas) {
  const renderer = makeRenderer(canvas); if (!renderer) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 2, .1, 100); camera.position.set(0, 0, 16);
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(4, 6, 8); scene.add(dl);
  const group = new THREE.Group(); scene.add(group);
  const sample = CHARS.filter(r => r.core).sort(() => Math.random() - .5).slice(0, 26);
  const tiles = [];
  const build = () => {
    group.clear(); tiles.length = 0;
    const dark = isDark();
    const side = new THREE.MeshStandardMaterial({ color: dark ? 0x7a2a22 : 0xb8322a, roughness: .5 });
    sample.forEach((r, i) => {
      const face = new THREE.MeshStandardMaterial({ map: charTexture(r.c, { fg: dark ? "#efe8db" : "#1d1a16", bg: dark ? "#26221d" : "#fffaf0", border: dark ? "#e0533f" : "#b8322a" }), roughness: .7 });
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, .35), [side, side, side, side, face, face]);
      const a = i / sample.length * Math.PI * 2;
      m.position.set(3 + Math.cos(a) * (5 + (i % 3)), Math.sin(a * 2) * 3.2, -4 + Math.sin(a) * 4);
      m.userData = { a, sp: .2 + Math.random() * .4, base: m.position.clone() };
      group.add(m); tiles.push(m);
    });
  };
  build(); addEventListener("themechange", build);
  let mx = 0, my = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible(canvas) || !fit(renderer, camera, canvas)) return;
    const t = reduced() ? 0 : clock.getElapsedTime();
    tiles.forEach(m => { const u = m.userData; m.rotation.y = Math.sin(t * u.sp + u.a) * .6; m.rotation.x = Math.cos(t * u.sp * .7 + u.a) * .25; m.position.y = u.base.y + Math.sin(t * .6 + u.a) * .3; });
    group.rotation.y += ((mx * .5) - group.rotation.y) * .04; group.rotation.x += ((my * .3) - group.rotation.x) * .04;
    if (innerWidth < 640) group.position.set(-3, -2.5, -2); else group.position.set(0, 0, 0);
    renderer.render(scene, camera);
  })();
}

// ---------- MEMORY PALACE ----------
const ROOM_STYLE = {
  1: { prop: "gate", hue: 0xb8322a }, 2: { prop: "house", hue: 0xd98a3a }, 3: { prop: "mailbox", hue: 0x2f7d6b },
  4: { prop: "gate", hue: 0xc0392b }, 5: { prop: "teapot", hue: 0x6b8e23 }, 6: { prop: "books", hue: 0x2c5d8f },
  7: { prop: "bowl", hue: 0xd4a017 }, 8: { prop: "fruit", hue: 0xe2632b }
};
function prop(kind, hue) {
  const g = new THREE.Group();
  const M = c => new THREE.MeshStandardMaterial({ color: c, roughness: .6 });
  if (kind === "gate") {
    [-1.3, 1.3].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 3, 12), M(hue)); p.position.set(x, 1.5, 0); g.add(p); });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, .3, .5), M(0x222222)); beam.position.y = 3.1; g.add(beam);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, .8, 4), M(0x2b2b2b)); roof.position.y = 3.7; roof.rotation.y = Math.PI / 4; roof.scale.z = .4; g.add(roof);
  } else if (kind === "house") {
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.8), M(0xf3e9d2)); b.position.y = .8; g.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(2, 1.1, 4), M(hue)); r.position.y = 2.15; r.rotation.y = Math.PI / 4; g.add(r);
  } else if (kind === "mailbox") {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1.4), M(0x333333)); p.position.y = .7; g.add(p);
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, .9, .8), M(hue)); b.position.y = 1.7; g.add(b);
    const env = new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .04), M(0xffffff)); env.position.set(0, 2.45, 0); env.rotation.z = .2; g.add(env);
  } else if (kind === "teapot") {
    const body = new THREE.Mesh(new THREE.SphereGeometry(.9, 24, 16), M(hue)); body.scale.y = .75; body.position.y = .8; g.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 8), M(hue)); lid.position.y = 1.5; g.add(lid);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.08, .16, .9), M(hue)); sp.position.set(1, 1, 0); sp.rotation.z = -.9; g.add(sp);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(.35, .07, 8, 20), M(hue)); hd.position.set(-.95, .9, 0); g.add(hd);
  } else if (kind === "books") {
    [0x2c5d8f, 0xb8322a, 0x2f7d6b, 0xd4a017].forEach((c, i) => { const bk = new THREE.Mesh(new THREE.BoxGeometry(1.6, .35, 1.1), M(c)); bk.position.y = .2 + i * .36; bk.rotation.y = i * .25; g.add(bk); });
  } else if (kind === "bowl") {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xf5f5f0)); bowl.position.y = 1; bowl.material.side = THREE.DoubleSide; g.add(bowl);
    const rice = new THREE.Mesh(new THREE.SphereGeometry(.85, 20, 10), M(0xffffff)); rice.scale.y = .35; rice.position.y = 1; g.add(rice);
    [-.2, .2].forEach(x => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2), M(hue)); s.position.set(x, 1.6, 0); s.rotation.z = .5; g.add(s); });
  } else if (kind === "fruit") {
    for (let i = 0; i < 7; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(.38, 16, 12), M(i % 2 ? 0xd0402e : 0xf08c1a)); a.position.set(Math.cos(i) * .6, .4 + (i > 4 ? .5 : 0), Math.sin(i) * .6); g.add(a); }
  }
  return g;
}

export function palace(canvas, { onPick, getRoom }) {
  const renderer = makeRenderer(canvas);
  if (!renderer) { canvas.replaceWith(Object.assign(document.createElement("p"), { className: "fallback2d", textContent: "3D is not available on this device. Use the tiles below." })); return { setRoom() {} }; }
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 18, 40);
  const camera = new THREE.PerspectiveCamera(45, 1.6, .1, 100);
  const target = new THREE.Vector3(0, 1, 0);
  const ctl = orbit(canvas, camera, target, { dist: 15, auto: .0012 });
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2f25, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(6, 12, 8); scene.add(sun);
  const room = new THREE.Group(); scene.add(room);
  const tiles = [];
  let current = 1;

  function build(n) {
    current = n; room.clear(); tiles.length = 0;
    const dark = isDark();
    scene.fog.color.set(dark ? 0x121110 : 0xebe3d3);
    const st = ROOM_STYLE[n];
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(9, 9.4, .4, 64), new THREE.MeshStandardMaterial({ color: dark ? 0x2a2520 : 0xe6dcc6, roughness: .9 }));
    floor.position.y = -.2; room.add(floor);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8.6, .08, 8, 96), new THREE.MeshStandardMaterial({ color: st.hue }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .02; room.add(ring);
    // floor title
    const title = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ transparent: true, map: labelTexture([[`第${"一二三四五六七八"[n - 1]}课 ${LESSONS[n - 1].zh}`, 64, dark ? "#efe8db" : "#1d1a16", "cjk"], [LESSONS[n - 1].room, 36, "#" + st.hue.toString(16).padStart(6, "0")]]) }));
    title.rotation.x = -Math.PI / 2; title.position.set(0, .03, 3.4); room.add(title);
    const p = prop(st.prop, st.hue); p.position.set(0, 0, -.5); room.add(p);
    const cs = CHARS.filter(r => r.lesson === n);
    const core = cs.filter(r => r.core), extra = cs.filter(r => !r.core);
    const place = (list, radius, y0) => list.forEach((r, i) => {
      const a = (i / list.length) * Math.PI * 2 + (radius > 6 ? 0 : .3);
      const lv = charLevel(r.c);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.55, .65, y0, 20), new THREE.MeshStandardMaterial({ color: lv === 2 ? 0x2f9e5b : lv === 1 ? 0xc98a00 : lv === 0 ? 0xd0402e : (dark ? 0x4a4038 : 0xcfc3aa), roughness: .5 }));
      base.position.set(Math.sin(a) * radius, y0 / 2, Math.cos(a) * radius); room.add(base);
      const face = new THREE.MeshStandardMaterial({ map: charTexture(r.c, { sub: r.py, fg: dark ? "#efe8db" : "#1d1a16", bg: dark ? "#26221d" : "#fffaf0", border: "#" + st.hue.toString(16).padStart(6, "0") }), roughness: .6 });
      const side = new THREE.MeshStandardMaterial({ color: st.hue, roughness: .5 });
      const tile = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, .25), [side, side, side, side, face, face]);
      tile.position.set(base.position.x, y0 + .85, base.position.z);
      tile.lookAt(0, tile.position.y, 0); tile.rotateY(Math.PI);
      tile.userData = { c: r.c, y: tile.position.y, ph: i };
      room.add(tile); tiles.push(tile);
    });
    place(core, core.length > 16 ? 7.2 : 6.2, .9);
    place(extra, 3.6, .5);
  }
  build(getRoom());
  addEventListener("themechange", () => build(current));
  addEventListener("progress", () => { if (visible(canvas)) build(current); });

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener("pointerup", e => {
    if (ctl.moved > 8) return;
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(tiles)[0];
    if (hit) { hit.object.userData.pop = 1; onPick(hit.object.userData.c); }
  });
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible(canvas) || !fit(renderer, camera, canvas)) return;
    const t = reduced() ? 0 : clock.getElapsedTime();
    tiles.forEach(m => { m.position.y = m.userData.y + Math.sin(t * 1.4 + m.userData.ph) * .08; if (m.userData.pop) { m.userData.pop *= .9; m.scale.setScalar(1 + m.userData.pop * .4); } });
    ctl.update(); renderer.render(scene, camera);
  })();
  return { setRoom: n => build(n) };
}

// ---------- TONE RIBBONS ----------
// Chao tone letters (1 low … 5 high): T1 55, T2 35, T3 214, T4 51, neutral: short mid.
export const TONE_SHAPE = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 4], 4: [5, 1], 0: [3, 3] };
const TONE_COLORS = () => ({ 1: col("--t1"), 2: col("--t2"), 3: col("--t3"), 4: col("--t4"), 0: col("--t0") });
export function toneScene(canvas, { tones = [1, 2, 3, 4], spin = true } = {}) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return { play() {}, set() {} };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 2, .1, 100);
  camera.position.set(0, 2, 9.5); camera.lookAt(0, 1.9, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(3, 6, 6); scene.add(dl);
  const group = new THREE.Group(); scene.add(group);
  let curves = {}, balls = {}, playing = null, pt = 0, list = tones;
  function build() {
    group.clear(); curves = {}; balls = {};
    const C = TONE_COLORS();
    // pitch grid lines 1-5
    for (let k = 1; k <= 5; k++) {
      const ln = new THREE.Mesh(new THREE.BoxGeometry(list.length === 1 ? 7.2 : 9.4, .015, .015), new THREE.MeshBasicMaterial({ color: isDark() ? 0x4a443b : 0xcfc3aa }));
      ln.position.set(0, (k - 1) * 1.1, -.6); group.add(ln);
    }
    list.forEach((t, i) => {
      const sh = TONE_SHAPE[t];
      const multi = list.length > 1;
      const cx = multi ? (i - (list.length - 1) / 2) * 2.35 : 0, z = 0;
      const len = multi ? (t === 3 ? 1.9 : 1.6) : (t === 0 ? 2.4 : t === 3 ? 6.4 : 5.6);
      const pts = sh.map((p, j) => new THREE.Vector3(cx - len / 2 + len * j / (sh.length - 1), (p - 1) * 1.1, z));
      const curve = new THREE.CatmullRomCurve3(pts.length === 2 ? [pts[0], pts[0].clone().lerp(pts[1], .5), pts[1]] : pts);
      curves[t] = curve;
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, .16, 12, false), new THREE.MeshStandardMaterial({ color: C[t], roughness: .35, metalness: .1, emissive: C[t], emissiveIntensity: .15 }));
      group.add(tube);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: C[t], emissiveIntensity: .8 }));
      ball.position.copy(curve.getPoint(0)); group.add(ball); balls[t] = ball;
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .65), new THREE.MeshBasicMaterial({ transparent: true, map: labelTexture([[t ? `Tone ${t}` : "neutral", 90, "#" + C[t].getHexString()]], { w: 512, h: 256 }) }));
      if (multi) lbl.position.set(cx, -.75, z); else lbl.position.set(-len / 2 - .9, (sh[0] - 1) * 1.1, z);
      group.add(lbl);
    });
  }
  build(); addEventListener("themechange", build);
  let drag = 0, lastX = null;
  canvas.addEventListener("pointerdown", e => { lastX = e.clientX; });
  canvas.addEventListener("pointermove", e => { if (lastX != null) { drag += (e.clientX - lastX) * .01; lastX = e.clientX; } });
  addEventListener("pointerup", () => { lastX = null; });
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible(canvas) || !fit(renderer, camera, canvas)) return;
    const t = clock.getElapsedTime();
    group.rotation.y = (spin && !reduced() ? Math.sin(t * .4) * .35 : 0) + drag;
    if (playing != null && curves[playing]) {
      pt = Math.min(1, pt + .022);
      balls[playing].position.copy(curves[playing].getPoint(pt));
      balls[playing].scale.setScalar(1 + Math.sin(pt * Math.PI) * .5);
      if (pt >= 1) playing = null;
    }
    renderer.render(scene, camera);
  })();
  return {
    play(t) { if (curves[t]) { playing = t; pt = 0; } },
    set(ts) { list = ts; build(); }
  };
}

// ---------- HISTORY TIMELINE ----------
export function timeline(canvas, onPick) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1.6, .1, 200);
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2f25, 1.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(5, 10, 6); scene.add(dl);
  const ev = OVERVIEW.timeline;
  const STEP = 5;
  const pathPts = ev.map((e, i) => new THREE.Vector3(Math.sin(i * .7) * 3, 0, -i * STEP));
  const path = new THREE.CatmullRomCurve3(pathPts);
  const banners = [];
  function build() {
    scene.clear();
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0x3a2f25, 1.6)); scene.add(dl);
    const dark = isDark();
    scene.fog = new THREE.Fog(dark ? 0x121110 : 0xebe3d3, 8, 34);
    banners.length = 0;
    const road = new THREE.Mesh(new THREE.TubeGeometry(path, 300, .35, 8, false), new THREE.MeshStandardMaterial({ color: dark ? 0x8a6a2a : 0xd4a017, roughness: .4, metalness: .3 }));
    road.scale.y = .25; scene.add(road);
    ev.forEach((e, i) => {
      const p = pathPts[i];
      const side = i % 2 ? 1 : -1;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3.2), new THREE.MeshStandardMaterial({ color: 0x5a4632 }));
      pole.position.set(p.x + side * 2.2, 1.6, p.z); scene.add(pole);
      const yr = e.y < 0 ? `${Math.abs(e.y).toLocaleString()} B.C.` : `${e.y}`;
      const tex = labelTexture([[yr, 58, "#b8322a"], [e.label, 50, dark ? "#efe8db" : "#1d1a16"], [e.era, 34, "#8a7f6e"]], { w: 512, h: 300, bg: dark ? "#26221d" : "#fffaf0" });
      const b = new THREE.Mesh(new THREE.BoxGeometry(3, 1.76, .08), [null, null, null, null, new THREE.MeshStandardMaterial({ map: tex }), new THREE.MeshStandardMaterial({ map: tex })].map(m => m || new THREE.MeshStandardMaterial({ color: 0xb8322a })));
      b.position.set(p.x + side * 2.2, 3.4, p.z); b.rotation.y = -side * .35;
      b.userData = { i, y: 3.4 }; scene.add(b); banners.push(b);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.18, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffa531, emissiveIntensity: 1 }));
      lamp.position.set(p.x, .25, p.z); scene.add(lamp);
    });
  }
  build(); addEventListener("themechange", build);
  let u = 0, vu = 0;
  const maxU = 1;
  canvas.addEventListener("wheel", e => { e.preventDefault(); vu += e.deltaY * .00004 + e.deltaX * .00004; }, { passive: false });
  let ly = null, lx = null, moved = 0;
  canvas.addEventListener("pointerdown", e => { ly = e.clientY; lx = e.clientX; moved = 0; });
  canvas.addEventListener("pointermove", e => { if (ly == null) return; const d = (ly - e.clientY) + (lx - e.clientX); vu += d * .00012; moved += Math.abs(d); ly = e.clientY; lx = e.clientX; });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  canvas.addEventListener("pointerup", e => {
    ly = lx = null; if (moved > 8) return;
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(banners)[0];
    if (hit) { const i = hit.object.userData.i; goTo(i); onPick(i); }
  });
  let goal = null;
  function goTo(i) { goal = i / (ev.length - 1); }
  let lastIdx = -1;
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible(canvas) || !fit(renderer, camera, canvas)) return;
    if (goal != null) { u += (goal - u) * .08; if (Math.abs(goal - u) < .001) goal = null; }
    u = THREE.MathUtils.clamp(u + vu, 0, maxU); vu *= .9;
    const p = path.getPointAt(u), look = path.getPointAt(Math.min(1, u + .05));
    camera.position.set(p.x * .4, 3.4, p.z + 7.5); camera.lookAt(look.x * .6, 2.6, look.z);
    const t = performance.now() / 1000;
    banners.forEach(b => { b.position.y = b.userData.y + (reduced() ? 0 : Math.sin(t + b.userData.i) * .06); });
    const idx = Math.round(u * (ev.length - 1));
    if (idx !== lastIdx) { lastIdx = idx; onPick(idx); }
    renderer.render(scene, camera);
  })();
}
export { PY, toneOf };

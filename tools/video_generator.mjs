// Generates the SAARTHI pitch video (HyperFrames) from one shared deck design system.
// node gen.mjs <projectDir>
import fs from "fs";
import path from "path";

const DIR = process.argv[2];
const COMP = path.join(DIR, "compositions");
fs.mkdirSync(COMP, { recursive: true });

// ---------- deck palette ----------
const INK = "#2D2A4A", MUTED = "#5A5677", RULE = "#DCD8EE";
const P = {
  lav: ["#EFEBFF", "#CDBFFF", "#5B4BC4"], sky: ["#E6F1FF", "#BFDDFF", "#2F6FB5"],
  mint: ["#E3F7EE", "#BDEBD7", "#1E8A63"], peach: ["#FFEDE5", "#FFCDB8", "#C2562D"],
  butter: ["#FFF6D6", "#FFE9A8", "#8A6A00"], rose: ["#FDE8F0", "#F8C6D8", "#B0386A"],
};
const FONT = `@font-face{font-family:"Deck";src:local("Calibri");font-weight:400;font-style:normal}
@font-face{font-family:"Deck";src:local("Calibri Bold");font-weight:700;font-style:normal}
@font-face{font-family:"Deck";src:local("Calibri Italic");font-weight:400;font-style:italic}
@font-face{font-family:"Deck";src:local("Calibri Bold Italic");font-weight:700;font-style:italic}`;

const W = (t) => t.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
const icon = (n, pal) => `assets/icons/${n}-${pal}.svg`;
const dot = (n, pal, d = 84) =>
  `<div class="dot" style="width:${d}px;height:${d}px;background:${P[pal][1]}"><img src="${icon(n, pal)}" style="width:${Math.round(d * 0.5)}px;height:${Math.round(d * 0.5)}px"></div>`;
const pill = (txt, pal) => `<div class="pill" style="background:${P[pal][1]};color:${P[pal][2]}">${txt}</div>`;
const title = (t) => `<div class="t">${W(t)}</div>`;

// shared CSS, scoped to the scene wrapper
const css = (S) => `${FONT}
#root{position:absolute;inset:0;font-family:"Deck",sans-serif;color:${INK}}
${S}{position:absolute;inset:0}
${S} .abs{position:absolute}
${S} .t{position:absolute;left:96px;top:136px;font-size:64px;font-weight:700;line-height:1;white-space:nowrap}
${S} .w{display:inline-block}
${S} .pill{position:absolute;right:96px;top:44px;height:66px;padding:0 38px;border-radius:33px;font-size:28px;font-weight:700;letter-spacing:.12em;display:flex;align-items:center;white-space:nowrap}
${S} .card{position:absolute;border-radius:20px}
${S} .lab{font-size:24px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
${S} .dot{border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
${S} .row{display:flex;align-items:center;gap:20px}
${S} ul{list-style:none;padding:0;margin:0}
${S} li{position:relative;padding-left:26px;margin-top:14px;font-size:28px;line-height:1.22}
${S} li::before{content:"";position:absolute;left:2px;top:13px;width:10px;height:10px;border-radius:50%;background:currentColor;opacity:.45}
${S} .b{font-weight:700}
${S} .m{color:${MUTED}}`;

// shared GSAP helpers (scoped selectors)
const JS = (S) => `const S="${S} ";const q=s=>S+s;const tl=gsap.timeline({paused:true});
const IN=(s,t,o={})=>tl.fromTo(q(s),{opacity:0,x:o.x??0,y:o.y??26,scale:o.sc??1,filter:"blur(6px)"},{opacity:1,x:0,y:0,scale:1,filter:"blur(0px)",duration:o.d??0.6,ease:o.e??"power4.out",stagger:o.s??0},t);
const POP=(s,t,o={})=>IN(s,t,Object.assign({y:0,sc:0.9,e:"back.out(1.5)",d:0.5},o));
const WORDS=(s,t)=>tl.fromTo(q(s+" .w"),{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.13,stagger:0.067,ease:"power2.out"},t);
const FADE=(s,t,o={})=>tl.fromTo(q(s),{opacity:0},{opacity:1,duration:o.d??0.4,ease:"power1.out",stagger:o.s??0},t);
const GROW=(s,t,o={})=>tl.fromTo(q(s),{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:o.d??0.8,ease:o.e??"power3.out",stagger:o.s??0},t);
const GROWY=(s,t,o={})=>tl.fromTo(q(s),{scaleY:0,transformOrigin:"center bottom"},{scaleY:1,duration:o.d??0.6,ease:o.e??"power3.out",stagger:o.s??0},t);
const WIPE=(s,t,o={})=>tl.fromTo(q(s),{clipPath:"inset(0% 100% 0% 0% round 20px)"},{clipPath:"inset(0% 0% 0% 0% round 20px)",duration:o.d??0.8,ease:"power3.inOut",stagger:o.s??0},t);
const DRAW=(s,t,o={})=>{document.querySelectorAll(q(s)).forEach((el,i)=>{const L=Math.ceil(el.getTotalLength());el.style.strokeDasharray=L+" "+L;tl.fromTo(el,{strokeDashoffset:L},{strokeDashoffset:0,duration:o.d??0.9,ease:o.e??"power2.inOut"},t+i*(o.s??0));});};
const COUNT=(s,t,to,o={})=>{const el=document.querySelector(q(s));const v={n:o.from??0};const f=o.fmt??(n=>Math.round(n));el.textContent=f(v.n);tl.fromTo(v,{n:o.from??0},{n:to,duration:o.d??1.6,ease:o.e??"power2.out",onUpdate:()=>{el.textContent=f(v.n);}},t);};
const OUT=t=>tl.to("${S}",{opacity:0,filter:"blur(8px)",duration:0.3,ease:"power2.in"},t);`;

function scene(id, dur, body, sceneCss, script) {
  const S = `#${id}-sc`;
  const html = `<template>
  <style>
${css(S)}
${sceneCss.replaceAll("$S", S)}
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080">
    <div id="${id}-sc" data-hold>
${body}
    </div>
  </div>
  <script>
    (() => {
${JS(S)}
${script}
OUT(${(dur - 0.35).toFixed(2)});
window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
  fs.writeFileSync(path.join(COMP, `${id}.html`), html);
  return { id, dur };
}

// ---------- rover (side view, deck title slide) ----------
const rover = (s = 1) => `
<div class="rv abs" style="left:0;top:0;width:${600 * s}px;height:${440 * s}px">
  <svg viewBox="0 0 600 440" width="${600 * s}" height="${440 * s}" style="overflow:visible">
    <path class="rv-laser" d="M492 72 L640 -6" stroke="#FFAE8C" stroke-width="6" stroke-dasharray="18 14" fill="none"/>
    <line x1="85" y1="96" x2="85" y2="205" stroke="${INK}" stroke-width="4"/>
    <circle cx="85" cy="96" r="13" fill="#F29BBE"/>
    <rect class="rv-box" x="150" y="64" width="144" height="141" rx="8" fill="${P.butter[1]}"/>
    <text x="222" y="146" text-anchor="middle" font-family="Deck,sans-serif" font-weight="700" font-size="30" fill="${P.butter[2]}">5 kg</text>
    <rect x="452" y="70" width="16" height="140" fill="#8EC1F5"/>
    <rect x="410" y="22" width="100" height="56" rx="10" fill="#8EC1F5"/>
    <rect x="45" y="200" width="500" height="148" rx="34" fill="#A99BF5"/>
    <g class="rv-w1"><circle cx="150" cy="360" r="70" fill="#5A5677"/><circle cx="150" cy="360" r="26" fill="#fff"/><rect x="146" y="296" width="8" height="26" rx="4" fill="#fff"/></g>
    <g class="rv-w2"><circle cx="455" cy="360" r="70" fill="#5A5677"/><circle cx="455" cy="360" r="26" fill="#fff"/><rect x="451" y="296" width="8" height="26" rx="4" fill="#fff"/></g>
  </svg>
</div>`;

const scenes = [];

// ================= s01 TITLE =================
scenes.push(scene("s01", 8, `
<div class="abs" style="left:1230px;top:220px;width:860px;height:860px;border-radius:50%;background:${P.lav[0]}" data-layout-allow-overflow></div>
<div class="abs" style="left:-140px;top:830px;width:420px;height:420px;border-radius:50%;background:${P.peach[0]}" data-layout-allow-overflow></div>
<div class="abs" style="left:1660px;top:790px;width:420px;height:420px;border-radius:50%;background:${P.mint[0]}" data-layout-allow-overflow></div>
<img class="abs lg" src="assets/img/logo-dtu.png" style="left:96px;top:40px;width:150px">
<img class="abs lg" src="assets/img/logo-seva.png" style="left:790px;top:46px;width:340px">
<img class="abs lg" src="assets/img/logo-gov.png" style="left:1674px;top:40px;width:150px">
<div class="abs tp" style="left:96px;top:236px;height:68px;padding:0 44px;border-radius:34px;background:${P.rose[0]};color:${P.rose[2]};font-size:24px;font-weight:700;letter-spacing:.12em;display:flex;align-items:center;white-space:nowrap">STAGE 2 · PITCH &amp; MODEL &nbsp;·&nbsp; CATEGORY II — DIPLOMA &amp; HIGHER EDUCATION</div>
<div class="abs name" style="left:90px;top:330px;font-size:156px;font-weight:700;line-height:1;letter-spacing:-.01em">${"SAARTHI".split("").map((c) => `<span class="w">${c}</span>`).join("")}</div>
<div class="abs sub" style="left:96px;top:512px;width:1060px;font-size:46px;line-height:1.2;color:${MUTED}">${W("Drone-grade, low-latency autonomy for a multi-terrain unmanned ground vehicle")}</div>
<div class="abs acr" style="left:96px;top:660px;font-size:31px;font-style:italic;color:${MUTED};white-space:nowrap"><b style="color:${P.lav[2]}">S</b>elf-reliant <b style="color:${P.lav[2]}">A</b>utonomous <b style="color:${P.lav[2]}">A</b>ll-terrain <b style="color:${P.lav[2]}">R</b>over with <b style="color:${P.lav[2]}">T</b>arget &amp; <b style="color:${P.lav[2]}">H</b>azard <b style="color:${P.lav[2]}">I</b>ntelligence</div>
${[["Problem statement", "NAT-003 · R.A.M.A.N", "sky", 96, 486], ["Challenge owner", "Delhi Technological University", "mint", 610, 524], ["Team", "SAMAYPUR SHOOTERS", "butter", 1162, 460]]
  .map(([l, v, p, x, w]) => `<div class="card ic" style="left:${x}px;top:772px;width:${w}px;height:140px;background:${P[p][0]};padding:26px 30px"><div class="lab" style="color:${P[p][2]}">${l}</div><div style="font-size:32px;font-weight:700;margin-top:18px;white-space:nowrap">${v}</div></div>`).join("")}
<div class="abs" style="left:1240px;top:668px;width:620px;height:5px;border-radius:3px;background:${P.lav[1]}"></div>
<div class="abs rvwrap" style="left:1255px;top:252px">${rover(1)}</div>
`, ``, `

IN(".tp",0.15,{y:0,x:-30});
tl.fromTo(q(".name .w"),{opacity:0.15,filter:"blur(5px)"},{opacity:1,filter:"blur(0px)",duration:0.2,stagger:0.08,ease:"power2.out"},0.35);
WORDS(".sub",1.1);
IN(".acr",2.0,{y:0,d:0.5});
IN(".ic",2.5,{s:0.15});
tl.fromTo(q(".rvwrap"),{x:760},{x:0,duration:1.7,ease:"power3.out"},0.2);
tl.fromTo(q(".rv-w1"),{rotation:0,svgOrigin:"150 360"},{rotation:-560,duration:1.7,ease:"power3.out"},0.2);
tl.fromTo(q(".rv-w2"),{rotation:0,svgOrigin:"455 360"},{rotation:-560,duration:1.7,ease:"power3.out"},0.2);
tl.fromTo(q(".rv-box"),{y:-260,opacity:0},{y:0,opacity:1,duration:0.6,ease:"bounce.out"},2.0);
DRAW(".rv-laser",2.9,{d:0.6});
`));

// ================= s02 PROBLEM =================
const tasks = [
  ["Lane discipline", "Zero track-boundary departures", "sky", "FaRoad"],
  ["Signs &amp; lights", "Identify, interpret and obey", "butter", "FaTrafficLight"],
  ["Potholes &amp; obstacles", "Detect and avoid, no collision", "peach", "FaTriangleExclamation"],
  ["20° ramp &amp; debris", "With the 5 kg payload secured", "mint", "FaMountain"],
  ["Face match", "Pick the correct printed panel", "lav", "FaUserCheck"],
  ["Laser indication", "Eye-safe, held ≥ 2.0 s", "rose", "FaCrosshairs"],
];
scenes.push(scene("s02", 17, `
${pill("PROBLEM", "rose")}
${title("The problem, in plain words")}
<div class="card lc" style="left:96px;top:250px;width:620px;height:624px;background:${P.lav[0]};padding:40px 42px">
  <div class="lab" style="color:${P.lav[2]}">In plain words</div>
  <div class="p1" style="font-size:36px;font-weight:700;line-height:1.25;margin-top:18px">${W("Security and emergency teams still send people into hazardous zones.")}</div>
  <div class="p2" style="font-size:30px;line-height:1.3;margin-top:22px">No single affordable ground robot can follow a route, obey traffic signals, dodge hazards, climb rough terrain and identify a target — <b style="color:${P.lav[2]}">on its own</b>.</div>
  <div class="lab p3" style="color:${P.lav[2]};margin-top:34px">Today</div>
  <div class="p3" style="font-size:30px;line-height:1.3;margin-top:10px">Separate or human-assisted systems for each task.</div>
</div>
${tasks.map(([t, s, p, ic], i) => `<div class="card tk" style="left:${756 + (i % 3) * 362}px;top:${250 + Math.floor(i / 3) * 322}px;width:340px;height:302px;background:#fff;border:2px solid ${P[p][1]};padding:30px">${dot(ic, p)}<div style="font-size:32px;font-weight:700;margin-top:26px;line-height:1.1">${t}</div><div class="m" style="font-size:27px;margin-top:12px;line-height:1.2">${s}</div></div>`).join("")}
<div class="card st" style="left:96px;top:900px;width:1728px;height:72px;background:${P.butter[0]};display:flex;align-items:center;padding:0 32px;font-size:28px;white-space:nowrap"><b style="color:${P.butter[2]};margin-right:16px">Hard limits:</b> no uplink in the autonomous round · 2–10 km/h · 60–200 × 40–120 cm · wireless E-stop ≥ 150 m · licence-exempt bands</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
WIPE(".lc",0.8,{d:0.7});
WORDS(".p1",1.4);
IN(".p2",2.8,{y:14});
IN(".p3",5.4,{y:14,s:0.1});
POP(".tk",7.0,{s:0.55});
WIPE(".st",10.2,{d:0.8});
`));

// ================= s03 SOLUTION =================
const pillars = [
  ["1 · Drone-grade core", "lav", "FaGaugeHigh", ["Pixhawk 6C + ArduPilot Rover: 400 Hz control loop, EKF3 fusion", "MAVLink 2 / DDS wired link to the AI computer, &lt; 2 ms", "ExpressLRS 500 Hz + 5.8 GHz digital FPV for the manual round", "RTK GNSS for cm-level task waypoints"]],
  ["2 · Edge-AI perception", "rose", "FaBrain", ["Jetson Orin Nano Super, TensorRT INT8 models", "Lane + pothole segmentation, classical cross-check", "Sign &amp; traffic-light detector with frame voting", "SCRFD + ArcFace face match driving a laser servo"]],
  ["3 · Fail-safe by design", "mint", "FaShieldHalved", ["Hardware E-stop chain that bypasses all software", "433 MHz LoRa heartbeat: link loss means stop", "Autonomous mode physically disables telemetry receive", "Laser fires only on a depth-verified flat panel"]],
];
scenes.push(scene("s03", 26, `
${pill("SOLUTION · 1/9", "lav")}
${title("1 · Proposed solution: SAARTHI")}
<div class="abs lede" style="left:96px;top:236px;width:1728px;font-size:36px;line-height:1.25">${W("A proven drone autopilot core + an edge-AI brain on a rugged 4WD chassis — one stand-alone robot for")} <span class="w b" style="color:${P.lav[2]}">every</span> <span class="w b" style="color:${P.lav[2]}">task.</span></div>
${pillars.map(([t, p, ic, b], i) => `<div class="card pc pc${i}" style="left:${96 + i * 586}px;top:340px;width:556px;height:548px;background:${P[p][0]};padding:34px 36px">
  <div class="row">${dot(ic, p)}<div style="font-size:34px;font-weight:700;color:${P[p][2]}">${t}</div></div>
  <ul style="color:${INK}">${b.map((x) => `<li class="li${i}">${x}</li>`).join("")}</ul></div>`).join("")}
<div class="card pf" style="left:96px;top:910px;width:1728px;height:66px;background:${P.sky[0]};display:flex;align-items:center;padding:0 32px;font-size:28px;white-space:nowrap"><b style="color:${P.sky[2]};margin-right:14px">Platform:</b> 4WD skid-steer · 80 × 60 cm · ~25 kg with payload · 24 V LiFePO4 · independent suspension · 30 cm payload cradle</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
WORDS(".lede",0.9);
${[0, 1, 2].map((i) => `IN(".pc${i}",${2.8 + i * 6},{y:40,d:0.7});IN(".li${i}",${3.4 + i * 6},{y:0,x:-16,s:0.9,d:0.45});`).join("\n")}
WIPE(".pf",20.6);
`));

// ================= s04 HOW IT WORKS =================
const cols = [
  ["Sense", "sky", "FaEye", 96, 470, ["Wide RGB camera · 60 fps", "Depth camera (stereo)", "2D LiDAR · 360°", "RTK GNSS · u-blox F9P", "IMU + wheel encoders"]],
  ["Think · Jetson Orin · ROS 2", "lav", "FaBrain", 690, 540, ["Perception models · TensorRT INT8", "World model + fused costmap", "Mission behaviour tree", "Planner: Nav2 + pure pursuit"]],
  ["Act · Pixhawk 6C", "mint", "FaGears", 1354, 470, ["EKF3 fusion · 400 Hz loop", "Skid-steer mixer + PID", "Motor drivers → 4WD", "Laser pan-tilt gimbal"]],
];
const chain = ["Mushroom + LoRa E-stop (20 Hz heartbeat)", "Latching safety relay", "Contactor opens + driver brake", "Stop &lt; 0.5 s"];
scenes.push(scene("s04", 22, `
${pill("SOLUTION · 1/9", "sky")}
${title("How it works: sense → think → act")}
${cols.map(([t, p, ic, x, w, b], i) => `<div class="card cc cc${i}" style="left:${x}px;top:250px;width:${w}px;height:470px;background:${P[p][0]};padding:32px 34px">
  <div class="row">${dot(ic, p, 72)}<div class="lab" style="color:${P[p][2]};font-size:22px">${t}</div></div>
  <ul>${b.map((x) => `<li class="ci${i}">${x}</li>`).join("")}</ul></div>`).join("")}
${[[566, 690], [1230, 1354]].map(([a, b], i) => `<svg class="abs ar ar${i}" style="left:${a}px;top:445px" width="${b - a}" height="80" viewBox="0 0 ${b - a} 80"><line x1="10" y1="40" x2="${b - a - 18}" y2="40" stroke="${P.lav[1]}" stroke-width="6" stroke-linecap="round"/><path d="M${b - a - 30} 26 L${b - a - 12} 40 L${b - a - 30} 54" stroke="${P.lav[1]}" stroke-width="6" fill="none" stroke-linecap="round"/><circle class="pk pk${i}" cx="14" cy="40" r="9" fill="${P.lav[2]}"/></svg>`).join("")}
<div class="abs lk" style="left:1236px;top:540px;width:112px;text-align:center;font-size:20px;font-weight:700;color:${P.lav[2]};line-height:1.15">MAVLink 2 / DDS<br>&lt; 2 ms</div>
<div class="card sc4" style="left:96px;top:760px;width:1728px;height:206px;background:${P.rose[0]};padding:26px 34px">
  <div class="lab" style="color:${P.rose[2]}">Safety chain · hardware only · no software in the path</div>
  <div class="row" style="margin-top:22px;gap:0">${chain.map((c, i) => `<div class="ch ch${i}" style="flex:none;width:${[520, 340, 420, 250][i]}px;height:92px;border-radius:16px;background:#fff;border:2px solid ${P.rose[1]};display:flex;align-items:center;justify-content:center;text-align:center;font-size:27px;font-weight:700;padding:0 18px;line-height:1.15">${c}</div>${i < 3 ? `<div style="width:44px;text-align:center;font-size:34px;color:${P.rose[2]}">→</div>` : ""}`).join("")}</div>
</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
IN(".cc0",0.9,{x:-30,y:0});IN(".ci0",1.3,{y:0,x:-14,s:0.35,d:0.4});
FADE(".ar0",3.4);IN(".cc1",3.7,{x:-30,y:0});IN(".ci1",4.1,{y:0,x:-14,s:0.45,d:0.4});
FADE(".ar1",6.6);IN(".cc2",6.9,{x:-30,y:0});IN(".ci2",7.3,{y:0,x:-14,s:0.45,d:0.4});IN(".lk",7.0,{y:0});
${[0, 1].map((i) => `tl.fromTo(q(".pk${i}"),{attr:{cx:14}},{attr:{cx:${i ? 92 : 92}},duration:0.9,ease:"none",repeat:${i ? 13 : 19}},${i ? 6.9 : 3.6});`).join("\n")}
WIPE(".sc4",10.6,{d:0.7});
${[0, 1, 2, 3].map((i) => `tl.fromTo(q(".ch${i}"),{opacity:0.25,scale:0.94},{opacity:1,scale:1,duration:0.45,ease:"back.out(1.6)"},${11.6 + i * 0.9});tl.to(q(".ch${i}"),{backgroundColor:"${P.rose[1]}",duration:0.3},${11.8 + i * 0.9});`).join("\n")}
`));

// ================= s05 PROTOTYPE / DIGITAL TWIN PREVIEW =================
// track in panel-local px: loop rect x 70..1030, y 70..570
const logLines = [
  [4.0, "✓", "Self-check · RTK fix · heartbeat OK", "mint"],
  [5.0, "✓", "Lane follow · centre-line tracking", "mint"],
  [6.0, "■", "Red light detected → stop", "rose"],
  [7.6, "✓", "Green → go", "mint"],
  [9.4, "✓", "20° ramp · pitch-aware torque", "mint"],
  [12.2, "✓", "Pothole avoided · replanned", "mint"],
  [16.0, "✓", "Face match · ArcFace top-1", "mint"],
  [19.3, "✓", "Laser held 3.0 s on panel", "mint"],
  [20.4, "✓", "Finish · 0 boundary departures", "mint"],
];
const done = ["Problem statement → 6 measurable targets", "Full architecture + radio plan", "ML stack chosen, each with a fallback", "Costed BOM · ₹2,88,200", "Gated 75-day plan with exit criteria"];
scenes.push(scene("s05", 30, `
${pill("PROTOTYPE · 2/9", "butter")}
${title("2 · Early prototype: digital-twin preview")}
<div class="card bn" style="left:96px;top:236px;width:1728px;height:72px;background:${P.butter[0]};display:flex;align-items:center;padding:0 30px;font-size:28px;white-space:nowrap"><b style="color:${P.butter[2]};margin-right:14px">Status:</b> hardware not built yet. Below is an <b style="margin:0 8px">illustrative preview</b> of our planned Gazebo digital twin (build gate G0, days 1–15).</div>
<div class="card tp5" style="left:96px;top:332px;width:1100px;height:640px;background:#F6F4FC">
  <svg class="abs" style="left:0;top:0" width="1100" height="640" viewBox="0 0 1100 640">
    <rect class="trk" x="70" y="70" width="960" height="500" rx="130" fill="none" stroke="${P.lav[1]}" stroke-width="84"/>
    <rect class="trkc" x="70" y="70" width="960" height="500" rx="130" fill="none" stroke="#FFE9A8" stroke-width="5" stroke-dasharray="26 22"/>
    <rect class="ramp" x="988" y="230" width="84" height="200" fill="${P.peach[1]}" opacity="0.9"/>
    <text class="rampt" x="955" y="338" text-anchor="end" font-family="Deck,sans-serif" font-size="24" font-weight="700" fill="${P.peach[2]}">20° ramp</text>
    <ellipse class="hole" cx="650" cy="52" rx="30" ry="20" fill="#5A5677"/>
    <text class="holet" x="650" y="160" font-family="Deck,sans-serif" font-size="24" font-weight="700" fill="${MUTED}" text-anchor="middle">pothole</text>
    <g class="tlight"><rect x="610" y="430" width="44" height="96" rx="12" fill="${INK}"/><circle class="tlr" cx="632" cy="456" r="13" fill="#5A5677"/><circle class="tlg" cx="632" cy="500" r="13" fill="#7FD4B0"/></g>
    <g class="faces">${[250, 330, 410].map((y, i) => `<rect x="232" y="${y - 30}" width="52" height="60" rx="8" fill="#fff" stroke="${i === 1 ? P.lav[2] : RULE}" stroke-width="${i === 1 ? 4 : 2}"/><circle cx="258" cy="${y - 8}" r="11" fill="${P.lav[1]}"/><rect x="243" y="${y + 8}" width="30" height="14" rx="7" fill="${P.lav[1]}"/>`).join("")}</g>
    <text class="facet" x="300" y="460" font-family="Deck,sans-serif" font-size="24" font-weight="700" fill="${P.lav[2]}">face-ID zone</text>
    <line class="beam" x1="104" y1="330" x2="232" y2="330" stroke="#FF8A65" stroke-width="5" stroke-dasharray="12 8"/>
    <g class="flag"><rect x="176" y="530" width="48" height="80" fill="#fff"/>${[0, 1, 2, 3].map((r) => [0, 1].map((c) => ((r + c) % 2 ? `<rect x="${176 + c * 24}" y="${530 + r * 20}" width="24" height="20" fill="${INK}"/>` : "")).join("")).join("")}</g>
    <g class="car"><rect x="-34" y="-24" width="68" height="48" rx="12" fill="#A99BF5"/><rect x="-30" y="-32" width="20" height="10" rx="3" fill="#5A5677"/><rect x="10" y="-32" width="20" height="10" rx="3" fill="#5A5677"/><rect x="-30" y="22" width="20" height="10" rx="3" fill="#5A5677"/><rect x="10" y="22" width="20" height="10" rx="3" fill="#5A5677"/><rect x="16" y="-10" width="14" height="20" rx="4" fill="#8EC1F5"/></g>
  </svg>
  <div class="abs lh" style="left:300px;top:270px;font-size:26px;font-weight:700;color:#C2562D;white-space:nowrap">laser hold <span class="lhn">0.0</span> s</div>
  <div class="abs" style="left:430px;top:224px;font-size:24px;font-weight:700;letter-spacing:.12em;color:${MUTED}">ILLUSTRATIVE · NOT FOOTAGE</div>
</div>
<div class="card lgp" style="left:1220px;top:332px;width:604px;height:640px;background:#fff;border:2px solid ${RULE};padding:30px 32px">
  <div class="logs">
    <div class="lab" style="color:${P.lav[2]}">Mission log · simulated</div>
    ${logLines.map(([, s, t, p]) => `<div class="ll" style="font-size:27px;margin-top:17px;white-space:nowrap"><b style="color:${P[p][2]};display:inline-block;width:32px">${s}</b>${t}</div>`).join("")}
  </div>
  <div class="dn abs" style="left:32px;top:30px;width:540px">
    <div class="lab" style="color:${P.mint[2]}">Work completed so far</div>
    ${done.map((t) => `<div class="dl" style="font-size:28px;margin-top:22px;line-height:1.2;display:flex;gap:14px"><b style="color:${P.mint[2]}">✓</b><span>${t}</span></div>`).join("")}
  </div>
</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
WIPE(".bn",0.9);
FADE(".tp5",1.6);FADE(".lgp",1.6);
DRAW(".trk",1.8,{d:1.4});FADE(".trkc",2.9);
POP(".ramp",2.6);FADE(".rampt",2.8);POP(".hole",2.8);FADE(".holet",3.0);POP(".tlight",3.0);POP(".faces",3.1);FADE(".facet",3.2);POP(".flag",3.2);
tl.set(q(".beam"),{opacity:0},0);tl.set(q(".lh"),{opacity:0},0);tl.set(q(".dn"),{opacity:0},0);
const car=q(".car");
tl.fromTo(car,{x:200,y:570,rotation:0,opacity:0},{opacity:1,duration:0.3},3.6);
tl.to(car,{x:610,duration:2.0,ease:"power1.inOut"},4.0);
tl.to(q(".tlr"),{attr:{fill:"#F2556E"},duration:0.1},5.6);tl.to(q(".tlg"),{attr:{fill:"#5A5677"},duration:0.1},5.6);
tl.to(q(".tlr"),{attr:{fill:"#5A5677"},duration:0.1},7.5);tl.to(q(".tlg"),{attr:{fill:"#7FD4B0"},duration:0.1},7.5);
tl.to(car,{x:900,duration:1.0,ease:"power1.in"},7.6);
tl.to(car,{x:1030,y:440,rotation:-90,duration:0.7,ease:"none"},8.6);
tl.to(car,{y:200,duration:1.7,ease:"power1.inOut"},9.3);
tl.to(car,{x:900,y:70,rotation:-180,duration:0.7,ease:"none"},11.0);
tl.to(car,{x:740,duration:0.5,ease:"none"},11.7);
tl.to(car,{x:650,y:118,rotation:-165,duration:0.35,ease:"sine.inOut"},12.2);
tl.to(car,{x:560,y:70,rotation:-180,duration:0.35,ease:"sine.inOut"},12.55);
tl.to(car,{x:200,duration:1.3,ease:"none"},12.9);
tl.to(car,{x:70,y:200,rotation:-270,duration:0.7,ease:"none"},14.2);
tl.to(car,{y:330,duration:0.8,ease:"power2.out"},14.9);
tl.fromTo(q(".faces rect:nth-of-type(3)"),{attr:{"stroke-width":4}},{attr:{"stroke-width":7},duration:0.3,yoyo:true,repeat:3},15.9);
tl.to(q(".beam"),{opacity:1,duration:0.1},16.3);tl.to(q(".lh"),{opacity:1,duration:0.2},16.3);
COUNT(".lhn",16.3,3.0,{d:3.0,e:"none",fmt:n=>n.toFixed(1)});
tl.to(q(".beam"),{opacity:0,duration:0.1},19.3);
tl.to(car,{y:440,duration:0.6,ease:"power1.in"},19.4);
tl.to(car,{x:200,y:570,rotation:-360,duration:0.7,ease:"power1.out"},20.0);
tl.fromTo(q(".flag"),{scale:1},{scale:1.15,transformOrigin:"50% 100%",duration:0.25,yoyo:true,repeat:1},20.5);
${logLines.map(([t], i) => `IN(".ll:nth-of-type(${i + 2})",${t},{y:0,x:-14,d:0.35});`).join("\n")}
tl.to(q(".logs"),{opacity:0,filter:"blur(8px)",duration:0.3,ease:"power2.in"},22.0);
tl.to(q(".dn"),{opacity:1,duration:0.2},22.3);
IN(".dl",22.4,{y:0,x:-16,s:0.55,d:0.45});
`));

// ================= s06 DRAWINGS =================
const spec = [["Size L × W × H", "800 × 600 × ~650 mm"], ["Mass with payload", "~25 kg"], ["Drive", "4WD skid-steer, 4 × 24 V motors"], ["Wheels", "200 mm, swing-arm suspension"], ["Speed", "4–6 km/h cruise, cap 9.5 km/h"], ["Battery", "24 V 20 Ah LiFePO4 · 512 Wh"], ["Compute", "Jetson Orin Nano Super + Pixhawk 6C"], ["Ground clearance", "≥ 80 mm for debris"], ["Payload cradle", "Printed locators + ratchet strap"]];
const ln = `fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const dim = `stroke="${P.peach[2]}" stroke-width="2.5" fill="none"`;
const tx = (x, y, t, o = "") => `<text x="${x}" y="${y}" font-family="Deck,sans-serif" font-size="24" ${o}>${t}</text>`;
scenes.push(scene("s06", 24, `
${pill("DRAWINGS · 3/9", "peach")}
${title("3 · Drawings &amp; design sketches")}
<div class="card dp" style="left:96px;top:236px;width:1070px;height:740px;background:#FBFAFE;border:2px solid ${RULE}">
<svg class="abs" style="left:0;top:0" width="1070" height="740" viewBox="0 0 1070 740">
  <g class="sv">
    ${tx(40, 50, "SIDE VIEW", `font-weight="700" fill="${P.peach[2]}" letter-spacing="3"`)}
    <line class="d1" x1="40" y1="400" x2="560" y2="400" stroke="${RULE}" stroke-width="3"/>
    <rect class="d1" x="110" y="270" width="400" height="80" rx="20" ${ln}/>
    <circle class="d1" cx="170" cy="350" r="50" ${ln}/><circle class="d1" cx="450" cy="350" r="50" ${ln}/>
    <rect class="d1" x="200" y="170" width="150" height="100" rx="6" ${ln}/>
    <line class="d1" x1="470" y1="270" x2="470" y2="105" ${ln}/>
    <rect class="d1" x="440" y="75" width="80" height="34" rx="8" ${ln}/>
    <rect class="d1" x="448" y="112" width="64" height="20" rx="6" ${ln}/>
    <line class="d1" x1="140" y1="270" x2="140" y2="210" ${ln}/>
    <path class="d2" d="M110 430 L510 430 M110 420 L110 440 M510 420 L510 440" ${dim}/>
    <path class="d2" d="M70 75 L70 400 M60 75 L80 75 M60 400 L80 400" ${dim}/>
  </g>
  <g class="svl">
    ${tx(250, 466, "800 mm", `text-anchor="middle" font-weight="700" fill="${P.peach[2]}"`)}
    ${tx(30, 250, "~650", `font-weight="700" fill="${P.peach[2]}" text-anchor="middle" transform="rotate(-90 30 250)"`)}
    ${tx(275, 160, "Payload 30 cm · 5 kg", `text-anchor="middle" fill="${INK}"`)}
    ${tx(530, 70, "Camera + LiDAR mast", `fill="${INK}"`)}
  </g>
  <g class="tv">
    ${tx(640, 50, "TOP VIEW", `font-weight="700" fill="${P.peach[2]}" letter-spacing="3"`)}
    <rect class="d3" x="660" y="110" width="320" height="240" rx="24" ${ln}/>
    <rect class="d3" x="680" y="90" width="70" height="30" rx="8" ${ln}/><rect class="d3" x="890" y="90" width="70" height="30" rx="8" ${ln}/>
    <rect class="d3" x="680" y="340" width="70" height="30" rx="8" ${ln}/><rect class="d3" x="890" y="340" width="70" height="30" rx="8" ${ln}/>
    <rect class="d3" x="740" y="170" width="120" height="120" rx="6" ${ln}/>
    <path class="d4" d="M660 400 L980 400 M660 390 L660 410 M980 390 L980 410" ${dim}/>
    <path class="d4" d="M1010 110 L1010 350 M1000 110 L1020 110 M1000 350 L1020 350" ${dim}/>
  </g>
  <g class="tvl">
    ${tx(820, 436, "800 mm", `text-anchor="middle" font-weight="700" fill="${P.peach[2]}"`)}
    ${tx(1040, 236, "600", `text-anchor="middle" font-weight="700" fill="${P.peach[2]}"`)}
    ${tx(940, 240, "FRONT →", `text-anchor="end" font-weight="700" fill="${INK}" font-size="22"`)}
  </g>
  <line x1="40" y1="500" x2="1030" y2="500" stroke="${RULE}" stroke-width="2"/>
  <g class="rp">
    ${tx(40, 548, "RAMP", `font-weight="700" fill="${P.peach[2]}" letter-spacing="3"`)}
    <path class="d5" d="M60 700 L420 700 L420 569 Z" fill="${P.peach[0]}" stroke="${INK}" stroke-width="3"/>
    <g transform="rotate(-20 240 630)"><rect class="d5" x="190" y="590" width="100" height="40" rx="10" fill="#A99BF5"/></g>
    <path class="d6" d="M300 600 L385 569" stroke="${P.mint[2]}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="d5" d="M130 700 A70 70 0 0 0 127 678" ${dim}/>
  </g>
  <g class="rpl">
    ${tx(150, 690, "20°", `font-weight="700" fill="${P.peach[2]}"`)}
    <text x="470" y="600" font-family="Deck,sans-serif" font-size="30" font-weight="700" fill="${INK}">95 N tractive force needed</text>
    <text x="470" y="642" font-family="Deck,sans-serif" font-size="28" fill="${INK}">→ ≈ 4.8 N·m per wheel (2× safety factor)</text>
    <text x="470" y="690" font-family="Deck,sans-serif" font-size="22" fill="${MUTED}">Schematic, not to final scale · full CAD in the supplemental archive</text>
  </g>
</svg></div>
<div class="card tb" style="left:1196px;top:236px;width:628px;height:740px;background:${P.peach[0]};padding:26px 30px">
  <div class="lab" style="color:${P.peach[2]}">Design values</div>
  ${spec.map(([a, b]) => `<div class="sr" style="display:flex;border-bottom:2px solid ${P.peach[1]};padding:12px 0;min-height:70px;align-items:center"><div style="width:220px;flex:none;font-size:25px;font-weight:700;color:${P.peach[2]}">${a}</div><div style="font-size:27px;line-height:1.15">${b}</div></div>`).join("")}
</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
FADE(".dp",0.8);
DRAW(".d1",1.2,{s:0.35,d:0.8});
DRAW(".d2",4.6,{s:0.3,d:0.6});
FADE(".svl text",5.2,{s:0.3});
DRAW(".d3",7.0,{s:0.25,d:0.6});
DRAW(".d4",9.0,{s:0.3,d:0.5});
FADE(".tvl text",9.6,{s:0.25});
DRAW(".d5",11.0,{s:0.3,d:0.6});
DRAW(".d6",12.2,{d:0.5});
FADE(".rpl text",12.6,{s:0.5});
WIPE(".tb",14.6,{d:0.6});
IN(".sr",15.0,{y:0,x:-16,s:0.38,d:0.4});
`));

// ================= s07 CALCULATIONS =================
const segs = [["Camera", 33, 16.7, "sky"], ["AI inference", 40, 8, "rose"], ["Fusion + planning", 20, 10, "lav"], ["Link to controller", 30, 2, "peach"], ["Control loop", 20, 2.5, "mint"], ["Motor driver", 5, 5, "butter"]];
const PX = 8.9; // px per ms
const bar = (k, top) => {
  let x = 0;
  return segs.map(([n, a, b, p], i) => {
    const v = k ? b : a, w = v * PX;
    const s = `<div class="sg sg${k}" style="position:absolute;left:${x}px;top:0;width:${w}px;height:84px;background:${P[p][1]};border-right:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:${P[p][2]};overflow:hidden">${w > 120 ? v : ""}</div>`;
    x += w; return s;
  }).join("");
};
const calcs = [
  ["Ramp traction", "mint", "FaMountain", "F = mg(sin 20° + 0.05·cos 20°), m = 25 kg", "95 N → ≈ 4.8 N·m / wheel"],
  ["Tip-over margin", "peach", "FaScaleBalanced", "atan(½ wheelbase / CG height) = atan(0.30 / 0.25)", "50° limit vs 20° ramp"],
  ["Stopping distance", "rose", "FaStop", "v·t_lat + v²/2a at 10 km/h, a = 3 m/s²", "1.4 m vs 4 m sensing"],
  ["E-stop link budget", "sky", "FaSatelliteDish", "433 MHz LoRa, 10 dBm · FSPL at 300 m = 75 dB", "≥ 60 dB fade margin"],
  ["Endurance", "butter", "FaBatteryFull", "24 V × 20 Ah LiFePO4 = 512 Wh at ~220 W", "≈ 2.3 h vs &lt; 20 min run"],
  ["Laser aim", "lav", "FaCrosshairs", "A4 panel at 3 m ≈ ±2.0° window; servo 0.1°", "20× aim margin · 3 s hold"],
];
scenes.push(scene("s07", 30, `
${pill("NUMBERS · 4/9", "lav")}
${title("4 · Calculations &amp; simulation")}
<div class="pa abs" style="left:0;top:0;width:1920px;height:1080px">
  <div class="abs lab" style="left:96px;top:250px;color:${P.lav[2]};font-size:22px">Perception-to-wheels latency (ms, estimated)</div>
  <div class="abs" style="left:96px;top:328px;width:300px;font-size:30px;font-weight:700;line-height:1.1">Typical hobby stack</div>
  <div class="abs" style="left:96px;top:478px;width:300px;font-size:30px;font-weight:700;color:${P.lav[2]}">SAARTHI target</div>
  <div class="abs" style="left:420px;top:316px;width:1320px;height:84px">${bar(0)}</div>
  <div class="abs" style="left:420px;top:466px;width:1320px;height:84px">${bar(1)}</div>
  <div class="abs tt0" style="left:${420 + 148 * PX + 20}px;top:326px;font-size:52px;font-weight:700;white-space:nowrap"><span class="n0">0</span> ms</div>
  <div class="abs tt1" style="left:${420 + 44.2 * PX + 20}px;top:476px;font-size:52px;font-weight:700;color:${P.lav[2]};white-space:nowrap">≈ <span class="n1">0</span> ms</div>
  <div class="abs lgd" style="left:420px;top:590px;display:flex;gap:30px;flex-wrap:wrap;width:1400px">${segs.map(([n, , , p]) => `<div style="display:flex;align-items:center;gap:10px;font-size:24px"><span style="width:22px;height:22px;border-radius:6px;background:${P[p][1]}"></span>${n}</div>`).join("")}</div>
  <div class="abs bl" style="left:96px;top:720px;width:1728px;font-size:44px;line-height:1.25">${W("At 10 km/h the robot travels ~41 cm before it reacts on a typical stack —")} <span class="w b" style="color:${P.lav[2]}">~12</span> <span class="w b" style="color:${P.lav[2]}">cm</span> <span class="w">with</span> <span class="w">SAARTHI.</span></div>
  <div class="abs bl2" style="left:96px;top:860px;font-size:28px;color:${MUTED}">Drone-grade links: wired MAVLink 2 / DDS &lt; 2 ms · 400 Hz control loop · TensorRT INT8 inference</div>
</div>
<div class="pb abs" style="left:0;top:0;width:1920px;height:1080px">
${calcs.map(([t, p, ic, f, r], i) => `<div class="card cl" style="left:${96 + (i % 3) * 586}px;top:${244 + Math.floor(i / 3) * 336}px;width:556px;height:312px;background:${P[p][0]};padding:28px 32px">
  <div class="row">${dot(ic, p, 72)}<div style="font-size:32px;font-weight:700">${t}</div></div>
  <div class="m" style="font-size:25px;margin-top:22px;line-height:1.25;height:64px">${f}</div>
  <div style="font-size:38px;font-weight:700;color:${P[p][2]};margin-top:26px;white-space:nowrap">${r}</div></div>`).join("")}
  <div class="card sm" style="left:96px;top:924px;width:1728px;height:62px;background:${P.lav[0]};display:flex;align-items:center;padding:0 30px;font-size:28px;white-space:nowrap"><b style="color:${P.lav[2]};margin-right:14px">Simulation:</b> Gazebo digital twin of the arena CAD · 500 randomised runs planned before hardware trials</div>
</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
FADE(".pa .lab",0.8);
GROW(".sg0",1.2,{s:0.42,d:0.5,e:"power2.out"});
COUNT(".n0",1.2,148,{d:2.6,e:"none"});
GROW(".sg1",4.4,{s:0.3,d:0.35,e:"power2.out"});
COUNT(".n1",4.4,44,{d:1.9,e:"none"});
FADE(".tt0",1.2);FADE(".tt1",4.4);
FADE(".lgd",3.6);
WORDS(".bl",6.8);
IN(".bl2",9.6,{y:10});
tl.to(q(".pa"),{opacity:0,filter:"blur(8px)",duration:0.35,ease:"power2.in"},14.6);
tl.set(q(".pb"),{opacity:0},0);tl.set(q(".pb"),{opacity:1},14.9);
IN(".cl",15.0,{y:30,s:1.5,d:0.6});
WIPE(".sm",24.5);
`));

// ================= s08 BOM =================
const bom = [["Jetson Orin Nano Super (8 GB) dev kit", "Compute", 32000], ["Depth camera + wide RGB camera", "Perception", 38000], ["2D LiDAR (360°)", "Perception", 8000], ["Pixhawk 6C autopilot + GPS mast", "Flight stack", 20000], ["RTK GNSS pair (2 × u-blox F9P + antennas)", "Comms", 45000], ["ELRS link + digital FPV + telemetry radio", "Comms", 26000], ["4 × 24 V geared motors + 2 dual drivers", "Drive", 28000], ["24 V 20 Ah LiFePO4 + BMS + charger", "Power", 14000], ["Al-6061 chassis, suspension, wheels", "Chassis", 18000], ["Wiring, fuses, IP54 enclosures, 3D prints", "Fabrication", 22000], ["E-stop pair, contactor, Class-2 laser gimbal", "Safety", 11000], ["Contingency (10 %)", "Buffer", 26200]];
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const share = [["Flight stack &amp; comms", 91, "sky"], ["Compute &amp; perception", 78, "lav"], ["Drive &amp; power", 42, "butter"], ["Chassis &amp; fabrication", 40, "peach"], ["Contingency", 26.2, "rose"], ["Safety", 11, "mint"]];
scenes.push(scene("s08", 21, `
${pill("COST · 5/9", "mint")}
${title("5 · Bill of materials &amp; estimated cost")}
<div class="card bt" style="left:96px;top:236px;width:1090px;height:744px;background:#fff;border:2px solid ${RULE};padding:14px 28px">
  <div style="display:flex;font-size:20px;font-weight:700;letter-spacing:.12em;color:${P.mint[2]};padding:10px 0;border-bottom:2px solid ${P.mint[1]}"><div style="width:640px">ITEM</div><div style="width:200px">CATEGORY</div><div style="width:170px;text-align:right">COST (INR)</div></div>
  ${bom.map(([a, b, c]) => `<div class="br" style="display:flex;font-size:25px;padding:0;height:51px;align-items:center;border-bottom:1px solid ${RULE}"><div style="width:640px;white-space:nowrap">${a}</div><div class="m" style="width:200px">${b}</div><div style="width:170px;text-align:right;font-weight:700">${inr(c)}</div></div>`).join("")}
  <div class="br" style="display:flex;font-size:28px;height:56px;align-items:center;font-weight:700;color:${P.mint[2]}"><div style="width:840px">Total (prototype)</div><div style="width:170px;text-align:right">₹2,88,200</div></div>
</div>
<div class="card tc" style="left:1216px;top:236px;width:608px;height:250px;background:${P.lav[0]};padding:30px 34px">
  <div class="lab" style="color:${P.lav[2]}">Total prototype cost</div>
  <div style="font-size:92px;font-weight:700;color:${P.lav[2]};line-height:1.1;margin-top:10px" class="tot">₹0</div>
  <div class="m" style="font-size:24px;margin-top:6px">≈ ₹2.9 lakh · indicative Indian market prices</div>
</div>
<div class="abs" style="left:1216px;top:516px;width:608px">
  <div class="lab" style="color:${MUTED}">Share of budget</div>
  ${share.map(([n, v, p]) => `<div class="shr" style="margin-top:14px"><div style="display:flex;justify-content:space-between;font-size:24px"><span>${n}</span><b>₹${v}k</b></div><div style="height:16px;border-radius:8px;background:#F3F1FA;margin-top:6px"><div class="shb" style="height:16px;border-radius:8px;width:${(v / 91) * 100}%;background:${P[p][1]}"></div></div></div>`).join("")}
</div>
<div class="card zc" style="left:1216px;top:920px;width:608px;height:60px;background:${P.mint[0]};display:flex;align-items:center;padding:0 24px;font-size:26px;white-space:nowrap"><b style="color:${P.mint[2]};margin-right:12px">₹0</b> software licences — fully open-source stack</div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
FADE(".bt",0.8);
IN(".br",1.1,{y:0,x:-18,s:0.5,d:0.4});
FADE(".tc",7.4);
COUNT(".tot",7.6,288200,{d:2.4,fmt:n=>"₹"+Math.round(n).toLocaleString("en-IN")});
FADE(".shr",10.4,{s:0.3});
GROW(".shb",10.5,{s:0.3,d:0.7});
WIPE(".zc",13.4);
`));

// ================= s09 TEAM =================
const team = [
  ["Mohammed Adeeb Khan", "B.Tech EE · 3rd year", "Team Lead · Electronics, Power &amp; Safety", "lav", "FaMicrochip", ["System architecture &amp; integration", "Battery, BMS, motor drivers, harness", "ELRS, FPV, RTK &amp; telemetry links", "E-stop chain + chassis build"]],
  ["Bhavya Jain", "B.Tech EE · 3rd year", "Perception &amp; Machine Learning", "rose", "FaBrain", ["Datasets &amp; synthetic data", "Lane, pothole, sign &amp; light models", "SCRFD + ArcFace face matching", "TensorRT on Jetson + laser servo"]],
  ["Ashmit Bindal", "B.Tech IT · 3rd year", "Software · Autonomy, Simulation &amp; Testing", "mint", "FaCode", ["ROS 2 stack + MAVLink / DDS bridge", "ArduPilot tuning, Nav2, mission logic", "Gazebo digital twin &amp; replay tests", "Test logs, compliance, PDR docs"]],
];
scenes.push(scene("s09", 20, `
${pill("TEAM · 6/9", "lav")}
${title("6 · Team roles &amp; responsibilities")}
${team.map(([n, b, r, p, ic, li], i) => `<div class="card tm tm${i}" style="left:${96 + i * 586}px;top:244px;width:556px;height:620px;background:${P[p][0]};padding:34px 36px">
  <div class="row">${dot(ic, p)}<div><div style="font-size:34px;font-weight:700;line-height:1.1">${n}</div><div class="m" style="font-size:24px;margin-top:6px">${b}</div></div></div>
  <div style="font-size:29px;font-weight:700;color:${P[p][2]};margin-top:30px;line-height:1.2;height:72px">${r}</div>
  <ul>${li.map((x) => `<li class="ti${i}" style="margin-top:20px">${x}</li>`).join("")}</ul></div>`).join("")}
<div class="card mt" style="left:96px;top:890px;width:1728px;height:80px;background:#fff;border:2px solid ${P.lav[1]};display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-size:30px;white-space:nowrap"><span><b style="color:${P.lav[2]}">Faculty mentor:</b> Dr. Anamika Chauhan · Delhi Technological University</span><span class="m" style="font-size:26px">3 members · 3 domains · one owner per subsystem</span></div>
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
${[0, 1, 2].map((i) => `IN(".tm${i}",${0.9 + i * 0.35},{y:50,d:0.7});IN(".ti${i}",${2.4 + i * 3.6},{y:0,x:-14,s:0.6,d:0.4});`).join("\n")}
WIPE(".mt",13.2);
`));

// ================= s10 75-DAY PLAN =================
const gantt = [["Design freeze &amp; procurement", 1, 10, "butter"], ["Digital twin &amp; synthetic data", 1, 15, "lav"], ["Chassis fabrication &amp; wiring", 8, 25, "butter"], ["E-stop &amp; safety chain", 10, 22, "rose"], ["Model training &amp; TensorRT", 12, 38, "lav"], ["Manual mode: ELRS, FPV, ramp", 25, 40, "sky"], ["Autonomy: lanes, signs, hazards", 36, 58, "lav"], ["Face-ID + laser gimbal", 42, 60, "peach"], ["Full-course mock runs &amp; tuning", 56, 72, "mint"], ["Inspection prep, docs, buffer", 68, 75, "mint"]];
const gates = [["G0 · D1–15", "Digital twin", "Lane-follow in sim, 20 clean runs", "lav"], ["G1 · D10–30", "Subsystem bench", "Stop &lt; 0.5 s at 300 m E-stop range", "rose"], ["G2 · D25–40", "Manual qualification", "5 clean manual laps on FPV only", "sky"], ["G3 · D36–60", "Autonomy integration", "Each task ≥ 90 % success in mock arena", "peach"], ["G4 · D56–75", "Competition ready", "30 full runs, 0 departures in last 10", "mint"]];
const GX = 560, GW = 1250, d2x = (d) => GX + (d / 75) * GW, SW0 = 1.2, SW1 = 9.2;
const sweepT = (d) => SW0 + (d / 75) * (SW1 - SW0);
scenes.push(scene("s10", 20, `
${pill("PLAN · 7/9", "rose")}
${title("7 · 75-day milestone chart")}
${[0, 15, 30, 45, 60, 75].map((d) => `<div class="abs tk" style="left:${d2x(d) - 40}px;top:236px;width:80px;text-align:center;font-size:24px;font-weight:700;color:${MUTED}">D${d}</div><div class="abs tkl" style="left:${d2x(d)}px;top:272px;width:2px;height:470px;background:${RULE}"></div>`).join("")}
${gantt.map(([n, a, b, p], i) => `<div class="abs gl" style="left:96px;top:${284 + i * 45}px;width:450px;height:38px;font-size:24px;display:flex;align-items:center;white-space:nowrap">${n}</div><div class="abs gb gb${i}" style="left:${d2x(a)}px;top:${288 + i * 45}px;width:${d2x(b) - d2x(a)}px;height:30px;border-radius:15px;background:${P[p][1]}"></div>`).join("")}
${[[40, "D40 manual-ready", 260, -18], [60, "D60 autonomy complete", 300, -18], [75, "D75 competition-ready", 250, 12]].map(([d, t, w, o], i) => `<div class="abs ms ms${i}" style="left:${d2x(d) - 12}px;top:742px;width:24px;height:24px;background:${P.rose[2]};clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)"></div><div class="abs msl msl${i}" style="left:${d2x(d) + o - w}px;top:774px;width:${w}px;text-align:right;font-size:22px;font-weight:700;color:${P.rose[2]};white-space:nowrap">${t}</div>`).join("")}
<div class="abs sw" style="left:${GX}px;top:272px;width:3px;height:470px;background:${P.rose[2]}"></div>
${gates.map(([g, n, c, p], i) => `<div class="card gt" style="left:${96 + i * 350}px;top:822px;width:328px;height:160px;background:${P[p][0]};padding:18px 22px"><div class="lab" style="color:${P[p][2]}">${g}</div><div style="font-size:27px;font-weight:700;margin-top:6px">${n}</div><div style="font-size:23px;margin-top:6px;line-height:1.2">${c}</div></div>`).join("")}
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
FADE(".tk",0.7,{s:0.08});FADE(".tkl",0.7,{s:0.08});
IN(".gl",0.9,{y:0,x:-14,s:0.08,d:0.4});
tl.fromTo(q(".sw"),{x:0,opacity:1},{x:${GW},duration:${SW1 - SW0},ease:"none"},${SW0});
tl.to(q(".sw"),{opacity:0,duration:0.3},${SW1 + 0.1});
${gantt.map(([, a, b], i) => `tl.fromTo(q(".gb${i}"),{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:${(sweepT(b) - sweepT(a)).toFixed(2)},ease:"none"},${sweepT(a).toFixed(2)});`).join("\n")}
${[40, 60, 75].map((d, i) => `POP(".ms${i}",${sweepT(d).toFixed(2)},{d:0.4});FADE(".msl${i}",${(sweepT(d) + 0.1).toFixed(2)});`).join("\n")}
IN(".gt",10.2,{y:30,s:0.75,d:0.6});
`));

// ================= s11 GAPS =================
const gaps = [
  ["Arena data not published yet: track size, sign catalogue, face-panel format", "Clarification query to the DTU technical panel", "Week 1"],
  ["Model latency not yet measured on the Jetson", "Benchmark the TensorRT INT8 models on the vehicle computer", "Week 5"],
  ["No arena-specific training data", "Synthetic data from the Gazebo twin + arena-replica captures", "G0 · D1–15"],
  ["Ramp traction and payload retention untested", "Bench and ramp trials, tested with an 8 kg payload", "G2 · D25–40"],
  ["Lane and sign detection under Delhi daylight glare", "Mock-arena field trials with logged runs", "G3 · D36–60"],
];
scenes.push(scene("s11", 18, `
${pill("GAPS · 8/9", "peach")}
${title("8 · Identified technical gaps")}
<div class="abs" style="left:96px;top:236px;width:1728px;display:flex;font-size:20px;font-weight:700;letter-spacing:.12em;color:${MUTED}"><div style="width:800px">GAP</div><div style="width:700px;padding-left:80px">HOW WE CLOSE IT</div><div style="width:228px;text-align:right">BY</div></div>
${gaps.map(([g, c, w], i) => `<div class="card gp" style="left:96px;top:${280 + i * 140}px;width:1728px;height:122px;background:${i % 2 ? "#fff" : P.peach[0]};border:2px solid ${P.peach[1]};display:flex;align-items:center;padding:0 30px">
  <div style="width:770px;font-size:29px;font-weight:700;line-height:1.2;padding-right:20px">${g}</div>
  <div style="width:60px;font-size:36px;color:${P.peach[2]}">→</div>
  <div style="width:640px;font-size:28px;line-height:1.2">${c}</div>
  <div style="flex:1;text-align:right"><span style="display:inline-block;padding:8px 16px;border-radius:12px;background:${P.peach[1]};color:${P.peach[2]};font-size:23px;font-weight:700;white-space:nowrap">${w}</span></div></div>`).join("")}
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
${gaps.map((_, i) => `WIPE(".gp:nth-of-type(${i + 4})",${1.0 + i * 2.4},{d:0.7});`).join("\n")}
`));

// ================= s12 RISKS =================
const risks = [
  ["An ML model misreads a sign or lane", "Every model has a classical fallback; when unsure (3-of-5 frame vote) the default is stop"],
  ["E-stop or radio link is lost", "Hardware heartbeat: 200 ms of silence opens the contactor; no software in the path"],
  ["The laser could reach a person", "Fires only on face match + depth-verified flat panel + inside the geofence; Class-2 eye-safe"],
  ["Imported parts arrive late", "Order at design freeze (D1–10); simulation work continues without hardware"],
  ["The schedule slips", "Manual-ready by D40, weekly full-integration run, final week kept as buffer"],
  ["The budget overruns", "10 % contingency (₹26,200) already built into the BOM"],
];
scenes.push(scene("s12", 20, `
${pill("RISKS · 9/9", "rose")}
${title("9 · Risks and mitigation")}
${risks.map(([r, m], i) => `<div class="card rk" style="left:${96 + (i % 2) * 879}px;top:${244 + Math.floor(i / 2) * 246}px;width:849px;height:222px;background:#fff;border:2px solid ${P.rose[1]};padding:28px 32px">
  <div class="row">${dot("FaTriangleExclamation", "rose", 60)}<div style="font-size:31px;font-weight:700">${r}</div></div>
  <div class="mg" style="display:flex;gap:16px;margin-top:22px;font-size:28px;line-height:1.25"><img src="${icon("FaCircleCheck", "mint")}" style="width:30px;height:30px;margin-top:3px;flex:none"><span>${m}</span></div></div>`).join("")}
`, ``, `
IN(".pill",0.1,{y:0,x:30});
WORDS(".t",0.2);
${risks.map((_, i) => `IN(".rk:nth-of-type(${i + 3})",${1.0 + i * 2.4},{y:30,d:0.6});IN(".rk:nth-of-type(${i + 3}) .mg",${1.7 + i * 2.4},{y:0,x:-16,d:0.45});`).join("\n")}
`));

// ================= s13 END CARD =================
scenes.push(scene("s13", 12, `
<div class="abs" style="left:1230px;top:220px;width:860px;height:860px;border-radius:50%;background:${P.lav[0]}" data-layout-allow-overflow></div>
<div class="abs" style="left:-140px;top:830px;width:420px;height:420px;border-radius:50%;background:${P.peach[0]}" data-layout-allow-overflow></div>
<img class="abs lg" src="assets/img/logo-dtu.png" style="left:96px;top:40px;width:150px">
<img class="abs lg" src="assets/img/logo-seva.png" style="left:790px;top:46px;width:340px">
<img class="abs lg" src="assets/img/logo-gov.png" style="left:1674px;top:40px;width:150px">
<div class="abs name" style="left:90px;top:250px;font-size:150px;font-weight:700;line-height:1">${"SAARTHI".split("").map((c) => `<span class="w">${c}</span>`).join("")}</div>
<div class="abs ln1" style="left:96px;top:430px;width:1100px;font-size:50px;font-weight:700;line-height:1.2">${W("One robot. Every task.")} <span class="w" style="color:${P.lav[2]}">No</span> <span class="w" style="color:${P.lav[2]}">human</span> <span class="w" style="color:${P.lav[2]}">in</span> <span class="w" style="color:${P.lav[2]}">the</span> <span class="w" style="color:${P.lav[2]}">hazard</span> <span class="w" style="color:${P.lav[2]}">zone.</span></div>
<div class="abs nm" style="left:96px;top:640px;width:1060px">
  <div class="lab" style="color:${P.lav[2]}">Team SAMAYPUR SHOOTERS</div>
  <div style="font-size:34px;font-weight:700;margin-top:14px;line-height:1.35">Mohammed Adeeb Khan · Bhavya Jain · Ashmit Bindal</div>
  <div class="m" style="font-size:28px;margin-top:8px">Faculty mentor: Dr. Anamika Chauhan · Delhi Technological University</div>
</div>
<div class="abs tg" style="left:96px;top:880px;height:64px;padding:0 36px;border-radius:32px;background:${P.rose[0]};color:${P.rose[2]};font-size:23px;font-weight:700;letter-spacing:.1em;display:flex;align-items:center;white-space:nowrap">NAT-003 R.A.M.A.N · SEVA FIRST INNOVATION CHALLENGE 2026</div>
<div class="abs" style="left:1240px;top:668px;width:620px;height:5px;border-radius:3px;background:${P.lav[1]}"></div>
<div class="abs rvwrap" style="left:1255px;top:252px">${rover(1)}</div>
`, ``, `

tl.fromTo(q(".name .w"),{opacity:0.15,filter:"blur(5px)"},{opacity:1,filter:"blur(0px)",duration:0.2,stagger:0.08,ease:"power2.out"},0.2);
WORDS(".ln1",1.0);
IN(".nm",2.6,{y:20});
IN(".tg",3.4,{y:0,x:-30});
tl.fromTo(q(".rvwrap"),{x:760},{x:0,duration:1.7,ease:"power3.out"},0.3);
tl.fromTo(q(".rv-w1"),{rotation:0,svgOrigin:"150 360"},{rotation:-560,duration:1.7,ease:"power3.out"},0.3);
tl.fromTo(q(".rv-w2"),{rotation:0,svgOrigin:"455 360"},{rotation:-560,duration:1.7,ease:"power3.out"},0.3);
DRAW(".rv-laser",2.2,{d:0.6});
`));
// the end card must not blur out: override its exit to a no-op by holding (exit tween removed below)

// ---------- root index ----------
let t = 0;
const hosts = scenes.map((s, i) => {
  const h = `      <div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${t}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${2}"></div>`;
  s.start = t; t += s.dur; return h;
});
const TOTAL = t;
const chromeStart = scenes[1].start, chromeEnd = scenes[scenes.length - 1].start;
const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      ${FONT}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #ffffff; }
      #root { width: 100%; height: 100%; font-family: "Deck", sans-serif; color: ${INK}; }
      #bg { position: absolute; inset: 0; background: #ffffff; }
      #chrome { position: absolute; inset: 0; z-index: 1; }
      #chrome .c { position: absolute; border-radius: 50%; }
      #chrome img { position: absolute; }
      #foot { position: absolute; left: 96px; top: 996px; font-size: 20px; color: ${MUTED}; white-space: nowrap; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      <div id="bg"></div>
      <div id="chrome" class="clip" data-composition-id="chrome" data-composition-src="compositions/chrome.html" data-start="${chromeStart}" data-duration="${chromeEnd - chromeStart}" data-track-index="0" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>
${hosts.join("\n")}
      <audio id="bgm" class="clip" src="assets/bgm/track.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="0.85" data-fade-in="1" data-fade-out="4"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(COMP, "chrome.html"), `<template>
  <style>
${FONT}
#root{position:absolute;inset:0;font-family:"Deck",sans-serif}
#chrome-c .c{position:absolute;border-radius:50%}
#chrome-c img{position:absolute}
#foot{position:absolute;left:96px;top:994px;font-size:22px;color:${MUTED};white-space:nowrap}
  </style>
  <div id="root" data-composition-id="chrome" data-width="1920" data-height="1080">
    <div id="chrome-c">
        <div class="c" style="left:1630px;top:-216px;width:432px;height:432px;background:${P.sky[0]}" data-layout-allow-overflow></div>
        <div class="c" style="left:1810px;top:972px;width:216px;height:216px;background:${P.mint[0]}" data-layout-allow-overflow></div>
        <img src="assets/img/logo-dtu.png" style="left:96px;top:30px;width:96px">
        <img src="assets/img/logo-seva.png" style="left:226px;top:26px;width:232px">
        <img src="assets/img/logo-gov.png" style="left:494px;top:30px;width:100px">
        <div id="foot">NAT-003 R.A.M.A.N · Team SAMAYPUR SHOOTERS · SEVA FIRST Innovation Challenge 2026</div>
          </div>
  </div>
  <script>
    window.__timelines["chrome"] = gsap.timeline({ paused: true });
  </script>
</template>
`);
fs.writeFileSync(path.join(DIR, "index.html"), index);
// the end card holds its final frame: strip its exit tween
const endFile = path.join(COMP, "s13.html");
fs.writeFileSync(endFile, fs.readFileSync(endFile, "utf8").replace(/OUT\([0-9.]+\);\n/, ""));
console.log("scenes", scenes.map((s) => `${s.id}@${s.start}+${s.dur}`).join(" "), "total", TOTAL);

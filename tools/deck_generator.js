const pptxgen = require("pptxgenjs");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const fa = require("react-icons/fa6");
const sharp = require("sharp");
const path = require("path");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const MEDIA = path.join(__dirname, "tplx/ppt/media");
const LOGO = { gov: MEDIA + "/image1.png", dtu: MEDIA + "/image2.png", seva: MEDIA + "/image3.png" };
const OUT = process.argv[2] || "SAARTHI.pptx";

// ---------- pastel palette ----------
const INK = "2D2A4A", MUTED = "5A5677", LINE = "DCD8EE", WHITE = "FFFFFF";
const P = {
  lav:   { bg: "EFEBFF", mid: "CDBFFF", deep: "5B4BC4" },
  sky:   { bg: "E6F1FF", mid: "BFDDFF", deep: "2F6FB5" },
  mint:  { bg: "E3F7EE", mid: "BDEBD7", deep: "1E8A63" },
  peach: { bg: "FFEDE5", mid: "FFCDB8", deep: "C2562D" },
  butter:{ bg: "FFF6D6", mid: "FFE9A8", deep: "8A6A00" },
  rose:  { bg: "FDE8F0", mid: "F8C6D8", deep: "B0386A" },
};
const THEME = {
  name: "SAARTHI Pastel", headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: INK, lt1: WHITE, dk2: MUTED, lt2: "F6F4FC",
    accent1: "A99BF5", accent2: "7FD4B0", accent3: "FFAE8C", accent4: "8EC1F5",
    accent5: "F9D673", accent6: "F29BBE", hlink: "5B4BC4", folHlink: "B0386A" },
};

const iconCache = {};
async function icon(name, color) {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const C = fa[name];
  if (!C) throw new Error("missing icon " + name);
  const svg = renderToStaticMarkup(React.createElement(C, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + buf.toString("base64"));
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "SAARTHI - R.A.M.A.N Ideation Submission";
  pres.author = "Team SAMAYPUR SHOOTERS";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: "TITLE",
    background: { color: WHITE },
    objects: [
      { image: { x: 0.264, y: 0.165, w: 1.0, h: 0.997, path: LOGO.dtu } },
      { image: { x: 5.36, y: 0.236, w: 2.245, h: 1.008, path: LOGO.seva } },
      { image: { x: 11.876, y: 0.189, w: 1.059, h: 1.039, path: LOGO.gov } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: WHITE },
    objects: [
      { ellipse: { x: 11.3, y: -1.5, w: 3.0, h: 3.0, fill: { color: P.sky.bg }, line: { color: P.sky.bg } } },
      { ellipse: { x: 12.55, y: 6.75, w: 1.5, h: 1.5, fill: { color: P.mint.bg }, line: { color: P.mint.bg } } },
      { image: { x: 0.419, y: 0.072, w: 0.694, h: 0.692, path: LOGO.dtu } },
      { image: { x: 1.611, y: 0.016, w: 1.707, h: 0.766, path: LOGO.seva } },
      { image: { x: 3.823, y: 0.072, w: 0.735, h: 0.721, path: LOGO.gov } },
      { text: { text: "NAT-003 R.A.M.A.N  ·  Team SAMAYPUR SHOOTERS  ·  SEVA FIRST Innovation Challenge 2026",
        options: { x: 0.5, y: 7.02, w: 9, h: 0.3, fontSize: 10, color: MUTED, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.9, w: 10.3, h: 0.7,
        fontSize: 32, bold: true, color: INK, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.35, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color: MUTED, align: "right" },
  });

  // ---------- helpers ----------
  const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, color: INK, fontSize: 14, valign: "top", ...o });
  const card = (s, x, y, w, h, fill, extra = {}) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.14, fill: { color: fill }, line: { color: fill }, ...extra });
  const dot = async (s, x, y, d, pal, ic) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: pal.mid }, line: { color: pal.mid } });
    const pad = d * 0.24;
    s.addImage({ data: await icon(ic, pal.deep), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
  };
  const pill = (s, n, tag) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.95, y: 0.3, w: 1.9, h: 0.42, rectRadius: 0.21, fill: { color: P.lav.mid }, line: { color: P.lav.mid } });
    T(s, `${tag}  ·  ${String(n).padStart(2, "0")}/22`, { x: 10.95, y: 0.3, w: 1.9, h: 0.42, fontSize: 11, bold: true, color: P.lav.deep, align: "center", valign: "middle", charSpacing: 1 });
  };
  // bullets: items are strings, "Label: rest" gets a bold label
  const bl = (items, o = {}) => items.map((it, i) => {
    const last = i === items.length - 1;
    const base = { bullet: { indent: 13 }, paraSpaceAfter: o.gap ?? 5, breakLine: !last };
    const m = it.match(/^([^:]{2,38}):\s(.*)$/);
    if (m) return [{ text: m[1] + ": ", options: { ...base, bold: true, breakLine: false } }, { text: m[2], options: { breakLine: !last } }];
    return [{ text: it, options: base }];
  }).flat();
  const head = async (s, x, y, w, pal, ic, title, size = 16) => {
    await dot(s, x, y, 0.5, pal, ic);
    T(s, title, { x: x + 0.62, y, w: w - 0.62, h: 0.5, fontSize: size, bold: true, valign: "middle" });
  };
  const content = (title, n, tag, notes) => {
    const s = pres.addSlide({ masterName: "CONTENT" });
    s.addText(title, { placeholder: "title" });
    pill(s, n, tag);
    if (notes) s.addNotes(notes);
    return s;
  };
  const arrow = (s, x1, y1, x2, y2, color = MUTED) =>
    s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
      flipV: y2 < y1, line: { color, width: 1.5, endArrowType: "triangle" } });
  const tbl = (rows, header, fills) => [
    header.map(h => ({ text: h, options: { bold: true, color: INK, fill: { color: fills?.head || P.lav.mid } } })),
    ...rows.map((r, i) => r.map(c => (typeof c === "object" ? c : { text: c, options: { fill: { color: fills?.rows?.[i] || (i % 2 ? "FAF9FE" : WHITE) } } }))),
  ];
  const tblOpts = (o) => ({ fontSize: 11, color: INK, valign: "middle", margin: [3, 6, 3, 6], border: { type: "solid", pt: 0.75, color: LINE }, ...o });

  // ================= 1. TITLE =================
  {
    const s = pres.addSlide({ masterName: "TITLE" });
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: 1.45, w: 5.6, h: 5.6, fill: { color: P.lav.bg }, line: { color: P.lav.bg } });
    s.addShape(pres.shapes.OVAL, { x: 11.2, y: 5.2, w: 2.6, h: 2.6, fill: { color: P.mint.bg }, line: { color: P.mint.bg } });
    s.addShape(pres.shapes.OVAL, { x: -1.1, y: 5.7, w: 3.0, h: 3.0, fill: { color: P.peach.bg }, line: { color: P.peach.bg } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.75, w: 6.6, h: 0.44, rectRadius: 0.22, fill: { color: P.rose.bg }, line: { color: P.rose.bg } });
    T(s, "STAGE 1 · IDEATION  ·  CATEGORY II — DIPLOMA & HIGHER EDUCATION", { x: 0.6, y: 1.75, w: 6.6, h: 0.44, fontSize: 12, bold: true, color: P.rose.deep, align: "center", valign: "middle", charSpacing: 1 });
    T(s, "SAARTHI", { x: 0.6, y: 2.35, w: 7, h: 1.15, fontSize: 66, bold: true, color: INK, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, "Drone-grade, low-latency autonomy for a multi-terrain unmanned ground vehicle", { x: 0.6, y: 3.55, w: 7.0, h: 0.95, fontSize: 22, color: MUTED });
    T(s, [
      { text: "S", options: { bold: true, color: P.lav.deep } }, { text: "elf-reliant " },
      { text: "A", options: { bold: true, color: P.lav.deep } }, { text: "utonomous " },
      { text: "A", options: { bold: true, color: P.lav.deep } }, { text: "ll-terrain " },
      { text: "R", options: { bold: true, color: P.lav.deep } }, { text: "over with " },
      { text: "T", options: { bold: true, color: P.lav.deep } }, { text: "arget & " },
      { text: "H", options: { bold: true, color: P.lav.deep } }, { text: "azard " },
      { text: "I", options: { bold: true, color: P.lav.deep } }, { text: "ntelligence" },
    ], { x: 0.6, y: 4.55, w: 7.2, h: 0.4, fontSize: 15, italic: true, color: MUTED });
    const chips = [["Problem Statement", "NAT-003 · R.A.M.A.N", P.sky, 3.35], ["Challenge Owner", "Delhi Technological University", P.mint, 3.6], ["Team", "SAMAYPUR SHOOTERS", P.butter, 2.9]];
    let cx = 0.6;
    for (const [k, v, pal, w] of chips) {
      card(s, cx, 5.45, w, 0.95, pal.bg);
      T(s, k.toUpperCase(), { x: cx + 0.2, y: 5.55, w: w - 0.4, h: 0.3, fontSize: 10, bold: true, color: pal.deep, charSpacing: 1 });
      T(s, v, { x: cx + 0.2, y: 5.85, w: w - 0.3, h: 0.4, fontSize: 15, bold: true });
      cx += w + 0.2;
    }
    // stylised rover
    s.addShape(pres.shapes.LINE, { x: 8.6, y: 4.75, w: 4.3, h: 0, line: { color: P.lav.mid, width: 2 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.95, y: 3.25, w: 3.3, h: 0.95, rectRadius: 0.18, fill: { color: "A99BF5" }, line: { color: "A99BF5" } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.65, y: 2.35, w: 0.95, h: 0.9, rectRadius: 0.06, fill: { color: P.butter.mid }, line: { color: P.butter.mid } });
    T(s, "5 kg", { x: 9.65, y: 2.35, w: 0.95, h: 0.9, fontSize: 13, bold: true, color: P.butter.deep, align: "center", valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: 11.7, y: 2.2, w: 0.09, h: 1.05, fill: { color: "8EC1F5" }, line: { color: "8EC1F5" } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 11.42, y: 1.9, w: 0.65, h: 0.36, rectRadius: 0.08, fill: { color: "8EC1F5" }, line: { color: "8EC1F5" } });
    s.addShape(pres.shapes.LINE, { x: 9.2, y: 2.55, w: 0, h: 0.7, line: { color: MUTED, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: 9.12, y: 2.45, w: 0.16, h: 0.16, fill: { color: "F29BBE" }, line: { color: "F29BBE" } });
    s.addShape(pres.shapes.LINE, { x: 12.07, y: 1.55, w: 0.95, h: 0.53, flipV: true, line: { color: "FF8A65", width: 2, dashType: "dash" } });
    for (const wx of [9.15, 11.15]) {
      s.addShape(pres.shapes.OVAL, { x: wx, y: 3.85, w: 0.9, h: 0.9, fill: { color: MUTED }, line: { color: MUTED } });
      s.addShape(pres.shapes.OVAL, { x: wx + 0.28, y: 4.13, w: 0.34, h: 0.34, fill: { color: P.lav.bg }, line: { color: P.lav.bg } });
    }
    s.addNotes("Open with the one-line pitch: SAARTHI brings the low-latency engineering of drone autopilots to a ground robot, so one stand-alone UGV can do every R.A.M.A.N task safely. Name the three pillars: drone-grade latency core, edge-AI perception, fail-safe by design.");
  }

  // [name, branch/year, role, palette, icon, short ownership, detailed ownership]
  const MEMBERS = [
    ["Mohammed Adeeb Khan", "B.Tech EE · 3rd year", "Team Lead · Electronics, Power & Safety", P.lav, "FaMicrochip",
      ["Electronics & power", "E-stop safety chain", "Radio links & RTK", "Integration"],
      ["System architecture and integration", "Battery, BMS, motor drivers, harness", "Pixhawk wiring, sensors, laser driver", "ELRS, FPV, RTK and telemetry links", "Wireless + mechanical E-stop chain", "Chassis build and payload cradle"]],
    ["Bhavya Jain", "B.Tech EE · 3rd year", "Perception & Machine Learning", P.rose, "FaBrain",
      ["Datasets", "Lane, sign & light models", "Face matching", "TensorRT on Jetson"],
      ["Datasets, labelling, synthetic data", "Lane and pothole segmentation", "Sign and traffic-light detection", "SCRFD + ArcFace face matching", "TensorRT INT8 deployment on Jetson", "Laser visual servo and aim loop"]],
    ["Ashmit Bindal", "B.Tech IT · 3rd year", "Software · Autonomy, Simulation & Testing", P.mint, "FaCode",
      ["ROS 2 & ArduPilot", "Nav2 planning", "Gazebo twin", "Test logs & docs"],
      ["ROS 2 stack and MAVLink / DDS bridge", "ArduPilot Rover tuning, EKF3", "Nav2, behaviour tree, mission logic", "Gazebo digital twin and replay tests", "Test matrix, run logs, telemetry GCS", "Compliance and PDR documentation"]],
  ];

  // ================= 2. TEAM =================
  {
    const s = content("Team details", 2, "TEAM", "Team as registered (Team ID 709e32c2-c5b4-46bd-b616-c9c892f4ddb9). Jury rubric #4 (team capability) rewards a visibly multidisciplinary team: each of the three members owns clear subsystems.");
    card(s, 0.5, 1.8, 4.6, 4.95, P.lav.bg);
    await head(s, 0.75, 2.0, 4.1, P.lav, "FaUsers", "Team at a glance");
    const kv = [["Team name", "SAMAYPUR SHOOTERS"], ["Category", "II · Diploma & Higher Education"], ["Problem statement", "NAT-003 · R.A.M.A.N"], ["Challenge area", "Defence, Intelligence, Space & National Security"], ["Institution", "Delhi Technological University"], ["Faculty mentor", "Dr. Anamika Chauhan"], ["Team size", "3 members"]];
    let y = 2.7;
    for (const [k, v] of kv) {
      T(s, k.toUpperCase(), { x: 0.8, y, w: 4.1, h: 0.22, fontSize: 10, bold: true, color: P.lav.deep, charSpacing: 1 });
      T(s, v, { x: 0.8, y: y + 0.22, w: 4.1, h: 0.32, fontSize: 14, bold: !v.startsWith("[") });
      y += 0.57;
    }
    for (let i = 0; i < 3; i++) {
      const [n, info, r, pal, ic, own] = MEMBERS[i];
      const yy = 1.8 + i * 1.7;
      card(s, 5.4, yy, 7.4, 1.5, WHITE, { line: { color: pal.mid, width: 1.25 } });
      await dot(s, 5.6, yy + 0.25, 0.6, pal, ic);
      T(s, n, { x: 6.35, y: yy + 0.18, w: 3.6, h: 0.35, fontSize: 15, bold: true });
      T(s, info, { x: 9.9, y: yy + 0.18, w: 2.7, h: 0.35, fontSize: 11, color: MUTED, align: "right" });
      T(s, r, { x: 6.35, y: yy + 0.55, w: 6.25, h: 0.32, fontSize: 12, bold: true, color: pal.deep });
      T(s, own.join("  ·  "), { x: 6.35, y: yy + 0.92, w: 6.25, h: 0.42, fontSize: 11, color: INK });
    }
  }

  // ================= 3. PROBLEM =================
  {
    const s = content("Detailed problem statement", 3, "PROBLEM", "Rubric #1: problem authenticity. State the problem in plain words, then show you read the rulebook closely: every constraint on this slide is quoted from the problem statement.");
    card(s, 0.5, 1.8, 6.0, 2.65, P.peach.bg);
    T(s, "IN PLAIN WORDS", { x: 0.8, y: 2.0, w: 5.4, h: 0.3, fontSize: 11, bold: true, color: P.peach.deep, charSpacing: 1 });
    T(s, "Security and emergency teams still send people into hazardous zones because no single, affordable ground robot can follow a route, obey traffic instructions, dodge hazards, climb rough terrain and identify a target — all on its own.",
      { x: 0.8, y: 2.35, w: 5.45, h: 1.95, fontSize: 17, bold: true, color: INK });
    card(s, 0.5, 4.65, 6.0, 2.1, P.sky.bg);
    T(s, "OBSERVATION CONTEXT", { x: 0.8, y: 4.82, w: 5.4, h: 0.3, fontSize: 11, bold: true, color: P.sky.deep, charSpacing: 1 });
    T(s, bl(["Where: DTU Sports Complex — outdoor, daylight, multi-stage track", "Who is exposed: recon, security and emergency-response personnel", "Today: separate or human-assisted systems for each task (PS §7.3)"], { gap: 6 }),
      { x: 0.8, y: 5.17, w: 5.5, h: 1.45, fontSize: 13 });
    T(s, "One platform must do all of this — with no human in the loop", { x: 6.8, y: 1.8, w: 6.0, h: 0.4, fontSize: 15, bold: true });
    const tasks = [["Lane discipline", "Zero track-boundary departures", P.lav, "FaRoad"], ["Signs & lights", "Identify, interpret and obey", P.rose, "FaTrafficLight"],
      ["Potholes & obstacles", "Detect and avoid, no collision", P.peach, "FaTriangleExclamation"], ["20° ramp & debris", "With the 5 kg payload secured", P.butter, "FaMountain"],
      ["Face match", "Pick the correct printed panel", P.sky, "FaUserCheck"], ["Laser indication", "Eye-safe, ≥ 2.0 s continuous", P.mint, "FaCrosshairs"]];
    for (let i = 0; i < 6; i++) {
      const [t, d, pal, ic] = tasks[i];
      const x = 6.8 + (i % 2) * 3.08, y = 2.3 + Math.floor(i / 2) * 1.2;
      card(s, x, y, 2.95, 1.05, pal.bg);
      await dot(s, x + 0.15, y + 0.22, 0.6, pal, ic);
      T(s, t, { x: x + 0.88, y: y + 0.17, w: 2.0, h: 0.35, fontSize: 14, bold: true });
      T(s, d, { x: x + 0.88, y: y + 0.52, w: 2.0, h: 0.45, fontSize: 11, color: MUTED });
    }
    card(s, 6.8, 5.95, 6.03, 0.8, P.rose.bg);
    T(s, [{ text: "Hard constraints: ", options: { bold: true, color: P.rose.deep } }, { text: "no uplink in the autonomous round · 2–10 km/h · 60–200 × 40–120 cm · wireless E-stop ≥ 150 m · licence-exempt bands only" }],
      { x: 7.0, y: 5.95, w: 5.7, h: 0.8, fontSize: 12, valign: "middle" });
  }

  // ================= 4. EVIDENCE =================
  {
    const s = content("Evidence/data/survey/interviews", 4, "EVIDENCE", "Rubric #1: verified evidence. The middle column turns every rule into a measurable target with margin — juries love numbers. Update the right column with real interview outcomes as you complete them and attach notes/photos as optional supplemental documents.");
    const W = 3.91;
    card(s, 0.5, 1.8, W, 4.6, P.sky.bg);
    await head(s, 0.7, 1.98, W - 0.3, P.sky, "FaFileLines", "What the problem owner reports");
    T(s, bl(["Gap 1: no unified hardware + software architecture for multi-environment operation", "Gap 2: weak sign and traffic-light compliance while holding lanes", "Gap 3: face matching, safe optical indication and hardware safety are rarely integrated", "Baseline: separate or human-assisted systems per task"], { gap: 8 }),
      { x: 0.75, y: 2.7, w: W - 0.45, h: 3.6, fontSize: 13 });
    card(s, 0.5 + W + 0.3, 1.8, W, 4.6, P.lav.bg);
    await head(s, 0.7 + W + 0.3, 1.98, W - 0.3, P.lav, "FaRulerCombined", "Rule → our design target");
    s.addTable(tbl([["Avg. speed 2–10 km/h", "4–6 km/h cruise"], ["E-stop range ≥ 150 m", "≥ 300 m (2×)"], ["Laser hold ≥ 2.0 s", "3.0 s (1.5×)"], ["20° ramp", "Tested to 25°"], ["5 kg payload", "Tested with 8 kg"], ["0 boundary departures", "0 in last 10 mock runs"]], ["Rule (PS)", "Our target"], { head: P.lav.mid }),
      tblOpts({ x: 0.75 + W + 0.3, y: 2.7, w: W - 0.5, colW: [1.75, W - 0.5 - 1.75], rowH: 0.48, fontSize: 12 }));
    const x3 = 0.5 + 2 * (W + 0.3);
    card(s, x3, 1.8, W, 4.6, P.mint.bg);
    await head(s, x3 + 0.2, 1.98, W - 0.3, P.mint, "FaComments", "Primary research (in progress)");
    T(s, bl(["Organiser clarifications: arena dimensions, sign catalogue, panel size", "Campus security staff: patrol pain points and hazards", "Civil-defence volunteers: what a recon robot must report", "Robotics faculty: feasibility review of our 75-day plan"], { gap: 8 }),
      { x: x3 + 0.25, y: 2.7, w: W - 0.45, h: 3.0, fontSize: 13 });
    T(s, "Logged with dates and outcomes on slide 13", { x: x3 + 0.25, y: 5.85, w: W - 0.45, h: 0.35, fontSize: 11, italic: true, color: P.mint.deep });
    T(s, "Source: SEVA FIRST Problem Statement NAT-003 R.A.M.A.N, §5–§12 (Delhi Technological University).", { x: 0.5, y: 6.55, w: 12, h: 0.3, fontSize: 10, color: MUTED });
  }

  // ================= 5. EXISTING SOLUTIONS =================
  {
    const s = content("Existing solutions and limitations", 5, "LANDSCAPE", "Rubric #2: competitive differentiation. Message: every capability exists somewhere — the gap is integration under hard real-time and safety constraints, which is exactly what drone autopilot engineering has solved.");
    const F = "●", H = "◐", O = "○";
    const sym = (v) => ({ text: v, options: { align: "center", fontSize: 16, color: v === F ? P.mint.deep : v === H ? P.peach.deep : "A8A4C0" } });
    const name = (n, l) => ({ text: [{ text: n, options: { bold: true, breakLine: true } }, { text: l, options: { fontSize: 10, color: MUTED } }] });
    const rows = [
      [name("Road-autonomy stacks (Autoware / Apollo-class)", "Heavy compute, HD maps; assume paved roads"), F, F, O, O, F, O],
      [name("Tele-operated tactical UGVs (e.g. DRDO Daksh-class)", "Operator in the loop; video latency limits precision"), O, O, F, O, O, O],
      [name("IGVC-style university rovers", "Lanes + GPS waypoints; no traffic rules or target ID"), F, H, H, O, F, H],
      [name("Open-source GPS rovers (ArduPilot kits)", "Waypoints only; no vision perception"), O, O, H, O, F, F],
      [name("Fixed CCTV face recognition", "Stationary; no mobility or safe indication"), O, O, O, H, F, H],
    ].map(r => r.map((c, i) => (i === 0 ? c : sym(c))));
    const ours = [{ text: [{ text: "SAARTHI (ours)", options: { bold: true, breakLine: true, color: P.mint.deep } }, { text: "All tasks on one stand-alone, fail-safe platform", options: { fontSize: 10, color: MUTED } }] }, ...Array(6).fill(F).map(sym)];
    const all = [["Approach", "Lane & route", "Signs & lights", "Ramp & terrain", "Face-ID + laser", "No human", "Low cost"].map(h => ({ text: h, options: { bold: true, fill: { color: P.lav.mid }, align: h === "Approach" ? "left" : "center" } })),
      ...rows, ours.map(c => ({ ...c, options: { ...(c.options || {}), fill: { color: P.mint.bg } } }))];
    s.addTable(all, tblOpts({ x: 0.5, y: 1.8, w: 12.33, colW: [4.53, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3], rowH: 0.6 }));
    T(s, "●  full     ◐  partial     ○  absent", { x: 0.5, y: 6.1, w: 4, h: 0.3, fontSize: 11, color: MUTED });
    card(s, 4.6, 6.0, 8.23, 0.78, P.butter.bg);
    T(s, [{ text: "Insight: ", options: { bold: true, color: P.butter.deep } }, { text: "the pieces exist — the gap is integrating them under hard real-time and safety limits, which drone autopilots already solve." }],
      { x: 4.8, y: 6.0, w: 7.9, h: 0.78, fontSize: 13, valign: "middle" });
  }

  // ================= 6. PROPOSED SOLUTION =================
  {
    const s = content("Proposed technical solution", 6, "SOLUTION", "The heart of the pitch. Pillar 1 (drone protocols) wins the manual round (30%) through low-latency control and video, and makes autonomy crisp. Pillar 2 (ML) wins the autonomous round (40%). Pillar 3 (safety) gets you through technical inspection — a team that fails inspection scores zero.");
    T(s, "SAARTHI fuses a proven drone autopilot core with an edge-AI perception brain on a rugged 4WD chassis — one stand-alone platform for every R.A.M.A.N task.",
      { x: 0.5, y: 1.75, w: 12.33, h: 0.6, fontSize: 16, color: MUTED });
    const W = 3.91;
    const pillars = [
      [P.sky, "FaGaugeHigh", "1 · Drone-grade core", ["Pixhawk 6C running ArduPilot Rover: 400 Hz control loop, EKF3 sensor fusion", "uXRCE-DDS / MAVLink 2 wired link to the AI computer (< 2 ms)", "ExpressLRS 500 Hz control + 5.8 GHz digital FPV for the manual round", "RTK GNSS (u-blox F9P) for cm-level task waypoints"]],
      [P.lav, "FaBrain", "2 · Edge-AI perception", ["Jetson Orin Nano Super with TensorRT INT8 models", "Lane and pothole segmentation with a classical cross-check", "Sign and traffic-light detector with temporal voting", "SCRFD + ArcFace face matching driving a laser visual servo"]],
      [P.rose, "FaShieldHalved", "3 · Fail-safe by design", ["Hardware E-stop chain that bypasses all software", "433 MHz LoRa heartbeat E-stop: link loss means stop", "Autonomous mode physically disables telemetry receive", "Laser fires only on a depth-verified flat printed panel"]],
    ];
    for (let i = 0; i < 3; i++) {
      const [pal, ic, t, b] = pillars[i];
      const x = 0.5 + i * (W + 0.3);
      card(s, x, 2.45, W, 3.35, pal.bg);
      await head(s, x + 0.22, 2.65, W - 0.4, pal, ic, t, 16);
      T(s, bl(b, { gap: 7 }), { x: x + 0.27, y: 3.35, w: W - 0.5, h: 2.35, fontSize: 13 });
    }
    card(s, 0.5, 6.0, 12.33, 0.78, P.butter.bg);
    T(s, [{ text: "Platform: ", options: { bold: true, color: P.butter.deep } }, { text: "4WD skid-steer · 80 × 60 cm · ~25 kg with payload · 24 V LiFePO4 · independent suspension · 30 cm payload cradle with locating corners and strap" }],
      { x: 0.75, y: 6.0, w: 11.9, h: 0.78, fontSize: 13, valign: "middle" });
  }

  // ================= 7. ARCHITECTURE =================
  {
    const s = content("Conceptual architecture", 7, "ARCHITECTURE", "Walk left to right: sense, think, act. Then point at the bottom row: the safety chain has no software in it. Then the comms column: show how the radio plan makes the autonomous-round rules impossible to break.");
    const col = async (x, w, pal, ic, title, items, ih = 0.5) => {
      card(s, x, 1.8, w, 3.75, pal.bg);
      await head(s, x + 0.15, 1.92, w - 0.25, pal, ic, title, 14);
      let y = 2.55;
      for (const it of items) {
        card(s, x + 0.15, y, w - 0.3, ih, WHITE);
        T(s, it, { x: x + 0.27, y, w: w - 0.5, h: ih, fontSize: 11.5, valign: "middle" });
        y += ih + 0.1;
      }
    };
    await col(0.5, 2.45, P.sky, "FaCamera", "SENSE", ["Wide RGB camera · 60 fps", "Depth camera (stereo)", "2D LiDAR · 360°", "RTK GNSS · u-blox F9P", "IMU + wheel encoders"]);
    await col(3.25, 3.85, P.lav, "FaMicrochip", "THINK · Jetson Orin · ROS 2", ["Perception models (TensorRT INT8)", "World model + fused costmap", "Mission behaviour tree (task FSM)", "Planner: Nav2 + pure pursuit / MPC", "uXRCE-DDS / MAVLink 2 bridge"]);
    await col(7.4, 2.75, P.mint, "FaGears", "ACT · Pixhawk 6C", ["EKF3 fusion · 400 Hz loop", "Skid-steer mixer + PID", "Motor drivers → 4WD", "Laser pan-tilt gimbal", "Pitch-aware torque on ramp"]);
    await col(10.45, 2.38, P.peach, "FaTowerBroadcast", "RADIO PLAN", ["Manual: ELRS 2.4 GHz", "Manual: 5.8 GHz FPV", "Auto: telemetry TX-only", "Auto: RTK RX-only", "E-stop: 433 MHz LoRa"]);
    arrow(s, 2.95, 3.65, 3.25, 3.65); arrow(s, 7.1, 3.65, 7.4, 3.65); arrow(s, 10.15, 3.65, 10.45, 3.65);
    card(s, 0.5, 5.75, 12.33, 1.05, P.rose.bg);
    await dot(s, 0.7, 5.98, 0.6, P.rose, "FaPowerOff");
    T(s, "SAFETY CHAIN\nhardware only", { x: 1.4, y: 5.85, w: 1.6, h: 0.85, fontSize: 11, bold: true, color: P.rose.deep, valign: "middle" });
    const chain = ["Mushroom E-stop on vehicle  +  LoRa E-stop RX (20 Hz heartbeat)", "Latching safety relay", "Main contactor opens + driver brake", "Stop < 0.5 s, no software in path"];
    const cw = [3.0, 1.6, 2.35, 2.0];
    let x = 3.05;
    for (let i = 0; i < 4; i++) {
      card(s, x, 5.92, cw[i], 0.72, WHITE);
      T(s, chain[i], { x: x + 0.1, y: 5.92, w: cw[i] - 0.2, h: 0.72, fontSize: 11, bold: i === 3, align: "center", valign: "middle" });
      if (i < 3) arrow(s, x + cw[i] + 0.02, 6.28, x + cw[i] + 0.2, 6.28, P.rose.deep);
      x += cw[i] + 0.22;
    }
  }

  // ================= 8. WORKING PRINCIPLE =================
  {
    const s = content("Working principle", 8, "HOW IT WORKS", "Rubric #3: engineering soundness. Every ML model has a classical fallback, so a single model failure never ends the run. We never train on the supplied faces: the reference face is enrolled at the start line and discarded after the run (DPDP Act 2023).");
    const steps = [["Self-check", "Sensors, heartbeat, RTK fix", P.lav], ["Lane follow", "Segment → centre-line → pure pursuit", P.sky], ["Signs & lights", "Detect, classify, stop / go", P.rose],
      ["Avoid hazards", "LiDAR + vision costmap, replan", P.peach], ["Ramp & debris", "Pitch-aware torque feed-forward", P.butter], ["Face-ID zone", "GPS trigger, ArcFace match", P.sky], ["Laser & finish", "Visual-servo hold ≥ 3 s, resume", P.mint]];
    const w = 1.6, g = 0.188;
    for (let i = 0; i < 7; i++) {
      const [t, d, pal] = steps[i];
      const x = 0.5 + i * (w + g);
      card(s, x, 1.8, w, 1.55, pal.bg);
      s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: 1.92, w: 0.42, h: 0.42, fill: { color: pal.mid }, line: { color: pal.mid } });
      T(s, String(i + 1), { x: x + 0.12, y: 1.92, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: pal.deep, align: "center", valign: "middle" });
      T(s, t, { x: x + 0.12, y: 2.4, w: w - 0.2, h: 0.3, fontSize: 13, bold: true });
      T(s, d, { x: x + 0.12, y: 2.7, w: w - 0.2, h: 0.6, fontSize: 10.5, color: MUTED });
      if (i < 6) arrow(s, x + w + 0.01, 2.575, x + w + g - 0.01, 2.575);
    }
    T(s, "Edge-ML model stack", { x: 0.5, y: 3.55, w: 6, h: 0.35, fontSize: 15, bold: true });
    const rows = [
      ["Lane + pothole segmentation", "TwinLiteNet-style / YOLOv8n-seg", "Arena replica + synthetic sim renders", "~5 ms", "White-mask + Hough-circle check"],
      ["Road signs & traffic lights", "YOLOv8n detector + colour-state voting", "IDD / GTSRB pre-train → rulebook signs", "~4 ms", "3-of-5 frame vote; default = stop"],
      ["Static obstacles", "LiDAR + depth occupancy grid", "Geometry, no training needed", "~3 ms", "LiDAR-only emergency stop zone"],
      ["Face detect + match", "SCRFD + ArcFace (MobileFaceNet)", "Public pre-trained; reference enrolled live", "~3 ms", "Top-1 vs top-2 margin, else re-approach"],
    ];
    s.addTable(tbl(rows, ["Task", "Model (edge-optimised)", "Training data", "Latency*", "Safety fallback"]),
      tblOpts({ x: 0.5, y: 3.95, w: 12.33, colW: [2.55, 2.95, 3.05, 1.0, 2.78], rowH: 0.48, fontSize: 11.5 }));
    T(s, "*Estimated on Jetson Orin, TensorRT INT8, per frame; to be benchmarked in week 5.", { x: 0.5, y: 6.5, w: 9, h: 0.3, fontSize: 10, color: MUTED });
  }

  // ================= 9. CALCULATIONS =================
  {
    const s = content("Preliminary calculations/simulation", 9, "NUMBERS", "Rubric #3: scientific rigour. The chart is the drone-protocol argument in one picture: ~44 ms perception-to-actuation versus ~150 ms for a typical laptop + Wi-Fi + Arduino stack. At 10 km/h that is 12 cm of travel instead of 42 cm before the vehicle reacts.");
    card(s, 0.5, 1.8, 6.5, 4.4, P.lav.bg);
    const series = [["Camera capture", 33, 16.7], ["AI inference", 40, 8], ["Fusion + planning", 20, 10], ["Link to controller", 30, 2], ["Control loop", 20, 2.5], ["Motor driver", 5, 5]];
    s.addChart(pres.charts.BAR, series.map(([n, a, b]) => ({ name: n, labels: ["Typical hobby stack (est.)", "SAARTHI target"], values: [a, b] })), {
      x: 0.6, y: 1.9, w: 6.3, h: 4.2, barDir: "bar", barGrouping: "stacked",
      chartColors: ["8EC1F5", "A99BF5", "F29BBE", "FFAE8C", "7FD4B0", "F9D673"],
      showTitle: true, title: "Perception-to-actuation latency (ms)", titleFontSize: 13, titleColor: INK, titleFontFace: "+mj-lt",
      showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: INK, legendFontFace: "+mn-lt",
      catAxisLabelColor: INK, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt",
      valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisLabelFontFace: "+mn-lt", valAxisMaxVal: 160,
      valGridLine: { color: "DCD8EE", size: 0.5 }, catGridLine: { style: "none" },
      showValue: false,
      plotArea: { fill: { color: P.lav.bg } },
    });
    T(s, [{ text: "≈ 148 ms → ≈ 44 ms. ", options: { bold: true, color: P.lav.deep } }, { text: "Simulation: Gazebo digital twin of the arena CAD, 500 randomised runs planned." }],
      { x: 0.5, y: 6.3, w: 6.5, h: 0.5, fontSize: 12 });
    const calcs = [
      ["Ramp traction", "F = mg(sin20° + 0.05·cos20°), m = 25 kg", "95 N → ≥ 4.8 N·m per wheel (2× SF)", P.butter],
      ["Tip-over margin", "atan(½ wheelbase / CG height) = atan(0.30 / 0.25)", "50° limit vs 20° ramp", P.mint],
      ["Stopping distance", "v·t_lat + v²/2a at 10 km/h, a = 3 m/s²", "1.4 m vs 4 m sensing range", P.peach],
      ["E-stop link budget", "433 MHz LoRa, 10 dBm, FSPL at 300 m = 75 dB", "≈ 60 dB fade margin", P.rose],
      ["Endurance", "24 V × 20 Ah LiFePO4 = 512 Wh at ~220 W", "≈ 2.3 h vs < 20 min run", P.sky],
      ["Laser aim", "A4 panel at 3 m → ±2.0° window; servo 0.1°", "20× aim margin, 3 s hold", P.lav],
    ];
    for (let i = 0; i < 6; i++) {
      const [t, f, r, pal] = calcs[i];
      const x = 7.3 + (i % 2) * 2.83, y = 1.8 + Math.floor(i / 2) * 1.68;
      card(s, x, y, 2.7, 1.52, pal.bg);
      T(s, t, { x: x + 0.15, y: y + 0.1, w: 2.4, h: 0.3, fontSize: 13, bold: true });
      T(s, f, { x: x + 0.15, y: y + 0.42, w: 2.4, h: 0.55, fontSize: 10, color: MUTED });
      T(s, r, { x: x + 0.15, y: y + 0.97, w: 2.4, h: 0.48, fontSize: 12, bold: true, color: pal.deep });
    }
  }

  // ================= 10. COST =================
  {
    const s = content("Estimated cost", 10, "COST", "Indicative Indian market prices (late 2026), rounded. Every software component is open source, so there are no licence fees. Point out that the RTK pair and the depth camera are the biggest items and both are reusable for future teams.");
    const items = [["Jetson Orin Nano Super (8 GB) dev kit", "Compute", 32000], ["Depth camera + wide RGB camera", "Perception", 38000], ["2D LiDAR (360°)", "Perception", 8000], ["Pixhawk 6C autopilot + GPS mast", "Flight stack", 20000],
      ["RTK GNSS pair (2 × u-blox F9P + antennas)", "Comms", 45000], ["ELRS link + digital FPV + telemetry radio", "Comms", 26000], ["4 × 24 V geared motors + 2 dual drivers", "Drive", 28000], ["24 V 20 Ah LiFePO4 + BMS + charger", "Power", 14000],
      ["Al-6061 chassis, suspension, wheels", "Chassis", 18000], ["Wiring, fuses, IP54 enclosures, 3D prints", "Fabrication", 22000], ["E-stop pair, contactor, Class-2 laser gimbal", "Safety", 11000], ["Contingency (10 %)", "Buffer", 26200]];
    const inr = (n) => "₹ " + n.toLocaleString("en-IN");
    const rows = items.map(([a, b, c]) => [a, b, { text: inr(c), options: { align: "right" } }]);
    rows.push([{ text: "Total (prototype)", options: { bold: true, fill: { color: P.mint.bg } } }, { text: "", options: { fill: { color: P.mint.bg } } }, { text: inr(288200), options: { bold: true, align: "right", fill: { color: P.mint.bg } } }]);
    s.addTable(tbl(rows, ["Item", "Category", "Cost (INR)"]), tblOpts({ x: 0.5, y: 1.8, w: 7.4, colW: [4.4, 1.5, 1.5], rowH: 0.35, fontSize: 11 }));
    s.addChart(pres.charts.DOUGHNUT, [{ name: "Cost share", labels: ["Compute & perception", "Flight stack & comms", "Drive & power", "Chassis & fabrication", "Safety", "Contingency"], values: [78, 91, 42, 40, 11, 26.2] }], {
      x: 8.2, y: 1.75, w: 4.63, h: 3.55, holeSize: 55, chartColors: ["A99BF5", "8EC1F5", "F9D673", "FFAE8C", "F29BBE", "7FD4B0"],
      showTitle: true, title: "Share of budget", titleFontSize: 13, titleColor: INK, titleFontFace: "+mj-lt",
      showLegend: true, legendPos: "r", legendFontSize: 10, legendColor: INK, legendFontFace: "+mn-lt",
      showPercent: true, showValue: false, dataLabelColor: INK, dataLabelFontSize: 9, dataLabelFontFace: "+mn-lt",
    });
    card(s, 8.2, 5.45, 2.2, 1.35, P.lav.bg);
    T(s, "≈ ₹2.9 L", { x: 8.3, y: 5.55, w: 2.0, h: 0.6, fontSize: 28, bold: true, color: P.lav.deep, align: "center" });
    T(s, "total prototype cost", { x: 8.3, y: 6.17, w: 2.0, h: 0.5, fontSize: 11, color: MUTED, align: "center" });
    card(s, 10.6, 5.45, 2.23, 1.35, P.mint.bg);
    T(s, "₹ 0", { x: 10.7, y: 5.55, w: 2.03, h: 0.6, fontSize: 28, bold: true, color: P.mint.deep, align: "center" });
    T(s, "software licence fees (open stack)", { x: 10.7, y: 6.17, w: 2.03, h: 0.5, fontSize: 11, color: MUTED, align: "center" });
  }

  // ================= 11. BENEFICIARIES =================
  {
    const s = content("Expected beneficiaries", 11, "IMPACT", "Rubric #5: beneficiary scale and impact. Lead with the human outcome: zero personnel in the hazard zone. Then cost and scalability. The imported-platform figure is indicative; say so if asked.");
    const stats = [["0", "personnel needed inside the hazard zone during an autonomous recon pass", P.mint], ["< 50 ms", "perception-to-actuation target, ~3× faster than typical hobby stacks (est.)", P.sky],
      ["≈ ₹2.9 L", "prototype cost vs ₹20 L+ for imported research UGV platforms (indicative)", P.lav], ["1 → N", "modular design scales from one prototype to agency fleets", P.peach]];
    for (let i = 0; i < 4; i++) {
      const [n, d, pal] = stats[i];
      const x = 0.5 + i * 3.127;
      card(s, x, 1.8, 2.95, 1.75, pal.bg);
      T(s, n, { x: x + 0.2, y: 1.88, w: 2.6, h: 0.75, fontSize: 34, bold: true, color: pal.deep });
      T(s, d, { x: x + 0.2, y: 2.65, w: 2.6, h: 0.85, fontSize: 11, color: INK });
    }
    card(s, 0.5, 3.8, 4.2, 3.0, P.rose.bg);
    await head(s, 0.7, 3.98, 3.8, P.rose, "FaShieldHalved", "Primary users");
    T(s, "Defence, intelligence and national-security agencies — tactical and reconnaissance teams", { x: 0.75, y: 4.6, w: 3.75, h: 0.75, fontSize: 13, bold: true });
    T(s, bl(["Route recon without exposing soldiers", "Autonomy kit that can be retrofitted to larger platforms"], { gap: 5 }), { x: 0.75, y: 5.4, w: 3.75, h: 1.3, fontSize: 12 });
    const sec = [["Disaster response", "NDRF / SDRF and fire services scouting debris zones", P.peach, "FaHelmetSafety"], ["Police & municipal security", "Campus and perimeter patrols that respect road rules", P.sky, "FaBuildingShield"],
      ["Infrastructure operators", "Solar-farm, rail-yard and pipeline inspection", P.butter, "FaSolarPanel"], ["Robotics researchers & students", "Open, documented stack for Indian teams", P.lav, "FaGraduationCap"]];
    for (let i = 0; i < 4; i++) {
      const [t, d, pal, ic] = sec[i];
      const x = 4.95 + (i % 2) * 4.0, y = 3.8 + Math.floor(i / 2) * 1.55;
      card(s, x, y, 3.88, 1.4, WHITE, { line: { color: pal.mid, width: 1.25 } });
      await dot(s, x + 0.18, y + 0.22, 0.6, pal, ic);
      T(s, t, { x: x + 0.95, y: y + 0.18, w: 2.8, h: 0.35, fontSize: 13, bold: true });
      T(s, d, { x: x + 0.95, y: y + 0.55, w: 2.8, h: 0.75, fontSize: 11, color: MUTED });
    }
  }

  // ================= 12. DEVELOPMENT PLAN =================
  {
    const s = content("Initial development plan", 12, "PLAN", "Sim-first and safety-first. Each gate has a pass/fail exit criterion, which makes progress verifiable by the jury and by the team.");
    const gates = [["G0", "Digital twin", "D1–15", "Arena replica in Gazebo from CAD; v1 models on synthetic data", "Lane-follow in sim, 20 clean runs", P.lav],
      ["G1", "Subsystem bench", "D10–30", "E-stop chain, drive, power and sensors tested on the bench", "Stop < 0.5 s at 300 m E-stop range", P.rose],
      ["G2", "Manual qualification", "D25–40", "ELRS + FPV + GCS; ramp and payload trials", "5 clean manual laps on FPV only", P.sky],
      ["G3", "Autonomy integration", "D36–60", "Lanes, signs, hazards and face-ID running on the vehicle", "Each task ≥ 90 % success in mock arena", P.peach],
      ["G4", "Competition ready", "D56–75", "Full-course mock runs; inspection checklist", "30 full runs, 0 departures in last 10", P.mint]];
    const w = 2.306;
    for (let i = 0; i < 5; i++) {
      const [g, t, d, b, e, pal] = gates[i];
      const x = 0.5 + i * (w + 0.2);
      card(s, x, 1.8, w, 3.9, pal.bg);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.18, y: 1.98, w: 0.7, h: 0.38, rectRadius: 0.19, fill: { color: pal.mid }, line: { color: pal.mid } });
      T(s, g, { x: x + 0.18, y: 1.98, w: 0.7, h: 0.38, fontSize: 13, bold: true, color: pal.deep, align: "center", valign: "middle" });
      T(s, d, { x: x + 0.95, y: 1.98, w: w - 1.1, h: 0.38, fontSize: 11, bold: true, color: pal.deep, valign: "middle" });
      T(s, t, { x: x + 0.18, y: 2.5, w: w - 0.3, h: 0.4, fontSize: 15, bold: true });
      T(s, b, { x: x + 0.18, y: 2.95, w: w - 0.3, h: 1.3, fontSize: 12 });
      card(s, x + 0.13, 4.38, w - 0.26, 1.17, WHITE);
      T(s, [{ text: "EXIT CRITERION", options: { bold: true, fontSize: 9, color: pal.deep, breakLine: true, charSpacing: 1 } }, { text: e, options: { fontSize: 11.5, bold: true } }], { x: x + 0.25, y: 4.45, w: w - 0.5, h: 1.0 });
      if (i < 4) arrow(s, x + w + 0.02, 3.75, x + w + 0.18, 3.75);
    }
    card(s, 0.5, 5.95, 12.33, 0.85, P.butter.bg);
    T(s, [{ text: "Principles: ", options: { bold: true, color: P.butter.deep } }, { text: "simulate first · build the E-stop before the motors spin · every feature gets a pass/fail metric · weekly full-integration run with logged telemetry" }],
      { x: 0.75, y: 5.95, w: 11.9, h: 0.85, fontSize: 13, valign: "middle" });
  }

  // ================= 13. USER INTERACTION =================
  {
    const s = content("Evidence of user/problem interaction", 13, "VALIDATION", "Replace 'Planned' with the date and the key insight as each interaction happens. Real dates and quotes score far higher on rubric #1 than any amount of desk research.");
    const rows = [["1", "DTU UGV technical panel", "Clarification query", "Arena dimensions, sign catalogue, face-panel size", "Planned"],
      ["2", "Campus security supervisors", "On-site interview", "Patrol routes, hazards, what a robot must report", "Planned"],
      ["3", "Civil-defence / NDRF volunteer", "Phone interview", "Recon needs in debris and restricted zones", "Planned"],
      ["4", "Robotics faculty mentor", "Design review", "Feasibility of the 75-day plan and budget", "Planned"],
      ["5", "Mock-arena field trial", "Field test", "Lane and sign detection in Delhi daylight glare", "Planned"]];
    const status = (r) => r.map((c, i) => (i === 4 ? { text: c, options: { bold: true, color: P.peach.deep, align: "center" } } : c));
    s.addTable(tbl(rows.map(status), ["#", "Stakeholder", "Mode", "What we validate", "Status"]), tblOpts({ x: 0.5, y: 1.8, w: 8.3, colW: [0.4, 2.3, 1.6, 3.0, 1.0], rowH: 0.62, fontSize: 12 }));
    card(s, 9.1, 1.8, 3.73, 4.95, P.mint.bg);
    await head(s, 9.3, 1.98, 3.4, P.mint, "FaCameraRetro", "How we record it");
    T(s, bl(["Dated interview notes with name and role (with consent)", "Field photos and short videos of trials", "Run logs with telemetry for every test", "Survey form for security and response staff"], { gap: 8 }),
      { x: 9.35, y: 2.7, w: 3.3, h: 2.6, fontSize: 13 });
    T(s, "Attached as optional supplemental documents (Points 3 and 5).", { x: 9.35, y: 5.6, w: 3.3, h: 0.9, fontSize: 11, italic: true, color: P.mint.deep });
    card(s, 0.5, 5.75, 8.3, 1.0, P.lav.bg);
    T(s, [{ text: "Already done: ", options: { bold: true, color: P.lav.deep } }, { text: "close reading of the NAT-003 problem statement, turned into the measurable targets on slide 4." }],
      { x: 0.75, y: 5.75, w: 7.9, h: 1.0, fontSize: 13, valign: "middle" });
  }

  // ================= 14. 75-DAY PLAN =================
  {
    const s = content("75-day work plan", 14, "TIMELINE", "Rubric #6: realism of the 75-day plan. Manual-ready at D40 leaves 35 days for autonomy. Safety work starts on day 10 so the vehicle never moves without a working E-stop. The final week is a buffer.");
    const X0 = 3.95, X1 = 12.83, D = (X1 - X0) / 75;
    const dx = (d) => X0 + d * D;
    for (const d of [0, 15, 30, 45, 60, 75]) {
      s.addShape(pres.shapes.LINE, { x: dx(d), y: 2.15, w: 0, h: 4.35, line: { color: LINE, width: 0.75, dashType: "dash" } });
      T(s, "D" + d, { x: dx(d) - 0.3, y: 1.8, w: 0.6, h: 0.3, fontSize: 11, bold: true, color: MUTED, align: "center" });
    }
    const rows = [["Design freeze & procurement", 1, 10, P.butter], ["Digital twin & synthetic data", 1, 15, P.lav], ["Chassis fabrication & wiring", 8, 25, P.butter], ["E-stop & safety chain", 10, 22, P.rose],
      ["Model training & TensorRT", 12, 38, P.lav], ["Manual mode: ELRS, FPV, ramp", 25, 40, P.sky], ["Autonomy: lanes, signs, hazards", 36, 58, P.lav], ["Face-ID + laser gimbal", 42, 60, P.peach],
      ["Full-course mock runs & tuning", 56, 72, P.mint], ["Inspection prep, docs, buffer", 68, 75, P.mint]];
    rows.forEach(([t, a, b, pal], i) => {
      const y = 2.2 + i * 0.43;
      T(s, t, { x: 0.5, y, w: 3.35, h: 0.32, fontSize: 12, valign: "middle" });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: dx(a - 1), y: y + 0.02, w: (b - a + 1) * D, h: 0.28, rectRadius: 0.14, fill: { color: pal.mid }, line: { color: pal.mid } });
    });
    const ms = [[40, "Manual-ready"], [60, "Autonomy feature-complete"], [75, "Competition"]];
    for (const [d, t] of ms) {
      s.addShape(pres.shapes.DIAMOND, { x: dx(d) - 0.12, y: 6.55, w: 0.24, h: 0.24, fill: { color: P.rose.deep }, line: { color: P.rose.deep } });
    }
    T(s, "◆ D40 manual-ready   ◆ D60 autonomy feature-complete   ◆ D75 competition-ready", { x: 0.5, y: 6.55, w: 6.5, h: 0.3, fontSize: 11, bold: true, color: P.rose.deep });
  }

  // ================= 15. TEAM ROLES =================
  {
    const s = content("Team composition and roles", 15, "TEAM", "Rubric #4: multidisciplinary capability. Three members, three clear domains: electronics and safety, perception and ML, and autonomy software, with the team lead owning the interfaces between them. Faculty mentor: Dr. Anamika Chauhan, DTU.");
    for (let i = 0; i < 3; i++) {
      const [n, info, r, pal, ic, , b] = MEMBERS[i];
      const x = 0.5 + i * 4.21, y = 1.8;
      card(s, x, y, 3.91, 4.6, pal.bg);
      await dot(s, x + 0.2, y + 0.2, 0.6, pal, ic);
      T(s, n, { x: x + 0.95, y: y + 0.15, w: 2.85, h: 0.4, fontSize: 15, bold: true, valign: "middle" });
      T(s, info, { x: x + 0.95, y: y + 0.52, w: 2.85, h: 0.28, fontSize: 11, color: MUTED });
      T(s, r, { x: x + 0.25, y: y + 1.0, w: 3.5, h: 0.6, fontSize: 13, bold: true, color: pal.deep });
      T(s, bl(b, { gap: 6 }), { x: x + 0.25, y: y + 1.65, w: 3.5, h: 2.8, fontSize: 12 });
    }
    T(s, "Faculty mentor: Dr. Anamika Chauhan · Delhi Technological University", { x: 0.5, y: 6.5, w: 12.3, h: 0.3, fontSize: 12, bold: true, color: P.lav.deep });
  }

  // ================= 16. RESOURCES =================
  {
    const s = content("Resource/facility requirements", 16, "RESOURCES", "Rubric #4: lab resources. The right-most column lists what we need from the organisers; asking for it early also counts as problem interaction.");
    const cols = [["Hardware (on vehicle)", P.sky, "FaMicrochip", ["Jetson Orin Nano Super", "Pixhawk 6C autopilot", "2 × u-blox F9P RTK GNSS", "Depth + RGB camera, 2D LiDAR", "ELRS + digital FPV kit", "433 MHz LoRa E-stop pair"]],
      ["Software (all open source)", P.lav, "FaCode", ["ROS 2 Humble + Nav2", "ArduPilot Rover, MAVLink 2", "Gazebo / Isaac Sim", "PyTorch → TensorRT", "InsightFace (ArcFace, SCRFD)", "Mission Planner / QGC as GCS"]],
      ["Facilities", P.butter, "FaIndustry", ["Mechanical workshop", "3D printing and laser cutting", "Electronics bench and soldering", "Open ground ≥ 300 m for E-stop tests", "GPU workstation for training"]],
      ["Requested from organisers", P.mint, "FaHandshake", ["Arena CAD and track dimensions", "Road-sign and traffic-light catalogue", "Face-panel size and gallery format", "Base-station power and GCS specification"]]];
    const w = 2.9;
    for (let i = 0; i < 4; i++) {
      const [t, pal, ic, b] = cols[i];
      const x = 0.5 + i * (w + 0.243);
      card(s, x, 1.8, w, 4.95, pal.bg);
      await dot(s, x + 0.2, 2.0, 0.6, pal, ic);
      T(s, t, { x: x + 0.2, y: 2.72, w: w - 0.35, h: 0.4, fontSize: 15, bold: true });
      T(s, bl(b, { gap: 8 }), { x: x + 0.22, y: 3.25, w: w - 0.4, h: 3.35, fontSize: 13 });
    }
  }

  // ================= 17. TRL =================
  {
    const s = content("Entry and Target TRL, if any", 17, "TRL", "Entry TRL 3 is honest: each critical function is proven separately, but not yet together on our vehicle. Target TRL 6: full system prototype demonstrated in a relevant environment (the DTU arena).");
    for (let i = 0; i < 9; i++) {
      const h = 0.45 + i * 0.42, x = 0.5 + i * 0.82, y = 6.3 - h;
      const fill = i === 2 ? P.peach.mid : i === 5 ? P.mint.mid : (i === 3 || i === 4) ? P.lav.mid : "F1EFF8";
      card(s, x, y, 0.72, h, fill);
      T(s, String(i + 1), { x, y: y + 0.08, w: 0.72, h: 0.35, fontSize: 16, bold: true, align: "center", color: i === 2 ? P.peach.deep : i === 5 ? P.mint.deep : i < 6 ? P.lav.deep : "A8A4C0" });
    }
    T(s, "Technology Readiness Level", { x: 0.5, y: 6.4, w: 7.3, h: 0.3, fontSize: 11, color: MUTED, align: "center" });
    T(s, "ENTRY", { x: 2.14, y: 4.3, w: 0.72, h: 0.3, fontSize: 10, bold: true, color: P.peach.deep, align: "center" });
    T(s, "TARGET", { x: 4.5, y: 3.05, w: 1.0, h: 0.3, fontSize: 10, bold: true, color: P.mint.deep, align: "center" });
    const cards = [[P.peach, "Entry · TRL 3", "Proof of concept: each critical function — lane segmentation, ArcFace matching, ArduPilot Rover control, LoRa E-stop — is proven on its own in literature and open-source projects."],
      [P.lav, "Climb · TRL 4 → 5", "TRL 4 by D30: subsystems integrated on the bench. TRL 5 by D60: full vehicle validated in our mock arena."],
      [P.mint, "Target · TRL 6", "System prototype demonstrated in a relevant environment: the complete UGV running the DTU multi-environment track autonomously."]];
    for (let i = 0; i < 3; i++) {
      const [pal, t, d] = cards[i];
      const y = 1.8 + i * 1.68;
      card(s, 8.1, y, 4.73, 1.5, pal.bg);
      T(s, t, { x: 8.3, y: y + 0.12, w: 4.35, h: 0.35, fontSize: 15, bold: true, color: pal.deep });
      T(s, d, { x: 8.3, y: y + 0.5, w: 4.35, h: 0.95, fontSize: 12 });
    }
  }

  // ================= 18. TECHNICAL DRAWINGS =================
  {
    const s = content("Technical drawings/calculations/simulation", 18, "DRAWINGS", "Schematic only; full CAD goes in the optional supplemental archive. Dimensions sit comfortably inside the 60–200 × 40–120 cm envelope.");
    card(s, 0.5, 1.8, 7.6, 4.95, "FAF9FE", { line: { color: LINE, width: 1 } });
    T(s, "SIDE VIEW", { x: 0.95, y: 1.92, w: 2, h: 0.25, fontSize: 10, bold: true, color: MUTED, charSpacing: 1 });
    T(s, "TOP VIEW", { x: 5.25, y: 1.92, w: 2, h: 0.25, fontSize: 10, bold: true, color: MUTED, charSpacing: 1 });
    // side view (scale 0.04 in/cm), ground at y=4.6
    const G = 4.6;
    s.addShape(pres.shapes.LINE, { x: 0.7, y: G, w: 4.0, h: 0, line: { color: MUTED, width: 1 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: G - 1.08, w: 3.2, h: 0.4, rectRadius: 0.06, fill: { color: "A99BF5" }, line: { color: P.lav.deep, width: 0.75 } });
    for (const cx of [1.5, 3.5]) {
      s.addShape(pres.shapes.OVAL, { x: cx - 0.4, y: G - 0.8, w: 0.8, h: 0.8, fill: { color: MUTED }, line: { color: INK, width: 0.75 } });
      s.addShape(pres.shapes.OVAL, { x: cx - 0.13, y: G - 0.53, w: 0.26, h: 0.26, fill: { color: P.lav.bg }, line: { color: P.lav.bg } });
    }
    s.addShape(pres.shapes.RECTANGLE, { x: 1.7, y: G - 2.28, w: 1.2, h: 1.2, fill: { color: P.butter.mid }, line: { color: P.butter.deep, width: 0.75 } });
    T(s, "Payload\n30 cm · 5 kg", { x: 1.7, y: G - 2.28, w: 1.2, h: 1.2, fontSize: 10, bold: true, align: "center", valign: "middle", color: P.butter.deep });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.75, y: G - 2.35, w: 0.07, h: 1.27, fill: { color: "8EC1F5" }, line: { color: P.sky.deep, width: 0.5 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.55, y: G - 2.6, w: 0.5, h: 0.26, rectRadius: 0.05, fill: { color: "8EC1F5" }, line: { color: P.sky.deep, width: 0.5 } });
    T(s, "Camera + LiDAR\nmast", { x: 4.12, y: G - 2.65, w: 1.0, h: 0.45, fontSize: 9, color: P.sky.deep });
    s.addShape(pres.shapes.LINE, { x: 0.9, y: G + 0.2, w: 3.2, h: 0, line: { color: INK, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } });
    T(s, "800 mm", { x: 2.0, y: G + 0.25, w: 1.0, h: 0.25, fontSize: 10, bold: true, align: "center" });
    s.addShape(pres.shapes.LINE, { x: 0.75, y: G - 2.6, w: 0, h: 2.6, line: { color: INK, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } });
    T(s, "~650 mm", { x: 0.82, y: G - 1.7, w: 0.8, h: 0.25, fontSize: 10, bold: true });
    // ramp
    s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: 0.9, y: 5.55, w: 2.0, h: 0.73, flipH: true, fill: { color: P.peach.mid }, line: { color: P.peach.deep, width: 0.75 } });
    T(s, "20°", { x: 1.0, y: 6.0, w: 0.5, h: 0.25, fontSize: 10, bold: true, color: P.peach.deep });
    T(s, "Ramp: 95 N tractive force,\n≥ 4.8 N·m per wheel (2× SF)", { x: 3.05, y: 5.6, w: 2.0, h: 0.6, fontSize: 10, color: P.peach.deep });
    // top view
    const tx = 5.4, ty = 2.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tx + 0.32, y: ty, w: 1.76, h: 3.2, rectRadius: 0.08, fill: { color: "A99BF5" }, line: { color: P.lav.deep, width: 0.75 } });
    for (const [wx, wy] of [[tx, ty + 0.25], [tx + 2.08, ty + 0.25], [tx, ty + 2.15], [tx + 2.08, ty + 2.15]])
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: wx, y: wy, w: 0.32, h: 0.8, rectRadius: 0.05, fill: { color: MUTED }, line: { color: INK, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: tx + 0.6, y: ty + 1.2, w: 1.2, h: 1.2, fill: { color: P.butter.mid }, line: { color: P.butter.deep, width: 0.75 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tx + 0.95, y: ty + 0.15, w: 0.5, h: 0.26, rectRadius: 0.05, fill: { color: "8EC1F5" }, line: { color: P.sky.deep, width: 0.5 } });
    T(s, "FRONT ▲", { x: tx + 0.7, y: ty + 0.5, w: 1.0, h: 0.25, fontSize: 9, bold: true, align: "center", color: WHITE });
    s.addShape(pres.shapes.LINE, { x: tx, y: ty + 3.4, w: 2.4, h: 0, line: { color: INK, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } });
    T(s, "600 mm", { x: tx + 0.7, y: ty + 3.45, w: 1.0, h: 0.25, fontSize: 10, bold: true, align: "center" });
    T(s, "Schematic, not to final scale. Full CAD in the supplemental archive.", { x: 5.2, y: 6.35, w: 2.8, h: 0.35, fontSize: 9, italic: true, color: MUTED });
    const spec = [["Overall L × W × H", "800 × 600 × ~650 mm"], ["Mass with payload", "~25 kg"], ["Drive", "4WD skid-steer, 4 × 24 V geared motors"], ["Wheels", "200 mm, independent swing-arm suspension"],
      ["Speed", "4–6 km/h cruise, firmware cap 9.5 km/h"], ["Battery", "24 V 20 Ah LiFePO4 (512 Wh), BMS + fuse"], ["Compute", "Jetson Orin Nano Super + Pixhawk 6C"], ["Ground clearance", "≥ 80 mm for debris"], ["Payload cradle", "Printed corner locators + ratchet strap"]];
    s.addTable(tbl(spec, ["Parameter", "Design value"]), tblOpts({ x: 8.4, y: 1.8, w: 4.43, colW: [1.6, 2.83], rowH: 0.49, fontSize: 11 }));
  }

  // ================= 19. LITERATURE =================
  {
    const s = content("Literature/patent survey", 19, "PRIOR ART", "Each row ends with how we use the work, which shows the jury we are building on proven science rather than reinventing it.");
    const rows = [["Redmon et al., CVPR 2016; Ultralytics YOLOv8, 2023", "Single-stage real-time object detection", "Sign and traffic-light detector"],
      ["Che et al., 2023 — TwinLiteNet", "Tiny drivable-area and lane segmentation", "Lane and pothole mask on Jetson"],
      ["Deng et al., CVPR 2019 — ArcFace", "Angular-margin face embeddings", "1-to-N printed-panel matching"],
      ["Guo et al., 2021 — SCRFD", "Efficient face detection", "Locating faces on panels"],
      ["Macenski et al., IROS 2020 — Nav2", "Behaviour-tree navigation, costmaps", "Planner and mission tree"],
      ["Varma et al., WACV 2019 — IDD", "Indian unstructured driving dataset", "Pre-training for Indian signs"],
      ["ArduPilot, MAVLink 2, ExpressLRS", "Drone autopilot and low-latency RC link", "Drone-grade control core"],
      ["IGVC rules and design reports", "UGV lanes, obstacles and GPS benchmark", "Test methodology"]];
    s.addTable(tbl(rows, ["Work", "Key idea", "How SAARTHI uses it"]), tblOpts({ x: 0.5, y: 1.8, w: 12.33, colW: [4.6, 4.0, 3.73], rowH: 0.47, fontSize: 12 }));
    card(s, 0.5, 6.15, 12.33, 0.65, P.rose.bg);
    T(s, [{ text: "Patent search plan: ", options: { bold: true, color: P.rose.deep } }, { text: "InPASS (Indian Patent Office) + Google Patents for combined UGV traffic-compliance, face matching and safe laser designation; focus on our interlock claims (slide 21)." }],
      { x: 0.75, y: 6.15, w: 11.9, h: 0.65, fontSize: 12, valign: "middle" });
  }

  // ================= 20. LAB ACCESS =================
  {
    const s = content("Laboratory/fabrication access", 20, "LAB ACCESS", "Confirm each source with your institute before submission and replace 'To confirm' with 'Available'.");
    const fac = [["Mechanical workshop", "Chassis cutting, drilling, welding", "Institute workshop", P.butter, "FaWrench"], ["3D printing & laser cutting", "Brackets, payload locators, sensor mounts", "Institute makerspace / local vendor", P.lav, "FaCube"],
      ["Electronics lab", "Harnessing, soldering, power testing", "Institute electronics lab", P.sky, "FaBolt"], ["CNC & sheet metal", "Aluminium plates and brackets", "Fabrication vendors, Delhi NCR", P.peach, "FaIndustry"],
      ["Open test ground", "E-stop range, speed and ramp trials", "Institute sports ground", P.mint, "FaFlagCheckered"], ["GPU compute", "Model training and simulation (never on-vehicle)", "Team workstation / cloud GPU", P.rose, "FaServer"]];
    for (let i = 0; i < 6; i++) {
      const [t, u, src, pal, ic] = fac[i];
      const x = 0.5 + (i % 3) * 4.21, y = 1.8 + Math.floor(i / 3) * 2.55;
      card(s, x, y, 3.91, 2.35, pal.bg);
      await dot(s, x + 0.2, y + 0.2, 0.6, pal, ic);
      T(s, t, { x: x + 0.95, y: y + 0.2, w: 2.85, h: 0.55, fontSize: 15, bold: true, valign: "middle" });
      T(s, u, { x: x + 0.25, y: y + 0.95, w: 3.45, h: 0.6, fontSize: 12 });
      T(s, [{ text: "Source: ", options: { bold: true } }, { text: src }], { x: x + 0.25, y: y + 1.55, w: 2.5, h: 0.6, fontSize: 11, color: MUTED });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 2.75, y: y + 1.75, w: 1.0, h: 0.32, rectRadius: 0.16, fill: { color: WHITE }, line: { color: pal.mid } });
      T(s, "To confirm", { x: x + 2.75, y: y + 1.75, w: 1.0, h: 0.32, fontSize: 9, bold: true, color: pal.deep, align: "center", valign: "middle" });
    }
  }

  // ================= 21. NOVELTY =================
  {
    const s = content("Novelty and IPR potential", 21, "NOVELTY", "Rubric #2. The laser interlock is both the strongest IPR angle and the strongest ethics answer: the system physically cannot illuminate a live person.");
    const nov = [["Drone-grade latency core on a UGV", "Autopilot + DDS + ELRS + digital FPV: < 50 ms autonomy loop and < 40 ms manual control-to-wheel.", P.sky, "FaGaugeHigh"],
      ["Compliance-by-design radio", "A physical switch disables telemetry receive when autonomy is armed; one-way telemetry is enforced in hardware and checkable at inspection.", P.lav, "FaTowerBroadcast"],
      ["Depth-verified laser interlock", "Laser enables only on face match AND flat printed surface (depth) AND inside the face-task geofence.", P.rose, "FaCrosshairs"],
      ["Heartbeat fail-safe E-stop", "Independent 433 MHz LoRa link; 200 ms of silence means stop. No software in the path.", P.peach, "FaPowerOff"]];
    for (let i = 0; i < 4; i++) {
      const [t, d, pal, ic] = nov[i];
      const x = 0.5 + (i % 2) * 4.05, y = 1.8 + Math.floor(i / 2) * 2.55;
      card(s, x, y, 3.85, 2.35, pal.bg);
      await dot(s, x + 0.2, y + 0.2, 0.6, pal, ic);
      T(s, t, { x: x + 0.95, y: y + 0.2, w: 2.8, h: 0.6, fontSize: 14, bold: true, valign: "middle" });
      T(s, d, { x: x + 0.25, y: y + 0.95, w: 3.4, h: 1.3, fontSize: 12 });
    }
    card(s, 8.75, 1.8, 4.08, 4.9, P.mint.bg);
    await head(s, 8.95, 2.0, 3.7, P.mint, "FaScaleBalanced", "IPR strategy");
    T(s, bl(["Provisional patent: depth-verified safe optical designation method", "Design registration: modular payload cradle and sensor bay", "Copyright: SAARTHI integration software (open core)", "Publication: benchmark paper after the event"], { gap: 9 }),
      { x: 9.0, y: 2.7, w: 3.65, h: 3.9, fontSize: 13 });
  }

  // ================= 22. REFERENCES =================
  {
    const s = content("References", 22, "REFERENCES", "Thank the jury and invite questions.");
    const refs = ["SEVA FIRST Problem Statement NAT-003 R.A.M.A.N, Delhi Technological University, 2026.", "DoT / WPC Wing, Govt. of India — licence-exempt frequency band notifications.", "The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023).", "IEC 60825-1 — Safety of laser products.", "ISO 13850 — Safety of machinery: emergency stop function.", "J. Redmon et al., \"You Only Look Once: Unified, Real-Time Object Detection,\" CVPR 2016.", "J. Deng et al., \"ArcFace: Additive Angular Margin Loss for Deep Face Recognition,\" CVPR 2019.", "J. Guo et al., \"Sample and Computation Redistribution for Efficient Face Detection\" (SCRFD), 2021.",
      "Q.-H. Che et al., \"TwinLiteNet: An Efficient and Lightweight Model for Driveable Area and Lane Segmentation,\" 2023.", "S. Macenski et al., \"The Marathon 2: A Navigation System,\" IROS 2020.", "S. Macenski et al., \"Robot Operating System 2: Design, Architecture, and Uses in the Wild,\" Science Robotics, 2022.", "G. Varma et al., \"IDD: A Dataset for Exploring Problems of Autonomous Navigation in Unconstrained Environments,\" WACV 2019.", "ArduPilot Rover documentation; MAVLink 2 protocol specification.", "ExpressLRS open-source RC link documentation.", "Intelligent Ground Vehicle Competition (IGVC) official rules.", "u-blox ZED-F9P integration manual (RTK GNSS)."];
    const half = 8;
    const mk = (arr, off) => arr.map((r, i) => ({ text: r, options: { bullet: { type: "number", numberStartAt: off + 1 }, paraSpaceAfter: 6, breakLine: i < arr.length - 1 } }));
    card(s, 0.5, 1.8, 6.0, 4.95, P.lav.bg);
    card(s, 6.83, 1.8, 6.0, 4.95, P.sky.bg);
    T(s, mk(refs.slice(0, half), 0), { x: 0.75, y: 2.0, w: 5.55, h: 4.6, fontSize: 12 });
    T(s, mk(refs.slice(half), half), { x: 7.08, y: 2.0, w: 5.55, h: 4.6, fontSize: 12 });
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });

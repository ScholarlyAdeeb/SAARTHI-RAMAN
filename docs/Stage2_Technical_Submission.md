# SAARTHI — Screen-2 form answers (copy-paste ready)

Team SAMAYPUR SHOOTERS · NAT-003 R.A.M.A.N · Delhi Technological University
Every number below matches the Stage 1 deck and the pitch video.

---

## 1. Explanation of Proposed Solution

SAARTHI (Self-reliant Autonomous All-terrain Rover with Target & Hazard Intelligence) is a 4WD electric unmanned ground vehicle that does every R.A.M.A.N task on one stand-alone platform: lane following, road-sign and traffic-light compliance, pothole and obstacle avoidance, a 20° ramp and debris with a 5 kg payload, face matching against printed panels, and an eye-safe laser indication held for at least 2 s.

Core idea: we put a proven drone autopilot core and an edge-AI computer on a rugged ground chassis. The design rests on three pillars:

1) Drone-grade control core
- Pixhawk 6C running ArduPilot Rover: 400 Hz control loop with EKF3 sensor fusion of IMU, wheel encoders and RTK GNSS.
- Link to the AI computer: wired MAVLink 2 / uXRCE-DDS, under 2 ms.
- Manual round: ExpressLRS 2.4 GHz at 500 Hz plus 5.8 GHz digital FPV, for low-latency driving.
- Positioning: RTK GNSS (u-blox F9P pair) for cm-level task waypoints.

2) Edge-AI perception (Jetson Orin Nano Super, ROS 2, TensorRT INT8)
- Lanes and potholes: TwinLiteNet / YOLOv8n-seg segmentation, then centre-line extraction, then pure-pursuit steering. A white-mask and Hough-circle check runs alongside as a classical cross-check.
- Signs and traffic lights: YOLOv8n detector plus colour-state classification, with a 3-of-5 frame vote (the default action is stop).
- Obstacles: a LiDAR and depth-camera occupancy grid feeds the Nav2 costmap, and the planner replans around hazards.
- Face task: SCRFD finds faces, and ArcFace matches them 1-to-N against the reference enrolled at the start line. The laser pan-tilt gimbal is then visual-servoed and held for 3 s.

3) Fail-safe by design
- E-stop: a mushroom E-stop on the vehicle plus a 433 MHz LoRa heartbeat E-stop (20 Hz). Both drive a latching safety relay and the main contactor, with no software in the path. The vehicle stops in under 0.5 s, and 200 ms of radio silence counts as a stop.
- Radio rule enforcement: when autonomy is armed, a physical switch disables telemetry receive. Only the E-stop, RTK corrections and one-way telemetry stay on air, as the rules require.
- Laser interlock: the laser fires only when three conditions all hold: a face match, a depth-verified flat printed panel, and the vehicle being inside the face-task geofence.

Inputs:
- Wide RGB camera (60 fps), stereo depth camera, 360° 2D LiDAR, RTK GNSS, IMU and wheel encoders.
- In the manual round, ELRS operator commands.

Outputs:
- Skid-steer wheel commands.
- Laser gimbal pan and tilt.
- One-way telemetry and logs.

Workflow, one mission run:
1) Self-check: sensors, E-stop heartbeat and RTK fix.
2) Lane follow.
3) Detect signs and lights, then stop or go.
4) Detect and avoid potholes and obstacles.
5) Ramp and debris, with pitch-aware torque feed-forward.
6) An RTK geofence triggers the face-ID zone, followed by the ArcFace match.
7) Laser hold of 3 s or more, then resume and finish.

Mission logic is a ROS 2 behaviour tree. Nav2 plans the route, and ArduPilot executes low-level control.

Estimated perception-to-wheels latency is about 44 ms, against about 148 ms for a typical laptop + Wi-Fi + Arduino stack. At 10 km/h that is about 12 cm of travel before the vehicle reacts, instead of about 41 cm.

Platform:
- 4WD skid-steer, 80 × 60 cm, ~25 kg with payload.
- 24 V 20 Ah LiFePO4 battery and independent suspension.
- 30 cm payload cradle with locating corners and a ratchet strap.

---

## 2. Early Prototype / Working Model / Software Demo

Prototype Status: do NOT select "Working Benchtop Prototype"; no hardware has been built yet. Choose the closest honest option, e.g. "Concept / Design Stage", "Simulation / Digital Twin", or "Not yet available".

Live Demo / Repository URL: leave blank unless you create one. If you do, a GitHub repo containing the architecture docs, the BOM sheet and the ROS 2 package skeleton is a quick, honest option. You can also put the pitch video link here.

Demo Key Highlights:
Design stage · targets: ~44 ms perception-to-wheels latency (est.) · E-stop stop < 0.5 s at 300 m · laser hold 3.0 s · TRL 3 → 6 in 75 days

---

## 3. Drawings / Design Sketches

Design schematics, side and top views. They are in the Stage 1 deck (slide 18) and the pitch video (chapter 3).

- Overall size: 800 × 600 × ~650 mm (L × W × H), inside the 60–200 × 40–120 cm envelope.
- Mass: ~25 kg with payload.
- Drive: 4WD skid-steer, 4 × 24 V geared motors and 2 dual motor drivers.
- Wheels: 200 mm, with independent swing-arm suspension and ≥ 80 mm ground clearance for debris.
- Payload: a 30 cm cradle for the 5 kg payload, with 3D-printed corner locators and a ratchet strap.
- Sensor mast: front camera and LiDAR mast; Pixhawk GPS mast.
- Enclosures: IP54 for the Jetson, Pixhawk and power electronics.
- Battery: 24 V 20 Ah LiFePO4 (512 Wh) with BMS and main fuse.
- Electrical schematic: battery → BMS → fuse → main contactor (driven by the latching safety relay, i.e. the E-stop chain) → motor drivers. A separate regulated branch feeds the Jetson and Pixhawk.
- Software block diagram: Sense (camera, depth, LiDAR, RTK, IMU) → Think (Jetson, ROS 2: perception, costmap, behaviour tree, Nav2) → Act (Pixhawk: EKF3, skid-steer mixer, motor drivers, laser gimbal).

Full CAD will be modelled during the design-freeze phase (days 1–10). The current drawings are schematic, not to final scale.

CAD link: leave blank until a model exists, or link the Stage 1 PDF on Drive.

---

## 4. Calculations / Simulation

1) Ramp traction
F = mg(sin 20° + 0.05·cos 20°), m = 25 kg → 95 N. That needs about 4.8 N·m per wheel with a 2× safety factor (200 mm wheels).

2) Tip-over margin
atan(½ wheelbase / CG height) = atan(0.30 / 0.25) ≈ 50° limit, against a 20° ramp.

3) Stopping distance at 10 km/h
v·t_lat + v²/2a, with a = 3 m/s² → about 1.4 m, against a 4 m sensing range.

4) E-stop link budget
433 MHz LoRa at 10 dBm. Free-space path loss at 300 m is about 75 dB, which leaves a fade margin of 60 dB or more. The design target is 300 m, 2× the 150 m rule.

5) Endurance
24 V × 20 Ah LiFePO4 = 512 Wh. At about 220 W average draw that gives about 2.3 h, against a run of under 20 min.

6) Laser aim
An A4 panel at 3 m gives an aiming window of about ±2.0°. The servo resolution is 0.1°, so there is a 20× aim margin, and the laser is held for 3.0 s against the 2.0 s rule.

7) Latency budget (estimated, perception to wheels)

| Stage | SAARTHI | Typical hobby stack |
|---|---|---|
| Camera | 16.7 ms | 33 ms |
| AI inference | 8 ms | 40 ms |
| Fusion and planning | 10 ms | 20 ms |
| Link to controller | 2 ms | 30 ms |
| Control loop | 2.5 ms | 20 ms |
| Motor driver | 5 ms | 5 ms |
| **Total** | **~44 ms** | **~148 ms** |

Simulation plan: a Gazebo digital twin built from the arena CAD, with 500 randomised runs before the hardware trials. Model latencies will be benchmarked on the Jetson in week 5.

---

## 5. Bill of Materials (BOM) & Estimated Cost

1. Jetson Orin Nano Super 8 GB dev kit (Qty 1) – ₹32,000
2. Depth camera + wide RGB camera (Qty 1 each) – ₹38,000
3. 2D LiDAR, 360° (Qty 1) – ₹8,000
4. Pixhawk 6C autopilot + GPS mast (Qty 1) – ₹20,000
5. RTK GNSS pair: 2 × u-blox F9P + antennas (Qty 2) – ₹45,000
6. ExpressLRS link + digital FPV + telemetry radio (Qty 1 set) – ₹26,000
7. 24 V geared motors (Qty 4) + dual motor drivers (Qty 2) – ₹28,000
8. 24 V 20 Ah LiFePO4 battery + BMS + charger (Qty 1) – ₹14,000
9. Al-6061 chassis, suspension, wheels (Qty 1 set) – ₹18,000
10. Wiring, fuses, IP54 enclosures, 3D prints (Lot) – ₹22,000
11. E-stop pair, contactor, Class-2 laser + gimbal (Qty 1 set) – ₹11,000
12. Contingency (10%) – ₹26,200

Total Prototype Cost: ₹2,88,200 (≈ ₹2.9 lakh) per unit.
Software licences: ₹0, because the whole stack is open source (ROS 2, ArduPilot, Nav2, Gazebo, PyTorch/TensorRT, InsightFace).
Prices are indicative Indian market prices (late 2026), rounded.

---

## 6. Team Roles & Responsibilities

Mohammed Adeeb Khan (B.Tech EE, 3rd year): Team Lead; Electronics, Power & Safety
- System architecture and integration
- Battery, BMS, motor drivers, wiring harness
- Pixhawk wiring, sensors, laser driver
- ELRS, FPV, RTK and telemetry links
- Wireless + mechanical E-stop chain
- Chassis build and payload cradle
- Pitch presentation lead

Bhavya Jain (B.Tech EE, 3rd year): Perception & Machine Learning
- Datasets, labelling and synthetic data
- Lane and pothole segmentation
- Sign and traffic-light detection
- SCRFD + ArcFace face matching
- TensorRT INT8 deployment on the Jetson
- Laser visual-servo aim loop

Ashmit Bindal (B.Tech IT, 3rd year): Software (Autonomy, Simulation & Testing)
- ROS 2 stack and MAVLink / DDS bridge
- ArduPilot Rover tuning (EKF3)
- Nav2, behaviour tree and mission logic
- Gazebo digital twin and replay tests
- Test matrix, run logs and telemetry GCS
- Compliance and PDR documentation

Faculty mentor: Dr. Anamika Chauhan, Delhi Technological University.

---

## 7. 75-Day Milestone Progress Chart

Day 0 (now): Completed – problem analysis, 6 measurable targets, system architecture, radio plan, ML stack selection, costed BOM, 75-day plan (Stage 1 deck + Stage 2 pitch).

Gates and exit criteria:
- G0, Day 1–15 (Scheduled): Design freeze and procurement; Gazebo digital twin with synthetic data. Exit: lane-follow in sim, 20 clean runs.
- G1, Day 10–30 (Scheduled): Chassis fabrication and wiring; E-stop and safety chain on the bench. Exit: stop in under 0.5 s at 300 m E-stop range.
- G2, Day 25–40 (Scheduled): Manual mode with ELRS + FPV; ramp and payload trials. Exit: 5 clean manual laps on FPV only. Manual-ready by D40.
- G3, Day 36–60 (Scheduled): Model training and TensorRT (D12–38); autonomy for lanes, signs and hazards; face-ID + laser gimbal. Exit: each task at 90% success or better in the mock arena. Autonomy feature-complete by D60.
- G4, Day 56–75 (Scheduled): Full-course mock runs and tuning; inspection prep, docs, buffer week. Exit: 30 full runs with 0 departures in the last 10. Competition-ready by D75.

---

## 8. Identified Technical Gaps

1) Arena data not yet published (track dimensions, sign catalogue, face-panel size and gallery format). Closing it: a clarification query to the DTU technical panel in week 1.
2) Model latency not yet measured on the Jetson; the ~44 ms figure is an estimate. Closing it: TensorRT INT8 benchmarks on the vehicle computer by week 5.
3) No arena-specific training data. Closing it: synthetic data from the Gazebo twin plus captures from an arena replica (G0).
4) Ramp traction and payload retention untested. Closing it: bench and ramp trials with an 8 kg payload (G2, D25–40).
5) Lane and sign detection under Delhi daylight glare. Closing it: mock-arena field trials with logged runs (G3, D36–60).
6) Component lead times for imported parts (Jetson, RTK pair, LiDAR). Closing it: order at design freeze (D1–10); simulation work continues without hardware.

---

## 9. Risks and Mitigation Strategies

1) An ML model misreads a sign or lane.
   Mitigation: every model has a classical fallback, and a 3-of-5 frame vote decides. When the system is uncertain, the default action is stop.
2) The E-stop or radio link is lost.
   Mitigation: a hardware heartbeat. 200 ms of silence opens the contactor, there is no software in the path, and the vehicle stops in under 0.5 s.
3) The laser could reach a person.
   Mitigation: the laser is Class 2 eye-safe. It fires only on a face match AND a depth-verified flat panel AND inside the geofence.
4) Imported parts arrive late.
   Mitigation: order at design freeze (D1–10). Digital-twin and model work proceed without hardware.
5) The schedule slips.
   Mitigation: manual-ready by D40, with a weekly full-integration run and the final week kept as buffer.
6) The budget overruns.
   Mitigation: a 10% contingency (₹26,200) is already in the BOM.
7) Privacy and regulatory compliance.
   Mitigation: only licence-exempt radio bands are used. The reference face is enrolled at the start line and discarded after the run (DPDP Act 2023), and we never train on the supplied faces.

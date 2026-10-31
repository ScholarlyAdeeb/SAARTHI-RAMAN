# SAARTHI — Self-reliant Autonomous All-terrain Rover with Target & Hazard Intelligence

**SEVA FIRST Innovation Challenge 2026 · Problem Statement NAT-003 R.A.M.A.N · Category II (Diploma & Higher Education)**
Team **SAMAYPUR SHOOTERS** · Delhi Technological University · Faculty mentor: Dr. Anamika Chauhan

SAARTHI is a drone-grade, low-latency autonomy stack on a 4WD electric unmanned ground vehicle. It runs every R.A.M.A.N task on one stand-alone platform:

- lane discipline
- road signs and traffic lights
- potholes and obstacles
- a 20° ramp and debris, with a 5 kg payload
- face matching
- an eye-safe laser indication

It rests on three pillars:

1. **Drone-grade core.** A Pixhawk 6C running ArduPilot Rover: 400 Hz control loop, EKF3 fusion, and a MAVLink 2 / DDS link under 2 ms. ExpressLRS and digital FPV handle the manual round, and an RTK GNSS pair provides positioning.
2. **Edge-AI perception.** A Jetson Orin Nano Super runs TensorRT INT8 models for lanes, signs and lights, and faces (SCRFD + ArcFace), plus a laser visual servo. Each model has a classical fallback.
3. **Fail-safe by design.** A hardware E-stop chain with a 433 MHz LoRa heartbeat stops the vehicle in under 0.5 s with no software in the path. Telemetry receive is physically disabled in the autonomous round. The laser interlock requires a face match AND a depth-verified flat panel AND being inside the geofence.

> **Status: design stage (TRL 3).** No hardware has been built yet. The 75-day plan targets TRL 6, and the prototype scene in the video is an illustrative digital-twin preview, not real footage.

## Contents

| Path | What it is |
|---|---|
| [`docs/Stage2_Technical_Submission.md`](docs/Stage2_Technical_Submission.md) | Stage 2 write-up, one section per point: solution, prototype status, drawings, calculations, BOM, team, 75-day plan, gaps, risks |
| [`docs/SAARTHI_Stage1_Ideation_Deck.pdf`](docs/SAARTHI_Stage1_Ideation_Deck.pdf) | Stage 1 ideation deck, 22 slides (PDF) |
| [`docs/SAARTHI_Stage1_Ideation_Deck.pptx`](docs/SAARTHI_Stage1_Ideation_Deck.pptx) | Same deck, editable PowerPoint |
| [`video/SAARTHI_Stage2_Pitch.mp4`](video/SAARTHI_Stage2_Pitch.mp4) | Stage 2 video pitch, 4:28, 1080p |
| [`video/source/`](video/source) | HyperFrames source of the pitch video (HTML compositions, spec, review notes); the music file is not included |
| [`tools/`](tools) | Generators: the deck (pptxgenjs), the video scenes, and the MusicGen music bed |

## Key numbers (estimates)

- Perception-to-wheels latency: **~44 ms**, vs ~148 ms for a typical hobby stack.
- E-stop: tested to a target range of **300 m** (2× the 150 m rule); stop in **under 0.5 s**.
- Laser hold: **3.0 s** (the rule requires 2.0 s).
- Prototype cost: **₹2,88,200** (≈ ₹2.9 lakh), with ₹0 in software licences.
- Endurance: **~2.3 h**, against a run of under 20 min.

## Team

| Member | Branch | Role |
|---|---|---|
| Mohammed Adeeb Khan | B.Tech EE, 3rd year | Team Lead: Electronics, Power & Safety |
| Bhavya Jain | B.Tech EE, 3rd year | Perception & Machine Learning |
| Ashmit Bindal | B.Tech IT, 3rd year | Software: Autonomy, Simulation & Testing |

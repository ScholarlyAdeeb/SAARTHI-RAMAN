# REVIEW — SAARTHI Stage 2 pitch

Checked with `hyperframes check` (0 errors) and two snapshot passes across all 13 scenes.

Fixed after the first look:
- icons rendered as broken images (duplicate `xmlns` in the generated SVGs);
- rover wheels vanished (GSAP rotation on an SVG group needed `svgOrigin`, not a CSS transform-origin);
- milestone labels on the 75-day chart overlapped (now right-aligned to their diamonds);
- "ILLUSTRATIVE · NOT FOOTAGE" sat under the parked rover in the digital-twin scene (moved inside the loop);
- long reading holds trimmed (film 4:48 → 4:28), labels raised to 24 px, pills to 28 px, ramp label moved off the track for contrast.

Known and accepted:
- `text_below_floor` warnings on section labels, footer and table text (22–27 px): this is the deck's own type scale, and the film is judged on a laptop, not a phone.
- `dead_stretch` on reading holds: deliberate (`data-hold`), so a juror can read each finished slide.

Point 2 (prototype) is explicitly labelled as an illustrative preview — no hardware exists yet.
Music: generated locally with MusicGen-small; measured for level, not listened to by a human.

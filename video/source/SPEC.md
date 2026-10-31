# SPEC — SAARTHI Stage 2 pitch (storyline B: "The deck comes alive")

GOAL:    a SEVA FIRST juror finishes the film able to tick all 9 Screen-2 points and believing a 3-person DTU team can build SAARTHI in 75 days for ~₹2.9 L.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, MP4.
TIME:    284 s x 30 = 8520 frames. Music bed ~104 bpm (MusicGen, local); no voice, no SFX (person's choice: music only).
LOOK:    the Stage 1 deck, 1:1 (the person's own design language, so its icons-in-circles and cards are allowed).
         ground #FFFFFF; corner circles sky #E6F1FF (top-right, 430 px) and mint #E3F7EE (bottom-right, 216 px);
         ink #2D2A4A, muted #5A5677, rule #DCD8EE;
         pastels as bg/mid/deep — lav EFEBFF/CDBFFF/5B4BC4, sky E6F1FF/BFDDFF/2F6FB5, mint E3F7EE/BDEBD7/1E8A63,
         peach FFEDE5/FFCDB8/C2562D, butter FFF6D6/FFE9A8/8A6A00, rose FDE8F0/F8C6D8/B0386A;
         accent: deep lavender #5B4BC4, on one key word or number per scene;
         Calibri (local) 400/700; title 64 px bold, body 28 px, labels 20 px bold caps tracking 0.12em, footer 20 px muted;
         cards radius 20 px, no shadows; icon dots 84 px pastel-mid circles with deep-colour glyphs;
         header: DTU / SEVA FIRST / Delhi Govt logos at deck positions, section pill top-right "TAG · n/9".
OBJECTS: the deck's rover (lavender body, dark wheels with white hubs, butter 5 kg box, sky camera mast, rose antenna, peach dashed laser);
         a top-down pastel track for the digital-twin preview; a side and top view drawn in ink lines.
MOTION:  enter = expo.out / power4.out 0.5–0.7 s; exit = power2.in 0.25 s with 8 px blur; camera / colour = power2.inOut;
         titles: per-word blur-in 0.13 s, 0.07 s apart, then dead still; list items stagger 0.08 s; bars grow scaleX power3.out;
         lines draw with stroke-dashoffset; numbers count up. The stage (logos, footer, circles) never moves or cuts:
         each scene blur-swaps out in its last 0.35 s while the next builds in.
SHOTS:   00–08 title · 08–28 problem · 28–54 solution (1/9) · 54–76 how it works (1/9) · 76–106 prototype preview (2/9)
         · 106–130 drawings (3/9) · 130–164 calculations (4/9) · 164–192 BOM (5/9) · 192–208 team (6/9)
         · 208–232 75-day plan (7/9) · 232–250 gaps (8/9) · 250–272 risks (9/9) · 272–284 end card.
BANNED:  dark void, glow, gradients, glass; text moving while read; titles drifting after landing; fake prototype footage
         (point 2 is labelled "illustrative preview, no hardware yet"); any number not in the Stage 1 deck.
QA:      every scene at its fully-built moment (≈ end − 1 s) reads as a finished deck slide; t=0 is the title, not blank;
         no text under 28 px except labels/footer; nothing crosses the 90% action-safe box.

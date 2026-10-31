"""Generate a long MusicGen bed by continuation: 30 s seed, then extend in 20 s steps
using the last 10 s as the audio prompt, crossfading each join."""
import sys, wave, numpy as np, torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration

out, target = sys.argv[1], float(sys.argv[2])
prompt = ("light uplifting electronic background music for a technology presentation, "
          "soft marimba plucks, warm synth pads, gentle steady beat, 104 bpm, optimistic, "
          "clean modern, no vocals")
torch.manual_seed(7)
torch.set_num_threads(16)
import time; T0=time.time()
dev = "cuda" if torch.cuda.is_available() else "cpu"
proc = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small").to(dev)
sr = model.config.audio_encoder.sampling_rate
tok = lambda s: int(s * 50)  # 50 audio tokens per second

def gen(audio=None, seconds=30):
    kw = dict(text=[prompt], padding=True, return_tensors="pt")
    if audio is not None:
        kw.update(audio=audio, sampling_rate=sr)
    inp = proc(**kw).to(dev)
    with torch.no_grad():
        wav = model.generate(**inp, do_sample=True, guidance_scale=3.0, max_new_tokens=tok(seconds))
    return wav[0, 0].float().cpu().numpy()

track = gen(seconds=30)
print("seed", len(track) / sr, round(time.time()-T0), flush=True)
ctx, step, fade = 10, 20, int(0.5 * sr)
while len(track) / sr < target:
    tail = track[-ctx * sr:]
    w = gen(tail, seconds=step)
    new = w[len(tail):] if len(w) > len(tail) else w
    track = np.concatenate([track, new])
    print("len", round(len(track) / sr, 1), round(time.time()-T0), flush=True)
track = track[: int(target * sr)]
peak = np.max(np.abs(track)) or 1.0
track = track / peak * 0.89
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((track * 32767).astype(np.int16).tobytes()); w.close()
print("done", out, len(track) / sr, dev)

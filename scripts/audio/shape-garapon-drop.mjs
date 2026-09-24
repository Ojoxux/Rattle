// Regenerates public/audio/garapon-drop.wav from garapon-drop-source.mp3.
// The source clip has a real ball's double-bounce baked in; this ducks the
// second knock instead of hard-cutting it, so the tail still rings out.
// Requires macOS `afconvert` to decode the mp3 (decode-only, no re-encode needed).

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const sourceMp3 = join(here, "garapon-drop-source.mp3");
const outputWav = join(here, "../../public/audio/garapon-drop.wav");

const START_MS = 95; // pre-roll kept before the first attack
const END_MS = 480; // full clip length after shaping
// Gain envelope, in ms relative to START_MS: full hit, then duck the second
// bounce so it doesn't read as a separate clank, then let the tail ring out.
const ENVELOPE = [
  { ms: 0, gain: 1 },
  { ms: 55, gain: 1 },
  { ms: 105, gain: 0.28 },
  { ms: 165, gain: 0.28 },
  { ms: 205, gain: 0.55 },
  { ms: 285, gain: 0.55 },
  { ms: 385, gain: 0 },
];

function gainAt(ms) {
  for (let i = 1; i < ENVELOPE.length; i++) {
    if (ms < ENVELOPE[i].ms) {
      const a = ENVELOPE[i - 1];
      const b = ENVELOPE[i];
      const t = (ms - a.ms) / (b.ms - a.ms);
      return a.gain + (b.gain - a.gain) * t;
    }
  }
  return 0;
}

function findChunk(buf, id) {
  let offset = 12;
  while (offset < buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (chunkId === id) return { start: offset + 8, size };
    offset += 8 + size + (size % 2);
  }
  throw new Error(`chunk ${id} not found`);
}

const workDir = mkdtempSync(join(tmpdir(), "garapon-drop-"));
const decodedWav = join(workDir, "decoded.wav");
execFileSync("afconvert", [sourceMp3, "-d", "LEI16@44100", "-f", "WAVE", decodedWav]);

const buf = readFileSync(decodedWav);
const fmt = findChunk(buf, "fmt ");
const channels = buf.readUInt16LE(fmt.start + 2);
const sampleRate = buf.readUInt32LE(fmt.start + 4);
const bitsPerSample = buf.readUInt16LE(fmt.start + 14);
const data = findChunk(buf, "data");
const bytesPerSample = bitsPerSample / 8;
const frameSize = bytesPerSample * channels;

const startFrame = Math.round((sampleRate * START_MS) / 1000);
const endFrame = Math.min(
  Math.floor(data.size / frameSize),
  Math.round((sampleRate * END_MS) / 1000),
);
const frameCount = endFrame - startFrame;

const out = Buffer.alloc(frameCount * frameSize);
for (let f = 0; f < frameCount; f++) {
  const gain = gainAt((f / sampleRate) * 1000);
  for (let c = 0; c < channels; c++) {
    const srcIdx = data.start + (startFrame + f) * frameSize + c * bytesPerSample;
    const v = buf.readInt16LE(srcIdx);
    out.writeInt16LE(
      Math.max(-32768, Math.min(32767, Math.round(v * gain))),
      f * frameSize + c * bytesPerSample,
    );
  }
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + out.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(channels, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * frameSize, 28);
header.writeUInt16LE(frameSize, 32);
header.writeUInt16LE(bitsPerSample, 34);
header.write("data", 36);
header.writeUInt32LE(out.length, 40);

writeFileSync(outputWav, Buffer.concat([header, out]));
rmSync(workDir, { recursive: true, force: true });
console.log(`wrote ${outputWav} (${((frameCount / sampleRate) * 1000).toFixed(1)}ms)`);

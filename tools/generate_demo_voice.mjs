import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.argv[2] ?? "demo-assets/flowlens-demo-narration.txt";
const outputPath =
  process.argv[3] ?? "output/playwright/flowlens-demo-narration.mp3";
const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;

if (!apiKey || !voiceId) {
  throw new Error(
    "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be configured.",
  );
}

const narration = await readFile(sourcePath, "utf8");
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: narration,
      model_id: process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.52,
        similarity_boost: 0.78,
        style: 0.18,
        use_speaker_boost: true,
        speed: 1.04,
      },
    }),
  },
);

if (!response.ok) {
  throw new Error(
    `ElevenLabs voice generation failed with status ${response.status}.`,
  );
}

await mkdir(path.dirname(outputPath), { recursive: true });
const audio = Buffer.from(await response.arrayBuffer());
await writeFile(outputPath, audio);
console.log(`Saved ${outputPath} (${Math.ceil(audio.length / 1024)} KB)`);

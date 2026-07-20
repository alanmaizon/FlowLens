import { fileURLToPath } from "node:url";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..", "..");
const baseUrl = process.env.FLOWLENS_DEMO_URL ?? "http://localhost:8080";
const email = process.env.FLOWLENS_DEMO_EMAIL;
const password = process.env.FLOWLENS_DEMO_PASSWORD;
const projectName = process.env.FLOWLENS_DEMO_PROJECT_NAME ?? "Northstar operations transformation";
const recordingDirectory = path.join(projectRoot, "output", "playwright", "narrated-raw");
const outputPath = path.join(projectRoot, "output", "playwright", "flowlens-narrated-demo.webm");

if (!email || !password) {
  throw new Error("FLOWLENS_DEMO_EMAIL and FLOWLENS_DEMO_PASSWORD are required.");
}

const titleCard = `
  <main>
    <div class="mark">F</div>
    <p>PROCESS TRANSFORMATION COPILOT</p>
    <h1>FlowLens</h1>
    <h2>Turn process evidence into transformation decisions.</h2>
    <div class="pill">Built with Codex + GPT-5.6</div>
  </main>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0b1020; color: #f7f8fc; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    main { min-height: 100vh; padding: 154px 172px; background: radial-gradient(circle at 82% 12%, #315cc933, transparent 38%), linear-gradient(145deg, #0b1020, #121b35); }
    .mark { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 16px; background: #315cca; font-size: 28px; font-weight: 800; }
    p { margin: 70px 0 18px; color: #9db5f7; font-size: 18px; font-weight: 700; letter-spacing: 0.13em; }
    h1 { margin: 0; font-size: 96px; line-height: 1; letter-spacing: -0.06em; }
    h2 { max-width: 820px; margin: 28px 0 44px; color: #c7d0e7; font-size: 37px; font-weight: 500; line-height: 1.25; }
    .pill { display: inline-block; border: 1px solid #5675ca; border-radius: 999px; padding: 13px 20px; color: #d8e3ff; font-size: 19px; font-weight: 650; }
  </style>
`;

async function pause(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function recordNarratedDemo() {
  await mkdir(recordingDirectory, { recursive: true });
  await rm(outputPath, { force: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: recordingDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await page.setContent(titleCard);
    await pause(page, 9_000);

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(email);
    await pause(page, 900);
    await page.getByLabel("Password").fill(password);
    await pause(page, 900);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByRole("heading", { name: "Process change, in focus." }).waitFor();
    await pause(page, 9_000);

    await page
      .getByRole("link", { name: new RegExp(projectName) })
      .first()
      .click();
    await page.getByRole("heading", { name: projectName }).waitFor();
    await pause(page, 12_000);

    await page.getByText("Executive summary", { exact: true }).scrollIntoViewIfNeeded();
    await pause(page, 19_000);

    await page.getByText("Process map", { exact: true }).scrollIntoViewIfNeeded();
    await pause(page, 20_000);

    await page.getByText("Transformation opportunities", { exact: true }).scrollIntoViewIfNeeded();
    await pause(page, 20_000);

    await page.getByText("Implementation roadmap", { exact: true }).scrollIntoViewIfNeeded();
    await pause(page, 16_000);

    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .scrollIntoViewIfNeeded();
    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .fill("What should Northstar prioritise first?");
    await pause(page, 12_000);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!video) {
    throw new Error("Playwright did not initialise video recording.");
  }
  await rename(await video.path(), outputPath);
  console.log(`Saved ${outputPath}`);
}

await recordNarratedDemo();

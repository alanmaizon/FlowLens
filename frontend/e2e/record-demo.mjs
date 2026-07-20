import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { chromium } from "@playwright/test";

const execFileAsync = promisify(execFile);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..", "..");
const baseUrl = process.env.FLOWLENS_DEMO_URL ?? "http://localhost:8080";
const shouldGenerateAnalysis = process.env.FLOWLENS_DEMO_ANALYSE === "1";
const recordingDirectory = path.join(projectRoot, "output", "playwright", "raw");
const outputPath = path.join(projectRoot, "output", "playwright", "flowlens-product-demo.mp4");
const sourceDocument = path.join(projectRoot, "demo-documents", "02_accounts_payable_sop.md");
const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
const demoEmail = `flowlens.demo+${timestamp}@example.com`;
const demoPassword = "FlowLensDemoPass123!";

async function pause(page, milliseconds = 700) {
  await page.waitForTimeout(milliseconds);
}

async function recordDemo() {
  await mkdir(recordingDirectory, { recursive: true });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await rm(outputPath, { force: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: recordingDirectory,
      size: { width: 1440, height: 900 },
    },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    console.log("Recording sign-up screen...");
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Create one" }).click();
    await pause(page);

    await page.getByLabel("Name").fill("FlowLens Demo");
    await page.getByLabel("Email").fill(demoEmail);
    await page.getByLabel("Password").fill(demoPassword);
    await pause(page, 500);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/$/);
    await page.getByRole("heading", { name: "Process change, in focus." }).waitFor();
    await pause(page);

    console.log("Recording project creation...");
    await page.getByRole("button", { name: "New project" }).click();
    await page.getByRole("heading", { name: "Create a project" }).waitFor();
    await page.getByLabel("Project name").fill("Northstar operations transformation");
    await page
      .getByLabel("Context (optional)")
      .fill("Reduce invoice exceptions and speed up finance operations.");
    await pause(page, 500);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.waitForURL(/\/projects\/[^/]+$/);
    await page.getByRole("heading", { name: "Northstar operations transformation" }).waitFor();
    await pause(page);

    console.log("Recording document upload...");
    await page.locator('input[type="file"]').setInputFiles(sourceDocument);
    await page.getByText("02_accounts_payable_sop.md", { exact: true }).waitFor();
    await page.waitForFunction(() => {
      const analysisButton = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Generate analysis",
      );
      return analysisButton instanceof HTMLButtonElement && !analysisButton.disabled;
    });
    await pause(page, 1200);

    if (shouldGenerateAnalysis) {
      console.log("Generating and recording the Claude analysis report...");
      await page.getByRole("button", { name: "Generate analysis" }).click();
      await page.getByRole("heading", { name: "Executive summary" }).waitFor({ timeout: 120_000 });
      await pause(page, 1500);
    } else {
      console.log("Recording the project workspace...");
      await page.getByRole("heading", { name: "Analysis report" }).scrollIntoViewIfNeeded();
      await pause(page, 1400);
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (!video) {
    throw new Error("Playwright did not initialise video recording.");
  }
  const rawVideoPath = await video.path();
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    rawVideoPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
  await rm(rawVideoPath, { force: true });
  const outputSize = await stat(outputPath);
  if (outputSize.size === 0) {
    throw new Error("The MP4 export is empty.");
  }
  console.log(`Saved ${outputPath} (${Math.ceil(outputSize.size / 1024)} KB)`);
}

try {
  await recordDemo();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

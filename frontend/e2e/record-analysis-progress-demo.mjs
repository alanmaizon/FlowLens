import { fileURLToPath } from "node:url";
import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..", "..");
const baseUrl = process.env.FLOWLENS_DEMO_URL ?? "http://localhost:8080";
const email = process.env.FLOWLENS_DEMO_EMAIL;
const password = process.env.FLOWLENS_DEMO_PASSWORD;
const projectId = process.env.FLOWLENS_DEMO_PROJECT_ID;
const recordingDirectory = path.join(projectRoot, "output", "playwright", "analysis-progress-raw");
const outputPath = path.join(
  projectRoot,
  "output",
  "playwright",
  "flowlens-analysis-progress.webm",
);

if (!email || !password || !projectId) {
  throw new Error(
    "FLOWLENS_DEMO_EMAIL, FLOWLENS_DEMO_PASSWORD, and FLOWLENS_DEMO_PROJECT_ID are required.",
  );
}

async function pause(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function recordAnalysisProgressDemo() {
  await mkdir(recordingDirectory, { recursive: true });
  await rm(outputPath, { force: true });

  const browser = await chromium.launch({ headless: true });
  const authenticationContext = await browser.newContext();
  const authenticationPage = await authenticationContext.newPage();
  await authenticationPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await authenticationPage.getByLabel("Email").fill(email);
  await authenticationPage.getByLabel("Password").fill(password);
  await authenticationPage.getByRole("button", { name: "Sign in" }).click();
  await authenticationPage.getByRole("heading", { name: "Process change, in focus." }).waitFor();
  const storageState = await authenticationContext.storageState();
  await authenticationContext.close();

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState,
    recordVideo: { dir: recordingDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();

  try {
    await page.goto(`${baseUrl}/projects/${projectId}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Generate analysis" }).waitFor({ timeout: 30_000 });
    await pause(page, 2_000);
    await page.getByRole("button", { name: "Generate analysis" }).click();
    const progress = page.getByText("Analysis in progress", { exact: true });
    await progress.waitFor({ timeout: 15_000 });
    await progress.evaluate((element) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await pause(page, 28_000);
    await page.getByText("Executive summary", { exact: true }).waitFor({ timeout: 360_000 });
    await pause(page, 1_000);
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

await recordAnalysisProgressDemo();

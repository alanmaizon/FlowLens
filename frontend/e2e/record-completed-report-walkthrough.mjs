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
const recordingDirectory = path.join(projectRoot, "output", "playwright", "completed-report-raw");
const outputPath = path.join(
  projectRoot,
  "output",
  "playwright",
  "flowlens-completed-report-walkthrough.webm",
);

if (!email || !password || !projectId) {
  throw new Error(
    "FLOWLENS_DEMO_EMAIL, FLOWLENS_DEMO_PASSWORD, and FLOWLENS_DEMO_PROJECT_ID are required.",
  );
}

async function pause(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function smoothlyReveal(page, label, holdMilliseconds) {
  const target = page.getByText(label, { exact: true });
  await target.evaluate((element) => {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await pause(page, 1_700);
  await pause(page, holdMilliseconds);
}

async function recordCompletedReportWalkthrough() {
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
    await page.getByText("Executive summary", { exact: true }).waitFor({ timeout: 30_000 });
    await pause(page, 7_000);
    await smoothlyReveal(page, "Process map", 7_000);
    await smoothlyReveal(page, "Actors & systems", 6_000);
    await smoothlyReveal(page, "Pain points & risks", 6_000);
    await smoothlyReveal(page, "Transformation opportunities", 7_000);
    await smoothlyReveal(page, "Implementation roadmap", 7_000);
    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .evaluate((element) => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    await pause(page, 1_700);
    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .fill("What should Northstar automate first, and what evidence supports it?");
    await pause(page, 1_500);
    await page.getByRole("button", { name: "Send message" }).click();
    await page.waitForFunction(() => document.querySelector("textarea")?.value === "", null, {
      timeout: 60_000,
    });
    await pause(page, 16_000);
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

await recordCompletedReportWalkthrough();

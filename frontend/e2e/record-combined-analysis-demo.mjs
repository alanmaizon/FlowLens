import { fileURLToPath } from "node:url";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..", "..");
const baseUrl = process.env.FLOWLENS_DEMO_URL ?? "http://localhost:8080";
const email = process.env.FLOWLENS_DEMO_EMAIL;
const password = process.env.FLOWLENS_DEMO_PASSWORD;
const recordingDirectory = path.join(projectRoot, "output", "playwright", "combined-analysis-raw");
const outputPath = path.join(
  projectRoot,
  "output",
  "playwright",
  "flowlens-combined-analysis.raw.webm",
);
const timelinePath = path.join(
  projectRoot,
  "output",
  "playwright",
  "flowlens-combined-analysis.timeline.json",
);
const projectName = "Northstar multi-process transformation";
const sourceDocuments = [
  path.join(projectRoot, "demo-documents", "01_customer_onboarding_meeting_notes.txt"),
  path.join(projectRoot, "demo-documents", "02_accounts_payable_sop.md"),
  path.join(projectRoot, "demo-documents", "03_invoice_exception_log.csv"),
  path.join(projectRoot, "demo-documents", "04_procurement_purchase_requisition_sop.docx"),
  path.join(projectRoot, "output", "pdf", "05_order_to_cash_runbook.pdf"),
];

if (!email || !password) {
  throw new Error("FLOWLENS_DEMO_EMAIL and FLOWLENS_DEMO_PASSWORD are required.");
}

const titleCard = `
  <main>
    <div class="mark">F</div>
    <p>AI-POWERED PROCESS TRANSFORMATION</p>
    <h1>FlowLens</h1>
    <h2>From fragmented process evidence to an actionable transformation roadmap.</h2>
    <div class="pill">Built with Codex + GPT-5.6</div>
  </main>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0b1020; color: #f7f8fc; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    main { min-height: 100vh; padding: 154px 172px; background: radial-gradient(circle at 82% 12%, #315cc933, transparent 38%), linear-gradient(145deg, #0b1020, #121b35); }
    .mark { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 16px; background: #315cca; font-size: 28px; font-weight: 800; }
    p { margin: 70px 0 18px; color: #9db5f7; font-size: 18px; font-weight: 700; letter-spacing: 0.13em; }
    h1 { margin: 0; font-size: 96px; line-height: 1; letter-spacing: -0.06em; }
    h2 { max-width: 860px; margin: 28px 0 44px; color: #c7d0e7; font-size: 37px; font-weight: 500; line-height: 1.25; }
    .pill { display: inline-block; border: 1px solid #5675ca; border-radius: 999px; padding: 13px 20px; color: #d8e3ff; font-size: 19px; font-weight: 650; }
  </style>
`;

async function pause(page, milliseconds) {
  await page.waitForTimeout(milliseconds);
}

async function waitForUploadedDocument(page, filename) {
  await page.getByText(filename, { exact: true }).waitFor({ timeout: 30_000 });
  await page.waitForFunction((name) => {
    const rows = Array.from(document.querySelectorAll("div"));
    return rows.some(
      (row) => row.textContent?.includes(name) && row.textContent?.includes("ready"),
    );
  }, filename);
}

async function smoothlyReveal(page, label, holdMilliseconds) {
  const target = page.getByText(label, { exact: true });
  await target.evaluate((element) => {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await pause(page, 1_200);
  await pause(page, holdMilliseconds);
}

async function recordCombinedAnalysisDemo() {
  await mkdir(recordingDirectory, { recursive: true });
  await rm(outputPath, { force: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: recordingDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const recordingStartedAt = Date.now();
  let analysisStartedAt = 0;
  let analysisFinishedAt = 0;

  try {
    await page.setContent(titleCard);
    await pause(page, 7_000);

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await pause(page, 2_000);
    await page.getByLabel("Email").fill(email);
    await pause(page, 700);
    await page.getByLabel("Password").fill(password);
    await pause(page, 1_000);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByRole("heading", { name: "Process change, in focus." }).waitFor();
    await pause(page, 4_000);

    await page.getByRole("link", { name: "New project" }).click();
    await page.getByRole("heading", { name: "Create a project" }).waitFor();
    await pause(page, 2_000);
    await page.getByLabel("Project name").fill(projectName);
    await page
      .getByLabel("Context (optional)")
      .fill(
        "Connect customer onboarding, accounts payable, procurement, and order-to-cash evidence.",
      );
    await pause(page, 1_500);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.getByRole("heading", { name: projectName }).waitFor();
    await pause(page, 4_000);

    for (const sourceDocument of sourceDocuments) {
      const filename = path.basename(sourceDocument);
      await page.locator('input[type="file"]').setInputFiles(sourceDocument);
      await waitForUploadedDocument(page, filename);
      await pause(page, 900);
    }
    await pause(page, 4_000);

    analysisStartedAt = Date.now();
    await page.getByRole("button", { name: "Generate analysis" }).click();
    const progress = page.getByText("Analysis in progress", { exact: true });
    await progress.waitFor({ timeout: 15_000 });
    await progress.evaluate((element) => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await pause(page, 2_000);
    await page.getByText("Executive summary", { exact: true }).waitFor({ timeout: 360_000 });
    analysisFinishedAt = Date.now();
    await pause(page, 7_000);

    await smoothlyReveal(page, "Process map", 14_000);
    await smoothlyReveal(page, "Transformation opportunities", 18_000);
    await smoothlyReveal(page, "Implementation roadmap", 17_000);
    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .evaluate((element) => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    await pause(page, 1_200);
    await page
      .getByPlaceholder("Ask about risks, opportunities, or next steps…")
      .fill("What should Northstar automate first, and what evidence supports it?");
    await pause(page, 1_500);
    await page.getByRole("button", { name: "Send message" }).click();
    await page.waitForFunction(() => document.querySelector("textarea")?.value === "", null, {
      timeout: 60_000,
    });
    await pause(page, 7_000);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!video || !analysisStartedAt || !analysisFinishedAt) {
    throw new Error("The analysis recording did not complete successfully.");
  }
  await rename(await video.path(), outputPath);
  await writeFile(
    timelinePath,
    JSON.stringify(
      {
        analysisStartSeconds: (analysisStartedAt - recordingStartedAt) / 1_000,
        analysisEndSeconds: (analysisFinishedAt - recordingStartedAt) / 1_000,
      },
      null,
      2,
    ),
  );
  console.log(`Saved ${outputPath}`);
  console.log(`Saved ${timelinePath}`);
}

await recordCombinedAnalysisDemo();

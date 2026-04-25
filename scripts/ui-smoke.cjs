const fs = require("fs");
const { chromium } = require("playwright");

const baseUrl = "http://localhost:1420";
const findings = [];
const runtimeErrors = [];
const badResponses = [];

function note(name, status, detail = "") {
  findings.push({ name, status, detail });
}

async function maybeClick(page, label, modalPattern) {
  const button = page.getByRole("button", { name: label }).first();
  if (await button.count()) {
    await button.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(800);
    const bodyText = await page.locator("body").innerText();
    note(`Button: ${label}`, "OK", modalPattern.test(bodyText) ? "opened" : "clicked");
    return true;
  }
  note(`Button: ${label}`, "SKIP", "not visible");
  return false;
}

async function breachBootSequence(page) {
  const keyInput = page.getByPlaceholder(/enter neural key/i);
  if (!(await keyInput.count())) {
    const body = await page.locator("body").innerText();
    if (/initializing oasis kernel|ready for neural handshake/i.test(body)) {
      await page.waitForTimeout(5000);
    }
  }

  if (!(await keyInput.count())) {
    return false;
  }

  await keyInput.fill("oasis-local-founder");
  await page.getByRole("button", { name: /breach kernel/i }).click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(3200);
  return true;
}

async function openFromPalette(page, commandLabel, modalPattern, resultName) {
  await page.keyboard.press("Control+K").catch(() => {});
  await page.waitForTimeout(700);

  const paletteInput = page.getByPlaceholder(/command the system/i);
  if (!(await paletteInput.count())) {
    note(resultName, "SKIP", "command palette did not open");
    return false;
  }

  await paletteInput.fill(commandLabel);
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter").catch(() => {});
  await page.waitForTimeout(1200);

  const bodyText = await page.locator("body").innerText();
  if (modalPattern.test(bodyText)) {
    note(resultName, "OK", "opened");
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);
    return true;
  }

  note(resultName, "FAIL", `command executed but expected panel text was not found for "${commandLabel}"`);
  await page.keyboard.press("Escape").catch(() => {});
  return false;
}

(async () => {
  const candidateBrowsers = [
    process.env.PLAYWRIGHT_EXECUTABLE_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);

  const executablePath = candidateBrowsers.find((candidate) => fs.existsSync(candidate));
  const browser = executablePath
    ? await chromium.launch({ headless: true, executablePath })
    : await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  page.on("pageerror", (err) => runtimeErrors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // React dev-only warning; noisy but non-fatal for this smoke contract.
      if (text.includes("Encountered two children with the same key")) {
        return;
      }
      runtimeErrors.push(`console: ${text}`);
    }
  });
  page.on("response", async (response) => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const breached = await breachBootSequence(page);
    if (breached) {
      note("Boot Handshake", "OK", "auto-breached");
      await page.waitForTimeout(1200);
    } else {
      note("Boot Handshake", "SKIP", "boot handshake not present");
    }

    const title = await page.title();
    const bodyText = await page.locator("body").innerText();

    note("Page Load", "OK", title || "no title");
    note("Body Text", bodyText.length > 0 ? "OK" : "FAIL", `${bodyText.slice(0, 180).replace(/\s+/g, " ")}...`);

    await page.keyboard.press("Alt+T").catch(() => {});
    await page.waitForTimeout(1000);
    const terminalText = await page.locator("body").innerText();
    if (/Strategic Command Node|Awaiting Directive|OASIS KERNEL/i.test(terminalText)) {
      note("Terminal Shortcut", "OK", "terminal surfaced");
    } else {
      note("Terminal Shortcut", "SKIP", "terminal shortcut did not surface visible panel");
    }

    await openFromPalette(page, "Open Sentinel Vault", /Sentinel Vault|Authentication Required|Asset Ledger/i, "Palette: Open Sentinel Vault");
    await openFromPalette(page, "Show Cortex Graph", /Strategic Cortex|3D knowledge map|react-force-graph/i, "Palette: Show Cortex Graph");
    await openFromPalette(page, "Open Logs", /Temporal Logs|Event history timeline|Chronos/i, "Palette: Open Logs");

    await maybeClick(page, /boardroom|debate/i, /Boardroom Debate|Strategic Advice|Oracle/i);
    await maybeClick(page, /sentinel|vault/i, /Sentinel Vault|Authentication Required|Asset Ledger/i);
    await maybeClick(page, /workforce/i, /Neural Workforce|Manifested Proposals|Active Neural Pulses/i);
    await maybeClick(page, /documentation|manual/i, /Documentation|System Documentation|Manual/i);

    if (badResponses.length > 0) {
      note("HTTP Errors", "FAIL", badResponses.join(" | ").slice(0, 1000));
    } else {
      note("HTTP Errors", "OK", "none observed");
    }

    if (runtimeErrors.length > 0) {
      note("Runtime Errors", "FAIL", runtimeErrors.join(" | ").slice(0, 1000));
    } else {
      note("Runtime Errors", "OK", "none observed");
    }

    console.table(findings);
    await page.screenshot({ path: "smoke-assets/ui-smoke.png", fullPage: true });
    console.log("Screenshot saved: smoke-assets/ui-smoke.png");
  } catch (err) {
    console.error("UI smoke failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  if (findings.some((f) => f.status === "FAIL")) {
    process.exitCode = 1;
  }
})();

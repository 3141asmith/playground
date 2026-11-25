const { chromium } = require("../../.runtime/tools/node_modules/playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:4185/playground/moonward/");
    await page.clock.install();
    await page.addInitScript(() => {
      if (localStorage.getItem('startup-test-away')) {
        const saved = JSON.parse(localStorage.getItem('moonward-save-v1'));
        saved.lastSeen = Date.now() - 400000;
        localStorage.setItem('moonward-save-v1', JSON.stringify(saved));
        localStorage.removeItem('startup-test-away');
      }
    });
    assert(await page.locator("#splash").isVisible());
    assert.equal(await page.locator("main").evaluate((el) => el.inert), true);
    await page.screenshot({ path: "playground/artifacts/moonward-splash.png" });
    await page.locator("#enter-game").click();
    assert(
      await page.locator("#modal").isHidden(),
      "Fresh games have no offline receipt",
    );
    await page.locator("#launch").click();
    await page.clock.runFor(200);
    await page.evaluate(() => {
      current().smelter = 1;
      current().assignments.iron = 0;
      current().assignments.rock = 2;
      state.stock.iron = 500;
      state.lastSeen = Date.now() - 400000;
      localStorage.setItem(KEY, JSON.stringify(state));
      localStorage.setItem('startup-test-away', 'yes');
    });
    await page.reload();
    assert(await page.locator("#splash").isVisible());
    assert(await page.locator("#modal").isHidden(), "Splash precedes receipt");
    await page.locator("#enter-game").click();
    assert.match(
      await page.locator("#modal-content").innerText(),
      /Materials gained/,
    );
    assert.match(
      await page.locator("#modal-content").innerText(),
      /Materials consumed/,
    );
    assert.match(await page.locator("#modal-content").innerText(), /25%/);
    const before = await page.evaluate(() => ({ ...state.stock }));
    await page.screenshot({
      path: "playground/artifacts/moonward-offline.png",
    });
    await page.locator("#offline-continue").click();
    assert.deepEqual(
      await page.evaluate(() => ({ ...state.stock })),
      before,
      "Continue never grants production again",
    );
    await page.reload();
    await page.locator("#enter-game").click();
    assert(
      await page.locator("#modal").isHidden(),
      "Immediate reload cannot claim offline earnings again",
    );
    await page.setViewportSize({ width: 320, height: 568 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: splash ordering, offline gains/consumption, persistence, no double credit, mobile layout",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

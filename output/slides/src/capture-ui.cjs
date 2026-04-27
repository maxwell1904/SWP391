const path = require("path");
const fs = require("fs/promises");
const { chromium } = require("/Users/maxwell/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = path.resolve(__dirname, "../assets");
const baseUrl = process.env.ROCKWEAR_URL || "http://localhost:3000";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function capture(page, route, fileName, options = {}) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: path.join(outDir, fileName),
    fullPage: options.fullPage ?? false,
  });
}

(async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    }
  });

  await capture(page, "/shop", "rockwear-shop-1440.png");
  await capture(page, "/login", "rockwear-login-1440.png");
  await capture(page, "/about", "rockwear-about-1440.png");

  await browser.close();
  console.log(`Captured UI screenshots in ${outDir}`);
})();

import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));
await page.addInitScript(() => {
  localStorage.setItem("speakable-user-profile-v1", JSON.stringify({ user_id: "mock-student-001", username: "dev_student", display_name: "Dev Student" }));
  localStorage.removeItem("speakable-mission-popup-shown");
  window.history.replaceState({ usr: { skipIntro: true }, key: "skip", idx: 0 }, "", "/treasure-map");
});
await page.goto("http://127.0.0.1:5174/treasure-map", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4500);
await page.screenshot({ path: "output/treasuremap-final-popup.png", fullPage: true });
await page.getByRole("button", { name: "進入寶藏地圖" }).click();
await page.waitForTimeout(3500);
await page.screenshot({ path: "output/treasuremap-final-map.png", fullPage: true });
await page.locator("button").filter({ hasText: "開始" }).first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: "output/treasuremap-final-minigame.png", fullPage: true });
const bodyText = await page.locator("body").innerText();
console.log(JSON.stringify({
  errors,
  hasPopupText: bodyText.includes("寶藏地圖冒險"),
  hasMockUnlocked: bodyText.includes("Mock dev 已開放"),
  startButtons: await page.locator("button", { hasText: "開始" }).count(),
  canvases: await page.locator("canvas").count()
}, null, 2));
await browser.close();

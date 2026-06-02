const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox']
  });
  // スマホサイズ（iPhone風）
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const url = 'file://' + path.resolve(__dirname, 'game.html');
  await page.goto(url);
  await page.waitForTimeout(400);

  // 1) タイトル
  await page.screenshot({ path: 'shot-1-title.png' });

  // 2) ミニゲーム説明
  await page.click('#toStage');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-2-intro.png' });

  // 3) ゲーム画面（単語を落とすため少し待つ）
  await page.click('#startGame');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'shot-3-game.png' });

  await browser.close();
  console.log('done');
})();

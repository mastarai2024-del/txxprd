#!/usr/bin/env node
// HTML → PNG 截图（用于 PRD 交互图 / 原型图）
// 用法: NODE_PATH=<node_modules 路径> node render-html.cjs <输入HTML> <输出PNG> [宽=390] [高=844] [缩放=2]
// 例:   NODE_PATH=~/.workbuddy/binaries/node/workspace/node_modules node render-html.cjs ./prototype.html ./shot.png 390 844 2
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [, , src, out, w = '390', h = '844', dsf = '2'] = process.argv;

if (!src || !out) {
  console.error('用法: node render-html.cjs <输入HTML> <输出PNG> [宽] [高] [缩放]');
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: +dsf });
  await page.goto('file://' + path.resolve(src), { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200)); // 等待页面入场动画结束
  await page.screenshot({ path: path.resolve(out) });
  await browser.close();
  console.log('rendered:', path.resolve(out));
})().catch((e) => { console.error(e); process.exit(1); });

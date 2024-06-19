import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import http from 'node:http';
import open from 'open';
import isCi from 'is-ci';

import { remarkNomnoml } from '../dist/remark-nomnoml';

const processor = unified()
  .use(remarkParse)
  .use(remarkNomnoml)
  .use(remarkStringify);

http
  .createServer(async (req, res) => {
    const input = await fs.readFile('./e2e/fixture.md', 'utf-8');
    const output = await processor.process(input);
    res.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>remark-nomnoml</title>
          <script src="https://cdn.jsdelivr.net/npm/nomnoml@0.7.1/dist/nomnoml.js"></script>
        </head>
        <body>
          ${output.value}
        </body>
      `);
    res.end();
  })
  .listen(3000, async () => {
    console.log('Server listening on http://localhost:3000');
    await test();
    if (!isCi) {
      await open('http://localhost:3000');
    }
    process.exit(0);
  });

async function test() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('svg');
  await page.waitForSelector('[data-name="Decorator pattern"]');
  await page.waitForSelector('[data-name="Component"]');
  await page.waitForSelector('[data-name="Client"]');
  await page.waitForSelector('[data-name="Decorator"]');
  await page.waitForSelector('[data-name="ConcreteComponent"]');
  await browser.close();
}

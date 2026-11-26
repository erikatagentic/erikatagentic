// Renders every banner and social preview from banner.html with headless Chrome.
// Usage: npm install, then node render.mjs. Output goes to out/. Free: local Chrome only.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.join(HERE, 'out');
const SIZES = { banner: [800, 200], social: [640, 320] };

const HEADLINE = 'I write the message, build what sends it, then check my own numbers.';
const SHOWCASES = {
  'list-gate': 'A check that refuses to ship a bad lead list.',
  'scrape-ladder': 'Scrapes a public page by trying the cheapest polite method first.',
  'agent-guardrails': "Five checks that stop a coding agent's risky moves before\u00a0they\u00a0run.",
  'reply-sorter': 'Sorts cold-email replies and counts the yeses a\u00a0person\u00a0wrote.',
  'formd-signals': 'Finds companies that just raised money, from free SEC\u00a0filings.',
  'open-brain': 'A memory for AI coding agents, kept in one local\u00a0file.',
};

const jobs = [];
for (const theme of ['light', 'dark']) {
  jobs.push({ file: `profile-${theme}.png`, kind: 'banner', theme, ref: 'p. 1', label: 'Erik Hernal · GTM engineer', title: HEADLINE, hand: 'erikhernal.com' });
  for (const [name, lede] of Object.entries(SHOWCASES)) {
    jobs.push({ file: `${name}-${theme}.png`, kind: 'banner', theme, name: '1', label: 'Erik Hernal · from the notebook', title: name, lede });
  }
}
for (const [name, lede] of Object.entries(SHOWCASES)) {
  jobs.push({ file: `${name}-social.png`, kind: 'social', theme: 'light', label: 'Erik Hernal · from the notebook', title: name, lede, hand: 'erikhernal.com' });
}

fs.mkdirSync(OUT, { recursive: true });
const page = pathToFileURL(path.join(HERE, 'banner.html')).href;
for (const { file, kind, ...params } of jobs) {
  const [w, h] = SIZES[kind];
  const url = `${page}?${new URLSearchParams({ kind, ...params })}`;
  const target = path.join(OUT, file);
  const r = spawnSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2',
    `--window-size=${w},${h}`, '--virtual-time-budget=3000', '--allow-file-access-from-files',
    `--screenshot=${target}`, url,
  ], { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(target)) {
    console.error(`${file}: chrome exit ${r.status}`);
    process.exitCode = 1;
    continue;
  }
  console.log(`${file} ${w * 2}x${h * 2} ${Math.round(fs.statSync(target).size / 1024)} KB`);
}

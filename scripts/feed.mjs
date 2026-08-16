#!/usr/bin/env node
// feed — 项目经验回流：把项目里的经验写回全局种子库 knowledge/
// 用法：node scripts/feed.mjs <项目目录> [--antipattern "描述"] [--lesson "描述"] [--project <名>]
// 或交互式：在项目里跑，自动扫描 docs/adr、CONTEXT.md、neural archive 里的经验
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const args = process.argv.slice(2);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

const projDir = args.find(a => !a.startsWith('--')) ?? process.cwd();
const project = opt('--project') ?? projDir.split(/[\\/]/).pop();
const antipattern = opt('--antipattern');
const lesson = opt('--lesson');

function append(file, line) {
  const p = join(SKILLS_ROOT, 'knowledge', file);
  const content = readFileSync(p, 'utf8');
  if (content.includes(line)) { console.log('跳过重复: ' + line.slice(0, 50)); return; }
  // 在"## 无条目"之后插入
  const updated = content.replace('## 无条目\n\n', '## 无条目\n\n' + '- **' + project + '** → ' + line + '\n');
  writeFileSync(p, updated, 'utf8');
  console.log('已回流 → knowledge/' + file + ': ' + line.slice(0, 60));
}

// 自动扫描项目里的经验（ADR 里的反模式线索、neural archive 的 ANTIPATTERNS）
function scanProject() {
  const findings = { antipatterns: [], lessons: [] };
  const tryRead = (rel) => {
    try { return readFileSync(join(projDir, rel), 'utf8'); } catch { return null; }
  };
  const neuralAnti = tryRead('.neural/knowledge/ANTIPATTERNS.md');
  if (neuralAnti) {
    for (const line of neuralAnti.split('\n')) {
      if (/^[-*]/.test(line.trim()) && line.trim().length > 10) findings.antipatterns.push(line.trim().replace(/^[-*]\s*/, ''));
    }
  }
  return findings;
}

let n = 0;
if (antipattern) { append('ANTIPATTERNS.md', antipattern); n++; }
if (lesson) { append('LESSONS.md', lesson); n++; }

const found = scanProject();
for (const a of found.antipatterns.slice(0, 5)) { append('ANTIPATTERNS.md', a); n++; }

if (!n) {
  console.log('没有显式经验传入。可用:');
  console.log('  node scripts/feed.mjs <项目> --antipattern "xxx 不该用 yyy"');
  console.log('  node scripts/feed.mjs <项目> --lesson "xxx 用 yyy 效果好"');
  console.log('（也会自动扫描 .neural/knowledge/ANTIPATTERNS.md）');
}

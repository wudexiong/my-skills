#!/usr/bin/env node
// feed — 项目经验回流（门控版）：经验先进 inbox，达标才进 wiki
// 用法：node scripts/feed.mjs <项目目录> [--antipattern "..."|--lesson "..."|--pattern "..."] [--tags a,b] [--project <名>]
// 门控：自动按三标准判定，不达标就拒绝/标记
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const INBOX = join(SKILLS_ROOT, 'knowledge', 'inbox');
const args = process.argv.slice(2);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const projDir = args.find(a => !a.startsWith('--')) ?? process.cwd();
const project = opt('--project') ?? projDir.split(/[\\/]/).pop();
const tags = (opt('--tags') ?? 'general').split(',').map(t => t.trim());

// 三标准门控（返回 { pass, reasons[] }）
function gate(exp, type) {
  const reasons = [];
  // 标准1：跨任务可复用（启发式：不含项目名/具体表名/一次性文件名）
  const projSpecific = /health-center|dsh-pocket|wdx-dsh-plugins|#d+|specific|this repo|本项目|这个项目/i.test(exp);
  if (projSpecific) reasons.push('❌ 可能项目特有（含项目名/一次性细节）');
  // 标准2：重复出现≥2次（人工/AI 标注；feed 时默认假设1次，需 --repeat 确认）
  if (args.includes('--repeat')) reasons.push('✅ 已确认重复≥2次');
  else reasons.push('⚠️ 疑似首次出现（用 --repeat 标记已重复≥2次）');
  // 标准3：稳定不过时（启发式：不含"最新/刚发布/beta"等时效词）
  if (/最新|刚发布|beta|alpha|yesterday|上周/.test(exp)) reasons.push('⚠️ 疑似时效性强，可能过时');
  const pass = !reasons.some(r => r.startsWith('❌'));
  return { pass, reasons };
}

function submit(type, exp) {
  mkdirSync(INBOX, { recursive: true });
  const verdict = gate(exp, type);
  const file = join(INBOX, `${project}-${Date.now()}.md`);
  const content = `# 经验回流（${type}）

**项目**: ${project}
**标签**: ${tags.join(', ')}
**日期**: ${new Date().toISOString().slice(0,10)}

## 经验

${exp}

## 门控判定

${verdict.reasons.join('\n')}

## 状态

${verdict.pass ? 'PENDING-DIGEST（达标，等 digest 编译）' : 'REJECTED（不达标，人工复核）'}
`;
  writeFileSync(file, content, 'utf8');
  console.log('==> 已写入 inbox: ' + file);
  console.log(verdict.reasons.join('\n'));
  if (!verdict.pass) console.log('(!) 未完全达标，人工复核后再决定是否 digest');
  return verdict;
}

const anti = opt('--antipattern');
const lesson = opt('--lesson');
const pattern = opt('--pattern');
if (anti) submit('ANTIPATTERNS', anti);
if (lesson) submit('LESSONS', lesson);
if (pattern) submit('PATTERNS', pattern);
if (!anti && !lesson && !pattern) {
  console.log('用法: node scripts/feed.mjs <项目> [--antipattern "..."|--lesson "..."|--pattern "..."] [--tags a,b] [--repeat]');
  console.log('  --repeat 标记经验已重复出现≥2次（标准2）');
}

#!/usr/bin/env node
// digest — 把 inbox 的原始经验编译进 wiki（AI 辅助执行）
// 用法：node scripts/digest.mjs           # 列出待编译条目
//       node scripts/digest.mjs <id>      # 编译指定条目（AI 提炼后写入 wiki）
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const INBOX = join(SKILLS_ROOT, 'knowledge', 'inbox');
const WIKI = join(SKILLS_ROOT, 'knowledge', 'wiki');
const args = process.argv.slice(2);

function listPending() {
  if (!existsSync(INBOX)) return [];
  return readdirSync(INBOX).filter(f => f.endsWith('.md') && f !== 'README.md');
}

const id = args[0];
if (!id) {
  const pending = listPending();
  console.log('待编译条目:');
  pending.forEach(f => {
    const c = readFileSync(join(INBOX, f), 'utf8');
    const type = c.match(/# 经验回流\（(\w+)\）/)?.[1] ?? '?';
    const exp = c.match(/## 经验\n\n([\s\S]*?)\n\n## 门控/)?.[1] ?? '';
    console.log('  [' + type + '] ' + f + ' — ' + exp.slice(0, 60));
  });
  console.log('\n用法: node scripts/digest.mjs <id>  — AI 提炼后写入 wiki/');
  process.exit(0);
}

// 编译：AI 读条目 → 提炼成一句话 → 追加到 wiki 对应文件
const file = listPending().find(f => f.startsWith(id));
if (!file) { console.error('未找到条目: ' + id); process.exit(1); }
const content = readFileSync(join(INBOX, file), 'utf8');
console.log('=== 待编译条目 ===');
console.log(content);
console.log('=== 请 AI 提炼成一句话（[标签] 经验（来源 日期））后，运行:');
console.log('  node scripts/digest.mjs commit <id> "<提炼后的一句话>"');
process.exit(0);

#!/usr/bin/env node
// skills-update — 一键更新全局技能库（自同步）
//   git pull → 重建 index.json → 校验 junction → 打印版本
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const AGENTS_SKILLS = join(homedir(), '.agents', 'skills');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

console.log('==> 1/4 拉取最新技能库…');
try {
  const out = run('git', ['-C', SKILLS_ROOT, 'pull']);
  console.log(out.trim() || '(已是最新)');
} catch (e) { console.warn('(!) pull 失败: ' + String(e).slice(0, 100)); }

console.log('==> 2/4 重建 index.json…');
try {
  const out = run('node', [join(SKILLS_ROOT, 'scripts', 'reindex.mjs')]);
  console.log(out.trim());
} catch (e) { console.warn('(!) reindex 失败: ' + String(e).slice(0, 100)); }

console.log('==> 3/4 校验全局 junction…');
if (existsSync(AGENTS_SKILLS)) {
  const entries = run('dir', [AGENTS_SKILLS], { shell: true }).trim();
  const n = entries.split('\n').filter(l => l.includes('<JUNCTION>')).length;
  console.log('~/.agents/skills 下 junction 数量: ' + n);
} else {
  console.warn('(!) ~/.agents/skills 不存在，技能未全局部署');
}

console.log('==> 4/4 当前版本…');
try {
  const log = run('git', ['-C', SKILLS_ROOT, 'log', '--oneline', '-1']).trim();
  console.log(log);
} catch { /* ignore */ }

console.log('\n✅ 更新完成。所有项目已通过 junction 自动同步到最新（项目零改动）。');

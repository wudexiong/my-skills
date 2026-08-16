#!/usr/bin/env node
// skills-update — 一键更新全局技能库（自同步 + 上游最新版）
//   1) git pull（我们仓库的更新）
//   2) 按 skills-lock.json 的 source 从上游拉取最新技能（mattpocock/superpowers 等）
//   3) 重建 index.json + 校验 junction
// 用法：node scripts/skills-update.mjs [--force]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const AGENTS_SKILLS = join(homedir(), '.agents', 'skills');
const force = process.argv.includes('--force');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
function sh(args, opts = {}) { return run('git', args, opts); }

console.log('==> 1/5 拉取本仓库最新…');
try { console.log(sh(['-C', SKILLS_ROOT, 'pull']).trim() || '(已是最新)'); } catch (e) { console.warn('(!) pull 失败: ' + String(e).slice(0, 80)); }

console.log('==> 2/5 按 skills-lock 同步上游技能…');
const lockPath = join(SKILLS_ROOT, 'skills-lock.json');
const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : { skills: {} };
const UPSTREAM = {
  'mattpocock/skills': {
    base: 'https://raw.githubusercontent.com/mattpocock/skills/main/skills',
    fetch: async (skillName) => {
      const r = await fetch(`https://raw.githubusercontent.com/mattpocock/skills/main/skills/${skillName}/SKILL.md`);
      return r.ok ? await r.text() : null;
    },
  },
  'obra/superpowers': {
    base: 'https://raw.githubusercontent.com/obra/superpowers/main/skills',
    fetch: async (skillName) => {
      const r = await fetch(`https://raw.githubusercontent.com/obra/superpowers/main/skills/${skillName}/SKILL.md`);
      return r.ok ? await r.text() : null;
    },
  },
};

let updated = 0, failed = [];
const lockSkills = Object.entries(lock.skills ?? {});
for (const [name, meta] of lockSkills) {
  const source = meta.source;
  const upstream = UPSTREAM[source];
  if (!upstream) continue; // 自研或未知来源跳过
  try {
    const latest = await upstream.fetch(name);
    if (latest === null) { failed.push(name + '（上游无此技能）'); continue; }
    const local = existsSync(join(SKILLS_ROOT, name, 'SKILL.md')) ? readFileSync(join(SKILLS_ROOT, name, 'SKILL.md'), 'utf8') : null;
    if (local === latest && !force) continue; // 已最新
    mkdirSync(join(SKILLS_ROOT, name), { recursive: true });
    writeFileSync(join(SKILLS_ROOT, name, 'SKILL.md'), latest, 'utf8');
    // 更新 lock 的 hash
    const { createHash } = await import('node:crypto');
    lock.skills[name].computedHash = createHash('sha256').update(latest).digest('hex').slice(0, 16);
    updated++;
    console.log('   ↑ ' + name + ' 已更新');
  } catch (e) {
    failed.push(name + '（' + String(e.message ?? e).slice(0, 40) + '）');
  }
}
if (updated) writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf8');
console.log(updated ? '   ' + updated + ' 个技能已同步到上游最新' : '   所有技能已是最新');

console.log('==> 3/5 重建 index.json…');
try { console.log(run('node', [join(SKILLS_ROOT, 'scripts', 'reindex.mjs')]).trim()); } catch (e) { console.warn('(!) reindex 失败'); }

console.log('==> 4/5 校验全局 junction…');
if (existsSync(AGENTS_SKILLS)) {
  const entries = run('dir', [AGENTS_SKILLS], { shell: true }).trim();
  const n = entries.split('\n').filter(l => l.includes('<JUNCTION>')).length;
  console.log('junction 数量: ' + n);
} else {
  console.warn('(!) ~/.agents/skills 不存在');
}

console.log('==> 5/5 当前版本…');
try { console.log(sh(['-C', SKILLS_ROOT, 'log', '--oneline', '-1']).trim()); } catch {}

if (failed.length) console.warn('(!) 失败: ' + failed.join('; '));
console.log('\n✅ 更新完成。所有项目已通过 junction 自动同步到最新（项目零改动）。');

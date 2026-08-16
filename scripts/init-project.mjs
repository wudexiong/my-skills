#!/usr/bin/env node
// init-project — 一键创建新项目（自更新模板 + AGENTS.md 指针 + git init + 可选技能/建仓）
// 用法：
//   node scripts/init-project.mjs <项目名> [--dir <路径>] [--skills a,b,c] [--public] [--no-git]
// 特性：
//   - 每次运行先 git pull 技能库 → 永远用最新模板
//   - 项目 AGENTS.md 只写"指针"，引用全局技能库 → 永不漂移
//   - 可选：把技能装进项目 / gh 建仓并推送

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SKILLS_ROOT = process.env.DSH_SKILLS ?? 'D:\\tools\\skills';
const GH_REPO = 'wudexiong/my-skills';

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
function sh(args, opts = {}) { return run('git', args, opts); }

// ---- 解析参数 ----
const argv = process.argv.slice(2);
const name = argv.find(a => !a.startsWith('--'));
if (!name) {
  console.error('用法: node scripts/init-project.mjs <项目名> [--dir <路径>] [--skills a,b,c] [--public] [--no-git]');
  process.exit(1);
}
const flag = (f) => argv.includes(f);
const opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const dir = opt('--dir') ?? process.cwd();
const skillsArg = opt('--skills');
const doGit = !flag('--no-git');
const doGh = flag('--public') || flag('--push');

// ---- 1. 自更新模板 ----
console.log('==> 更新技能库模板…');
try { run('git', ['-C', SKILLS_ROOT, 'pull']); } catch (e) { console.warn('(!) 技能库 pull 失败，使用本地模板继续: ' + String(e).slice(0, 80)); }

// ---- 2. 创建项目 ----
const proj = join(dir, name);
if (existsSync(proj)) { console.error('项目已存在: ' + proj); process.exit(1); }
mkdirSync(proj, { recursive: true });
console.log('==> 创建 ' + proj);

// ---- 3. AGENTS.md（指针式）----
const agentsMd = `# AGENTS.md — 工作区规则（自动同步，勿手动复制内容）

本文件由技能库脚手架生成，是**指针**：规则本体在全局技能库，永远以那边为准。

- 全局技能库：${SKILLS_ROOT}（= GitHub ${GH_REPO}），已 junction 到 ~/.agents/skills/，对所有项目生效
- 任务开始前：查 ${SKILLS_ROOT}\\index.json 或 ~/.agents/skills/
- 命中技能 → 直接加载 SKILL.md 使用；没有 → 按 ${SKILLS_ROOT}\\workflows\\preflight.md 查生态/GitHub/npm → 都没有才自研
- 技能库更新：cd ${SKILLS_ROOT} && node scripts/skills-update.mjs（或 git pull）
- 本文件永不更新内容，只跟随全局模板（重新运行 init-project 或手动替换）
`;
writeFileSync(join(proj, 'AGENTS.md'), agentsMd, 'utf8');
console.log('==> AGENTS.md 已生成（指针式）');

// ---- 4. 可选：安装技能到项目 ----
if (skillsArg) {
  for (const s of skillsArg.split(',')) {
    console.log('==> 安装技能 ' + s + ' …');
    try {
      run('npx', ['skills', 'add', GH_REPO, '--skill', s.trim(), '-y'], { cwd: proj });
    } catch (e) {
      console.warn('(!) 技能 ' + s + ' 安装失败: ' + String(e).slice(0, 80) + '（可稍后手动 npx skills add ' + GH_REPO + ' --skill ' + s + '）');
    }
  }
}

// ---- 5. git init + 初始 commit ----
if (doGit) {
  try {
    sh(['init'], { cwd: proj });
    sh(['add', '-A'], { cwd: proj });
    sh(['commit', '-m', 'chore: init ' + name + '（AGENTS.md 指针 + 脚手架生成）'], { cwd: proj });
    console.log('==> git 已初始化并提交');
  } catch (e) {
    console.warn('(!) git 初始化失败: ' + String(e).slice(0, 100));
  }
}

// ---- 6. 可选：gh 建仓并推送 ----
if (doGh) {
  try {
    run('gh', ['repo', 'create', name, '--private', '--source=' + proj, '--push']);
    console.log('==> GitHub 仓库已创建并推送（私有）');
  } catch (e) {
    console.warn('(!) gh 建仓失败: ' + String(e).slice(0, 100));
  }
}

console.log('\n✅ 完成: ' + proj);
console.log('下一步: cd ' + proj + ' && 开始干活（技能已在全局，DSH 自动发现）');

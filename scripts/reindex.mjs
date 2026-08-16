#!/usr/bin/env node
// 扫描仓库内所有 <name>/SKILL.md，解析 frontmatter，生成 index.json
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const skipDirs = new Set(['.git', 'docs', 'workflows', 'inbox', 'scripts', 'node_modules']);

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[kv[1]] = v;
  }
  return out;
}

const skills = [];
for (const dir of readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory() || skipDirs.has(dir.name)) continue;
  const skillFile = join(root, dir.name, 'SKILL.md');
  if (!existsSync(skillFile)) continue;
  const text = readFileSync(skillFile, 'utf8');
  const fm = parseFrontmatter(text);
  skills.push({
    name: fm.name || dir.name,
    description: fm.description || '',
    whenToUse: fm.whenToUse || '',
    tags: [],
    source: '',
    path: dir.name + '/SKILL.md',
  });
}
skills.sort((a, b) => a.name.localeCompare(b.name));
const index = {
  version: 1,
  updatedAt: new Date().toISOString().slice(0, 10),
  count: skills.length,
  skills,
};
writeFileSync(join(root, 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log('index.json 已生成：' + skills.length + ' 个技能');

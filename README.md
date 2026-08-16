# my-skills — 个人技能库

个人维护的开源技能库（ZCode/Claude 技能格式）。每个技能自包含：使用指南（SKILL.md）+ 工具代码（scripts/），第一次调用时自动检查环境、安装工具。

## 技能列表

| 技能 | 功能 | 状态 |
|---|---|---|
| [video-to-text](video-to-text/) | 视频链接（抖音为主）→ 完整文字稿 → 知识库入库 | ✅ 可用 |
| [advise-project-approach](advise-project-approach/) | 开工前调研同类项目/权衡/成本，防重复造轮子 | ✅ 可用 |
| [neural-interview](neural-interview/) | 澄清需求 → CONTEXT.md（neural 流程第一步） | ✅ 可用 |
| [neural-plan](neural-plan/) | 需求 → 产品规格 PLAN.md | ✅ 可用 |
| [neural-execute](neural-execute/) | 按规格实现并留证据 EXECUTION.md | ✅ 可用 |
| [neural-review](neural-review/) | 对照验收核查实现 REVIEW.md | ✅ 可用 |
| [neural-address-review](neural-address-review/) | 应用上一轮评审通过的修复 | ✅ 可用 |
| [neural-archive](neural-archive/) | 新鲜度校验并归档已验证功能 | ✅ 可用 |
| [neural-learn](neural-learn/) | 从归档重建项目知识 | ✅ 可用 |
| [neural-help](neural-help/) | neural 工作流路由与启动命令 | ✅ 可用 |
| [gh-cli](gh-cli/) | GitHub CLI 高级用法：代码搜索、workflow 调试、Pages 部署 | ✅ 可用 |
| [github-actions-writer](github-actions-writer/) | GitHub Actions workflow 生成/优化/排障 | ✅ 可用 |

## 总索引（index.json）

`scripts/reindex.mjs` 自动扫描全部技能生成 `index.json`（name/description/来源），供 Agent 快速查询筛选。新增/修改技能后运行：

```bash
node scripts/reindex.mjs
```

## 使用方式

### 方式一：官方 CLI（推荐，标准流程）

本技能库兼容 [skills 官方生态](https://skills.sh/)（`npx skills`），支持发现、选择、安装、更新：

```bash
# 列出仓库里的技能
npx skills add wudexiong/my-skills --list

# 选择安装指定技能（-g 全局，-y 跳过确认）
npx skills add wudexiong/my-skills --skill video-to-text -g -y

# 简写格式
npx skills add wudexiong/my-skills@video-to-text -g -y

# 更新已安装的技能
npx skills update
```

### 方式二：本地 git + junction（本项目使用）

```bash
# 首次（Windows）
git clone https://github.com/wudexiong/my-skills.git D:\tools\skills
mklink /J "C:\Users\Administrator\.agents\skills\video-to-text" "D:\tools\skills\video-to-text"

# 更新技能库
cd D:\tools\skills && git pull
```

技能更新 = `git pull`，junction 链接实时生效，无需其他操作。

## 添加新技能

1. 新建目录 `<技能名>/SKILL.md`（frontmatter: name + description），工具代码放 `<技能名>/scripts/`
2. SKILL.md 必须包含"环境自举"章节：首次调用时如何检查环境、安装依赖（缺什么装什么）
3. 提交推送到本仓库：
   ```bash
   cd D:\tools\skills
   git add <技能名> && git commit -m "add: <技能名>" && git push
   ```
4. 本地建 junction 到 `~/.agents/skills/<技能名>`

## 约定

- 技能必须自包含：不依赖技能目录外的路径（用户明确要求，2026-08-15）
- `scripts/.venv`、`scripts/cookies.txt`、`output/` 不入库（.gitignore 已排除）
- 涉及账号凭证的文件（cookies.txt 等）严禁提交
- 每个技能都要能"自举"：环境缺失时按 SKILL.md 指引自动安装，而不是报错让用户手动装
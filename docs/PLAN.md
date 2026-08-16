# 我的 Skills 知识库 — 规划方案（基于 DSH 原生 Skill 规范）

> 目标：一个跨平台、多端同步、全局自动提示的"我的精选 Skills 仓库"。
> 核心结论：**不需要自造"自动提示"机制** —— DSH 已内置 skill 发现与自动加载，我们只需把仓库结构对齐官方规范。

---

## 1. 你的需求 → 方案映射

| 你的需求 | 解决方案 | 由谁实现 |
|---|---|---|
| 收集精选 Skill，避免遗忘 | 一个 Git 私有仓库作为唯一事实源 | 仓库本身 |
| 多端同步 | GitHub 私有仓库 + 各端 clone/pull | git |
| 全局自动提示（干活时自动找到相关 skill） | 把 skill 放进 `~/.dsh/skills/` 或 `~/.agents/skills/`，DSH 每次会话自动发现并渲染目录 | **DSH 内置** |
| 没找到才新建 | 全局规则：先查 `index.json`，确无匹配才在项目里新建并回写 | 仓库内 `AGENTS.md` / 规则文件 |
| 防重复造轮子 / 公共流程 | `workflows/` 目录沉淀（如 advice-project-approach 流程） | 仓库内容 |
| 全网搜索相关 Skill | 脚本/流程：搜 GitHub 主题 → 候选进 `inbox/` → 审核后收录 | 仓库内脚本 + 审核清单 |
| 新项目快速筛选 | `init-project` 流程：读 `index.json` 按标签/场景过滤推荐 | 仓库内流程 |

---

## 2. 关键认知：DSH 的 Skill 规范（已验证，来自源码）

DSH（DeepSeek Harness）的 `@deepseek-ai/dsh-skill-filesystem` 已实现完整规范：

**发现根目录（按优先级）：**

| 优先级 | 来源 | 路径 | 作用域 |
|---|---|---|---|
| 100 | project-dsh | `<项目根>/.dsh/skills` | 项目 |
| 200 | project-agents | `<项目根>/.agents/skills` | 项目 |
| 300 | custom | `customSkillDirs` 配置 | 自定义 |
| 400 | user-dsh | `~/.dsh/skills`（`$DSH_HOME/skills`） | 用户全局 |
| 500 | user-agents | `~/.agents/skills`（`$DSH_AGENTS_HOME/skills`） | 用户全局 |

**skill 格式：**
- 目录 bundle：`<root>/<skill-name>/SKILL.md`（kebab-case）
- 或平铺单文件：`<root>/<skill-name>.md`
- Frontmatter 必填 `name`、`description`；可选 `whenToUse`、`metadata`、`disable-model-invocation`、`user-invocable`
- 只发现一层（不支持嵌套 `**/SKILL.md`）

**自动提示机制（内置，无需提示词）：**
- 会话开始时，DSH 把发现的 skill 摘要（name + description）渲染进模型目录
- 模型看到描述后，在需要时调用 `skill` 工具加载完整正文
- 项目根 = 最近的 `.git` 祖先目录

**含义：**
1. 我们的仓库克隆到某台机器后，把 `skills/` 目录同步/链接到 `~/.dsh/skills/`（或 `~/.agents/skills/`）即可全局生效；
2. `index.json` 是给 Agent 快速查询的"精简目录"，避免它逐个读 SKILL.md 浪费上下文；
3. 项目内 `AGENTS.md` 声明"先查索引 → 命中加载 → 未命中才新建"的规则。

---

## 3. 仓库结构（最终版）

```
my-skills-repo/
├── README.md                    # 仓库说明 + 快速上手（同步、安装步骤）
├── AGENTS.md                    # 全局规则：任务开始先查 index.json；命中才加载；未命中才新建
├── index.json                   # 机器可读总索引（Agent 优先读取）
├── skills/                      # 已审核精选 skills（对齐 DSH 规范：<name>/SKILL.md）
│   ├── advice-project-approach/
│   │   └── SKILL.md
│   └── neural-archive/
│       └── SKILL.md
├── inbox/                       # 网上发现的候选（未审核，原始 SKILL.md + 来源链接）
├── workflows/                   # 公共流程（防重复造轮子、新项目初始化、收录审核）
├── scripts/
│   ├── reindex.mjs              # 扫描 skills/ → 生成 index.json
│   └── discover.mjs             # 搜 GitHub 主题 → 候选写入 inbox/
└── docs/
    ├── review-checklist.md      # 收录标准（什么 skill 值得进 skills/）
    └── skill-template.md        # 新建 skill 的模板（frontmatter 规范）
```

---

## 4. Skill 元数据规范（index.json 条目 + SKILL.md frontmatter）

每个收录的 skill，其 `SKILL.md` frontmatter 至少包含：

```yaml
---
name: advice-project-approach        # 必填，kebab-case，目录名一致
description: 开工前检查：先查现成方案/组合技能/查论文，避免重复造轮子   # 必填，一句话，模型靠它决定是否加载
whenToUse: 新项目、新功能、技术选型时自动考虑
metadata:
  source: https://github.com/AaravKashyap12/...   # 来源
  author: AaravKashyap12
  install: "npx skills add advice-project-approach"
  tags: [planning, research, reuse]
  rating: 5
  verified_at: 2026-02-XX
  dependencies: []                  # 如 ["neural"]
---
```

**index.json**（由 `reindex.mjs` 自动生成）：

```json
{
  "version": 1,
  "updatedAt": "2026-02-XX",
  "skills": [
    {
      "name": "advice-project-approach",
      "description": "...",
      "tags": ["planning", "research", "reuse"],
      "source": "https://...",
      "author": "AaravKashyap12",
      "install": "npx skills add ...",
      "dependencies": [],
      "rating": 5,
      "whenToUse": "...",
      "path": "skills/advice-project-approach/SKILL.md"
    }
  ]
}
```

---

## 5. 三个核心场景的闭环

### 场景 A：全局自动提示（核心诉求）

```
[每次会话开始]
   DSH 自动扫描 ~/.dsh/skills/ → 渲染全部 skill 摘要到模型目录
        ↓
[Agent 接到任务]
   先读 index.json（或直接看目录摘要）
        ↓
   命中相关 skill？ ──是──→ skill("名字") 加载正文 → 按说明执行
        ↓ 否
   明确需要但没有 → 在项目 .agents/skills/<name>/ 新建 SKILL.md
                     → 审核后回写仓库 skills/ + 重新索引
```

### 场景 B：防重复造轮子（公共流程）

把 `advice-project-approach` 固化成 `workflows/preflight.md`（或直接作为 skill 收录）：

1. 明确任务目标与技术栈
2. 查 `index.json` 是否有直接适用的 skill
3. 查 GitHub/网上是否有现成方案（可组合 2+ 个 skill 时优先组合）
4. 查论文/最新实践（仅当需要）
5. 只有确认没有现成方案，才进入实现/新建 skill

### 场景 C：全网发现（搜 Skill）

```
[定期/按需运行 discover.mjs]
   搜索 GitHub topics: claude-skills, agent-skills, deepseek-skills, awesome-claude-skills
        ↓
   结果写入 inbox/<来源>-<date>/ （原始 SKILL.md + 来源 URL + 作者）
        ↓
[人工/Agent 按 docs/review-checklist.md 审核]
   通过 → 移入 skills/ → 运行 reindex.mjs
   不通过 → 留在 inbox/ 或删除
```

---

## 6. 多端同步（GitHub 私有仓库）

- 仓库 = 唯一事实源：`skills/`、`workflows/`、`index.json`、`inbox/` 全部入库
- 每台机器：`git clone` → 建立同步（`~/.dsh/skills` 指向仓库 `skills/` 的符号链接，或 `git submodule` 引用）
- 新发现/新收录流程统一在仓库里做，`git pull` 后各端生效
- Windows 注意：符号链接需要开发者模式；备选方案是把仓库 `skills/` 复制到 `~/.dsh/skills/`（加同步脚本）

---

## 7. 待办（下一步）

- [ ] 确认 skill 元数据字段是否满足你的筛选需求（标签体系）
- [ ] 搭建仓库骨架（README / AGENTS.md / index.json / scripts / docs 模板）
- [ ] 收录前 2 个 skill：advice-project-approach、neural-archive
- [ ] 设计 `discover.mjs` 的搜索关键词与审核流程
- [ ] 决定"多端同步"的具体实现（符号链接 vs 复制脚本 vs submodule）

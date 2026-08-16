# 技能生态调研 + 完美组合设计（2026-02）

> 调研方式：firecrawl 实时搜索 + GitHub API + 本地技能库分析
> 结论：社区已验证的组合 = **Grill（盘问）→ SDD（规格）→ Tickets（切片）→ 执行（TDD+子代理）→ Review（审查）**

## 一、调研结论（最新评价/效果）

### Superpowers（obra/superpowers）— 27.2 万 stars ⭐️
- **评价**："The most complete multi-agent development workflow"（Firecrawl 2026 最佳技能榜）
- "One system that owns the whole loop from idea to reviewed code"（DEV 社区）
- 社区认可的流程：结构化提问 → 设计定稿 → 小任务分解 → 子代理执行 + 两阶段审查 → TDD → 合并
- **缺点**：费 token（"can eat up a lot of tokens"）——适合大任务，小任务用不上
- 来源：firecrawl.dev/blog/best-claude-code-skills、dev.to/aws/the-most-popular-ai-coding-skills-right-now

### Matt Pocock / grill-me — 爆款盘问 ⭐️
- **评价**："went viral"，解决最核心痛点：Claude 带着错误假设冲太快
- 完整工作流：setup → grill-with-docs → specs → tickets → implement + code review
- **批评**："9 Things People Get Wrong"、"I stopped using /grill-me for coding"——盘问要适度，别把简单事复杂化
- 来源：github.com/mattpocock/skills、Reddit r/ClaudeAI "Really love the grill-me skill"

### SDD 运动 2026（Spec-Driven Development）— 13.7 万+ stars 合计
- **OpenSpec**（社区评价最高）：最轻量，"Agree before you build"，openspec/changes/<name>/ 隔离每次变更
- GSD / Spec Kit / Taskmaster：各有侧重
- **关键**：SDD 已主流化，我们装的 neural 框架就是 SDD 的一种实现
- 来源：medium.com（GSD vs Spec Kit vs OpenSpec vs Taskmaster）、ranthebuilder.cloud（实测评价）

### 社区验证的组合实践 ⭐️⭐️⭐️
- Reddit r/ClaudeCode：**"use superpowers brainstorming + OpenSpec to build specs + superpowers request code review"**
- Reddit r/opencodeCLI：**"OpenCode + OpenSpec combo, turned out absolutely perfect"**
- 结论：**盘问（grill/brainstorm）→ 规格（OpenSpec/neural）→ 执行+审查（superpowers）** 是被验证的组合

## 二、我们的组合设计："查 → 问 → 定 → 切 → 干 → 审 → 归"

| 步 | 动作 | 技能（来源） | 为什么 |
|---|---|---|---|
| 0 | 入口 | `lifecycle init/adopt` + `setup-matt-pocock-skills`（我们+mattpocock） | 新老项目统一入口，配置 GitHub tracker |
| 1 | 🛡 查 | `preflight`（我们） | 防重复造轮子，你的原始诉求 |
| 2 | ❓ 问 | `grill-with-docs`（mattpocock，community-verified） | 盘问，design tree，出 CONTEXT/ADR |
| 3 | 📋 定 | `to-spec`（mattpocock）/ OpenSpec（SDD 主流） | 对话→规格，先对齐再写码 |
| 4 | ✂️ 切 | `to-tickets`（mattpocock，切 vertical slices） | 切片 → GitHub issues（blocking edges） |
| 5 | 🔨 干 | `implement`+TDD（mattpocock）；任务多时 `subagent-driven-development`（superpowers） | 按 ticket 实现，子代理并行 |
| 6 | 🏁 审 | `code-review`（mattpocock）+ `verification-before-completion`（superpowers） | 双轴审查 + 验证证据 |
| 7 | 🗄 归 | `neural-archive/learn` + lifecycle（neural+我们） | 归档，经验回流种子 |

### 心智负担控制
- **主线记 7 个词**：查→问→定→切→干→审→归
- **选修按需**：triage（外部 issue）、wayfinder（超大项目）、research（调研）、prototype（原型）、systematic-debugging（顽固 bug）、diagnosing-bugs（bug 修复）、dispatching-parallel-agents（纯并行）、github-pr-workflow（PR）
- **不装全家桶**：superpowers 全套太重（费 token），只取精华子集

## 三、来源（供溯源）
- firecrawl.dev/blog/best-claude-code-skills（2026 最佳技能）
- dev.to/aws/the-most-popular-ai-coding-skills-right-now
- github.com/mattpocock/skills + YouTube（Matt Pocock 官方教学 27 万+ views）
- github.com/obra/superpowers（README + stars）
- github.com/Fission-AI/OpenSpec（README）
- Reddit：r/ClaudeAI、r/ClaudeCode、r/opencodeCLI 实测帖
- medium.com/@richardhightower（SDD 工具对比）
- ranthebuilder.cloud（三工具实测）

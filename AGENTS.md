# AGENTS.md — 本仓库的 Agent 工作规则

任何 Agent（包括未来的我）在本仓库或使用本仓库技能时，必须遵守：

## 使用技能前
1. 先读 `index.json`（或 `README.md` 技能列表），查找是否有匹配现有技能
2. 命中 → 直接加载该技能的 `SKILL.md` 使用，**不新建**
3. 未命中且确实需要 → 才允许新建，新建后**必须回写 index.json**

## 新技能收录流程
1. 用 `docs/skill-template.md` 创建 `<技能名>/SKILL.md`
2. frontmatter 必填：`name`（kebab-case，与目录同名）+ `description`（一句话，模型靠它决定是否加载）
3. 技能必须**自包含**：工具代码放 `<技能名>/scripts/`，不依赖目录外路径
4. 必须包含"环境自举"章节：首次调用如何检查环境、自动安装依赖
5. 提交前运行 `node scripts/reindex.mjs` 重新生成 `index.json`

## 防重复造轮子（Preflight）
新功能/新项目开工前，按 `workflows/preflight.md` 检查：
本仓库 → DSH 生态（awesome-dsh-plugin.com）→ GitHub/npm → 通用轮子 → 都没有才自研。

## 提交规范
- 技能变更：`add: <技能名>` / `update: <技能名>`
- 文档变更：`docs: <说明>`

# inbox — 候选技能区（未审核）

网上发现的候选技能放这里，**未审核前不进 skills/**。

## 怎么放
- 每个候选一个子目录或文件：`<来源>-<技能名>.md`，内容包含：
  - 来源 URL / 作者
  - 原始 SKILL.md（或链接）
  - 发现日期
- 也可以只放一个链接 + 一句话说明

## 怎么审
按 `docs/review-checklist.md` 审核：
- 通过 → 移入 `skills/`，跑 `node scripts/reindex.mjs`，更新 README
- 不通过 → 删除或留档

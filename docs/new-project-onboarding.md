# 新项目接入指南（松耦合）

> 目标：新项目 5 分钟接入技能体系，**零复制、零耦合**。
> 原则：技能库是全局的、只读的依赖；项目里只写"引用规则"。

## 原理

```
全局层（一次性部署，跨项目共享）
  wudexiong/my-skills (GitHub)
    └─ D:\tools\skills  ──junction──▶  ~/.agents/skills/   (DSH 用户全局根)
                                                    │
项目层（每个新项目只需做第 2 步）                     │ DSH 自动发现
  <新项目>/AGENTS.md  ──引用──▶  全局技能库规则 ◀──────┘
```

DSH 的 skill 发现会扫 `~/.agents/skills/`（用户全局根），所以**新项目天然能看到所有技能**，不需要安装任何东西。

## 接入步骤

### 第 1 步（一次性，已完成的机器可跳过）
确认全局技能库已部署：
```bash
# 检查 junction 是否在
dir C:\Users\<你>\.agents\skills
# 更新技能库
cd D:\tools\skills && git pull
```

### 第 2 步：新项目根建 AGENTS.md（唯一必做）
把下面 3 条规则贴进去即可，**不要复制任何技能文件进项目**：

```markdown
# 工作区规则
- 任务开始前先查全局技能库：`~/.agents/skills/` 或 `D:\tools\skills\index.json`
- 命中技能 → 直接加载 SKILL.md 使用，不重复造轮子
- 没有 → 先按 `D:\tools\skills\workflows\preflight.md` 查生态/GitHub/npm → 都没有才自研
```

### 第 3 步（可选）：按需把技能装进项目
某个技能想跟随项目仓库走（比如部署到 CI 或团队共享）：
```bash
npx skills add wudexiong/my-skills --skill <技能名> -y
# 只装到本项目 .agents/skills/，不影响全局
```

### 第 4 步：开始干活
- 全局技能：DSH 会话自动发现，模型按需调用 `skill("名字")`
- 项目技能：同样自动发现（项目根 .agents/skills/ 优先级更高）

## 更新与维护

| 场景 | 操作 | 项目要动吗 |
|---|---|---|
| 技能库有新技能/更新 | 全局 `git pull`（D:\tools\skills） | 不用 |
| 项目想锁定某个技能版本 | 第 3 步装进项目 | 项目内有副本 |
| 项目贡献新技能 | 在 D:\tools\skills 添加 → push → 全局 pull | 项目内不用 |

## 解除集成（如果想）

- 删掉项目根的 AGENTS.md 即可，全局技能库不受影响。
- 项目级安装的技能删 `.agents/skills/<名字>` 即可。

# Preflight —— 开工前防重复造轮子检查（必走流程）

> 目标：新功能 / 新项目开工前，先确认"是不是已经有现成轮子"，避免重复造。
> 适用：任何新功能、新项目、新技能（skill）开发。
> 原则：**先查后建**——先本地索引，再生态，最后才自研。

## 检查顺序（自上而下，命中即停）

### 1. 查自己的 Skills 库（index.json）
- 读取 `my-skills-repo/index.json`（或直接看 `.agents/skills/` 目录摘要）
- 命中相关 skill → 直接加载使用，**不新建**

### 2. 查 DSH 生态插件（awesome-dsh-plugin.com/zh）
- 打开 https://awesome-dsh-plugin.com/zh/ ，按关键词搜索（remote/tunnel/mobile/notify/approval/limit 等）
- 命中功能重合的插件 → 记录到对照表，**优先组合使用而非自研**

### 3. 查 GitHub / npm
- 关键词：`deepseek harness plugin <功能>`、`dsh <功能>`、npm 搜 `dsh-*`
- 命中 → 记录来源 URL，进 `inbox/` 待审核

### 4. 查通用轮子（不限于 DSH）
- 隧道：cloudflared / frp / ssh -L
- 二维码：qrcode / qrcode-terminal
- 通知：Telegram / 钉钉 / webhook 等现成通道
- 能调现成工具/库，就不自己实现协议

### 5. 都没找到 → 才自研
- 明确"生态没有、且值得做"后，才开始实现
- 实现后**回写索引/对照表**，下次别人（包括未来的自己）就能查到

## 产出物

每次 Preflight 结束，往 `my-skills-repo/docs/` 或项目 `docs/` 追加一条：
- 日期、目标功能、查到的现成轮子（URL）、决定（复用/组合/自研）、理由

## 与 neural 流程的关系

Preflight 是 `neural-interview` 之前的**前置步骤**：
`preflight（查轮子）→ neural-interview → neural-plan → neural-execute → neural-review → neural-archive`

## 检查清单（速查）

- [ ] index.json / .agents/skills 里有现成 skill？
- [ ] awesome-dsh-plugin.com 有功能重合的插件？
- [ ] GitHub/npm 有 dsh-* 现成实现？
- [ ] 通用工具/库能解决（cloudflared/frp/qrcode…）？
- [ ] 都没有 → 自研，并回写索引

---
name: wdx-init
description: 初始化工作流（新项目/新功能）。封装完整流程：preflight 查轮子 → grill 盘问 → spec 规格 → tickets 切片 → implement 实现 → review 审查。wdx 入口分流到此时加载本技能。
---

# wdx-init — 初始化工作流

新项目 / 新功能 / 新想法从零到交付的**完整流程**。所有细节封装在本技能内，不需要记每一步。

## 前置（一次性）

1. 若仓库未配置：加载 **setup-matt-pocock-skills** —— 配置 issue tracker（默认 GitHub）、triage 标签、domain docs 布局
2. 若项目未初始化脚手架：加载 **lifecycle** 相关（生成 dsh.project.yml + .dsh/generated/）

## 主流程（按序执行，不跳步）

### 🛡 1. 查（Preflight）
加载 **preflight** 技能：先查全局技能库 / DSH 生态 / GitHub / npm / 通用轮子，有没有现成方案。**防重复造轮子**。没有 → 继续。

### ❓ 2. 问（Grill）
加载 **grill-with-docs**（有仓库）或 **grill-me**（无仓库）：
- design tree 一轮轮盘问，每问给推荐答案，等用户确认
- 需要事实（读代码/查文档）由 agent 自己查，不麻烦用户
- 直到共享理解达成

### 📋 3. 定（Spec）
加载 **to-spec**：把盘问共识 → 规格（验收标准、测试 seam、边界），发布到 issue tracker。

### ✂️ 4. 切（Tickets）
加载 **to-tickets**：规格 → 垂直切片 tickets（tracer-bullet，每条声明阻塞边）→ 发布 GitHub Issues（`ready-for-agent` 标签）。**大改动用 expand-contract 序列。**

### 🔨 5. 干（Implement）
加载 **implement** + **tdd**：按 ticket 实现（RED-GREEN-REFACTOR）。任务多/独立时用 **subagent-driven-development** 派子代理。每个 ticket 一个会话，做完即弃上下文。

### 🏁 6. 审（Review）
加载 **code-review**：双轴审查（Standards + Spec）。通过 → 提交。

## 原则
- 一次只走一步，每步先加载对应 SKILL.md
- 需要用户决策的地方：给推荐答案 + 等确认（grilling 模式）
- 小任务可跳过不必要环节（比如单文件修改不需要 tickets）——按需裁剪
- 完成后：关闭对应 issue，状态更新在 GitHub Issues 里自然发生

# my-skills — 个人技能库

个人维护的开源技能库（ZCode/Claude 技能格式）。每个技能自包含：使用指南（SKILL.md）+ 工具代码（scripts/），第一次调用时自动检查环境、安装工具。

## 技能列表

| 技能 | 功能 | 状态 |
|---|---|---|
| [video-to-text](video-to-text/) | 视频链接（抖音为主）→ 完整文字稿 → 知识库入库 | ✅ 可用 |

## 使用方式（本地同步）

技能库 clone 到独立目录，技能目录用 junction 链接到 ZCode 技能发现目录：

```bash
# 首次（Windows，管理员或普通终端均可，junction 不需要管理员）
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

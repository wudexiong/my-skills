---
name: video-to-text
description: 提取视频链接的完整文字稿并分析入库（抖音为主，B站/YouTube 等 yt-dlp 支持的平台也可）。当用户丢来任何视频链接（抖音短链 v.douyin.com、完整链接等）并表示想要"文案/文字稿/内容/讲了什么/提取"时使用——即使没明说"提取"，例如"你看看这个视频讲了啥""帮我把这条视频内容整理一下"。本技能自包含：工具代码随技能分发（scripts/），首次调用时自动检查并安装环境。本项目使用时文字稿输出到项目 data/raw/ 并做知识库入库。
---

# 视频链接 → 文字稿 → 知识库

把用户丢来的视频链接自动转成文字稿，分析提炼后存入知识库。**全程 AI 自己执行，用户只丢链接。**

技能自包含：`scripts/` 里就是工具代码（douyin2text.py + refresh_cookie.py），不需要外部工具目录。

## 环境自举（首次调用时先做）

第一次使用本技能时，按顺序检查环境，缺什么装什么（之后调用直接跳过）：

1. **检查 Python 环境**：`scripts/.venv/Scripts/python.exe` 是否存在？
   没有 → 创建并安装依赖（约 5 分钟，走国内镜像）：
   ```bash
   cd <技能目录>   # 即 scripts/ 的上级目录
   python -m venv scripts/.venv
   scripts/.venv/Scripts/pip install -i https://pypi.tuna.tsinghua.edu.cn/simple yt-dlp faster-whisper playwright
   scripts/.venv/Scripts/python -m playwright install chromium
   ```
2. **检查 cookie**：`scripts/cookies.txt` 是否存在？
   没有 → 运行刷新脚本（**会弹出浏览器窗口几秒，先告诉用户"别管它"**）：
   ```bash
   scripts/.venv/Scripts/python scripts/refresh_cookie.py
   ```
3. **模型**：faster-whisper 首次转写时自动下载（约 0.5G，small 已缓存；需带 HF 镜像环境变量，见下）

## 工作流（四步）

1. **下载 + 转写**：运行主脚本，文字稿输出到目标目录
2. **检查质量**：读文字稿，确认内容完整可读（小模型可能有错别字，正常）
3. **分析提炼**：理解内容 → 总结要点 + 判断"对咱们项目有什么用"
4. **入库**：按 LLM Wiki 模式摄入（见"知识库入库"）

## 核心命令

```bash
cd <技能目录>
# 完整流程：下载 → 转写 → 输出到指定目录（本项目用 data/raw/）
HF_ENDPOINT=https://hf-mirror.com HF_HUB_DISABLE_XET=1 scripts/.venv/Scripts/python scripts/douyin2text.py "<链接>" small --out "D:/project/传统文化/情感博主/data/raw"
```

- 模型参数：`small`（已缓存，默认）| `medium`（更准但更慢，需先下载 ~1.5G）
- 转写速度：3 分钟视频 ≈ 10 分钟（CPU int8），跑后台即可
- 输出：`--out 指定目录/提取-<标题>.md`（视频临时文件自动删除）
- **环境变量必须带**（否则模型下载 401 失败）：
  - `HF_ENDPOINT=https://hf-mirror.com`（HuggingFace 国内镜像）
  - `HF_HUB_DISABLE_XET=1`（禁用 Xet 协议，镜像站不支持）

## 常见问题

### 下载报 "Fresh cookies are needed"（cookie 过期）
cookie 有效期几个月，过期就刷新（弹窗几秒，提前告诉用户"别管它"）：
```bash
scripts/.venv/Scripts/python scripts/refresh_cookie.py
```

### 报 "invalid Netscape format cookies"
cookies.txt 被破坏。删除 `scripts/cookies.txt` 重新刷新即可。

### 下载慢或失败
- 抖音反爬可能升级导致 yt-dlp 暂时失效：先重试一次；还不行用备用方案（见下）
- 平台不支持（小程序链接等）：用豆包 APP 兜底

### 备用方案（流水线失效时）
让用户复制链接丢给豆包 APP（字节自家，对抖音有内部通道），把豆包输出的全文粘贴回来，AI 继续分析入库。

## 知识库入库（LLM Wiki 模式）

每次处理完一份视频，按项目 AGENTS.md 第七节执行：

1. 提炼要点写入 `data/wiki/` 新页面（按内容自然命名，不套预设分类）
2. 更新 `data/wiki/index.md`（加一行摘要链接）
3. 在 `data/wiki/log.md` 追加：`## [日期] ingest | <视频标题>`
4. 在回复里告诉用户：视频讲了什么 + 对咱们项目的价值点

示例（参考已有页面）：`D:\project\传统文化\情感博主\data\wiki\AI博主赛道分析-徐兆猛.md`

## 结构说明

```
video-to-text/
├── SKILL.md           # 本文件（使用指南 + 自举流程）
└── scripts/           # 工具代码（随技能分发）
    ├── douyin2text.py     # 下载+转写（支持 --out、自动加载 cookies.txt）
    ├── refresh_cookie.py  # Playwright 自动获取抖音 cookie
    ├── cookies.txt        # 本地生成，勿提交仓库（.gitignore 排除）
    └── .venv/             # 自举创建，勿提交（.gitignore 排除）
```

**隐私**：cookies.txt 是账号凭证，绝不提交到公开仓库（.gitignore 已排除）。

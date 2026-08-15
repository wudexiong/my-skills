#!/usr/bin/env python
"""视频链接 → 文字稿 工具（抖音/B站/YouTube 等）

用法:
    python douyin2text.py <视频链接> [模型大小] [--out <输出目录>]

模型大小: tiny/base/small/medium/large (默认 small，中文建议 medium)
输出: 默认 <工具目录>/output/提取-<标题>.md（可用 --out 指定），视频文件转写完自动删除
"""
import os
import re
import sys
import time

import yt_dlp
from faster_whisper import WhisperModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, "output")
COOKIES_FILE = os.path.join(BASE_DIR, "cookies.txt")


def sanitize(name: str) -> str:
    """去掉文件名里的非法字符"""
    name = re.sub(r'[\\/:*?"<>|\r\n]+', "_", name)
    return name.strip(" _")[:50] or "视频"


def download(url: str) -> tuple[str, dict]:
    """下载视频，返回 (文件路径, 元信息)"""
    opts = {
        "format": "best",  # 单文件最稳，不需要 ffmpeg 合并
        "outtmpl": os.path.join(OUT_DIR, "tmp_%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": 30,
    }
    # 有 cookies.txt 就带上（抖音等平台需要）
    if os.path.exists(COOKIES_FILE):
        opts["cookiefile"] = COOKIES_FILE
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        path = ydl.prepare_filename(info)
    return path, info


def transcribe(path: str, model_size: str) -> str:
    """语音转文字（CPU int8 模式）"""
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(path, language="zh", vad_filter=True)
    parts = []
    for seg in segments:
        parts.append(seg.text.strip())
    return "\n".join(parts)


def main():
    if len(sys.argv) < 2:
        print("用法: python douyin2text.py <视频链接> [模型大小] [--out <输出目录>]")
        sys.exit(1)
    url = sys.argv[1]
    model_size = "small"
    global OUT_DIR
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--out" and i + 1 < len(args):
            OUT_DIR = args[i + 1]
            i += 2
        else:
            model_size = args[i]
            i += 1

    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"[1/3] 下载视频: {url}")
    t0 = time.time()
    path, info = download(url)
    title = info.get("title") or "视频"
    print(f"      → 完成 ({time.time()-t0:.0f}秒)，标题: {title}")

    print(f"[2/3] 语音转文字（模型: {model_size}）...")
    t0 = time.time()
    text = transcribe(path, model_size)
    print(f"      → 完成 ({time.time()-t0:.0f}秒)，{len(text)} 字")

    out_path = os.path.join(OUT_DIR, f"提取-{sanitize(title)}.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"# {title}\n\n")
        f.write(f"> 来源: {url} ｜ 转写工具: faster-whisper ({model_size})\n\n")
        f.write(text)
    print(f"[3/3] 文字稿已保存: {out_path}")

    os.remove(path)  # 转写完删除视频，不占空间
    print("      视频临时文件已删除")


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""自动获取抖音新鲜 cookie（生成 cookies.txt，供 yt-dlp 使用）

原理：用 Playwright 打开一个真实浏览器窗口访问抖音 → 抖音自动种下 cookie → 导出保存。
不需要登录，不需要人工操作（窗口闪几秒就关）。
"""
import os
import sys
import time

from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIES_FILE = os.path.join(BASE_DIR, "cookies.txt")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")


def to_netscape(c: dict):
    """转成 yt-dlp 需要的 Netscape cookie 格式，只保留抖音相关域"""
    domain = c.get("domain", "")
    name = c.get("name", "")
    expiry = int(c.get("expires", 0) or 0)
    # 过滤：非抖音域、空名字、会话 cookie（expires<=0 解析器会拒绝）
    if not (domain.endswith("douyin.com") or domain.endswith("iesdouyin.com")):
        return None
    if not name or expiry <= 0:
        return None
    secure = "TRUE" if c.get("secure") else "FALSE"
    # Netscape 格式第 2 字段：domain 带前导点（包含子域）为 TRUE
    include_subdomains = "TRUE" if domain.startswith(".") else "FALSE"
    return (f"{domain}\t{include_subdomains}\t{c.get('path', '/')}\t{secure}\t"
            f"{expiry}\t{name}\t{c.get('value')}")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # 有头模式，最不容易被检测
        ctx = browser.new_context(
            user_agent=UA,
            locale="zh-CN",
            viewport={"width": 1280, "height": 800},
        )
        page = ctx.new_page()
        print("[1/2] 打开抖音网页，等待种 cookie ...")
        page.goto("https://www.douyin.com/", timeout=40000, wait_until="domcontentloaded")
        time.sleep(10)  # 让页面脚本跑完，cookie 落地
        cookies = ctx.cookies()
        browser.close()

    lines = ["# Netscape HTTP Cookie File"]
    for c in cookies:
        line = to_netscape(c)
        if line:
            lines.append(line)

    os.makedirs(os.path.dirname(COOKIES_FILE), exist_ok=True)
    with open(COOKIES_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    n = len(lines) - 1
    print(f"[2/2] 完成：保存 {n} 条 cookie → cookies.txt")
    return 0 if n > 0 else 1


if __name__ == "__main__":
    sys.exit(main())

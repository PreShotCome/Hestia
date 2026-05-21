"""
Hestia icon generator — a hearth flame on a warm ember background.

Builds an SVG and renders it to PNG with Playwright (headless Chromium),
following the approach used in plutus-app/generate_icon.py.

Outputs:
  assets/icon.png          1024x1024  launcher / iOS icon (full design)
  assets/adaptive-icon.png 1024x1024  Android adaptive foreground (safe zone)
  assets/splash-icon.png   1024x1024  splash mark (transparent background)

Usage:
  pip install playwright && playwright install chromium
  python scripts/generate_icon.py
"""
import asyncio
import pathlib

DEFS = """
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%"   stop-color="#EE8A4E"/>
      <stop offset="55%"  stop-color="#D4582B"/>
      <stop offset="100%" stop-color="#9E2E26"/>
    </radialGradient>
    <linearGradient id="flameOuter" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%"   stop-color="#FFF3DA"/>
      <stop offset="48%"  stop-color="#F8CE7B"/>
      <stop offset="100%" stop-color="#EC9A3B"/>
    </linearGradient>
    <linearGradient id="flameInner" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%"   stop-color="#FBC163"/>
      <stop offset="55%"  stop-color="#E8743B"/>
      <stop offset="100%" stop-color="#BE4A28"/>
    </linearGradient>
    <radialGradient id="ember" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#FFD98A" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFD98A" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="10" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
"""

# The hearth flame, drawn in the 1024x1024 space, centred horizontally.
FLAME = """
  <g filter="url(#glow)">
    <ellipse cx="512" cy="780" rx="196" ry="60" fill="url(#ember)"/>
    <path fill="url(#flameOuter)" d="
      M512 232
      C 596 360 654 474 640 582
      C 626 700 540 772 512 788
      C 484 772 398 700 384 582
      C 370 474 428 360 512 232 Z"/>
    <path fill="url(#flameInner)" d="
      M512 388
      C 562 470 592 532 584 596
      C 576 672 530 716 512 728
      C 494 716 448 672 440 596
      C 432 532 462 470 512 388 Z"/>
    <path fill="#FFFBEF" opacity="0.95" d="
      M512 520
      C 540 578 553 620 549 658
      C 545 700 524 720 512 728
      C 500 720 479 700 475 658
      C 471 620 484 578 512 520 Z"/>
  </g>
"""



def svg(body: str) -> str:
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'width="1024" height="1024" viewBox="0 0 1024 1024">'
        f"{DEFS}{body}</svg>"
    )


ICON = svg(f'<rect width="1024" height="1024" rx="220" fill="url(#bg)"/>{FLAME}')

# Adaptive foreground: full-bleed background, flame scaled into the centre
# safe zone so the launcher mask never clips it.
ADAPTIVE = svg(
    '<rect width="1024" height="1024" fill="url(#bg)"/>'
    f'<g transform="translate(512 512) scale(0.74) translate(-512 -512)">{FLAME}</g>'
)

# Splash mark: just the flame, on a transparent background.
SPLASH = svg(FLAME)


async def main() -> None:
    from playwright.async_api import async_playwright

    out = pathlib.Path("assets")
    out.mkdir(exist_ok=True)

    targets = [
        ("icon", ICON, False),
        ("adaptive-icon", ADAPTIVE, False),
        ("splash-icon", SPLASH, True),
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, markup, transparent in targets:
            html = f'<!DOCTYPE html><html><body style="margin:0">{markup}</body></html>'
            tmp = pathlib.Path(f"_icon_{name}.html")
            tmp.write_text(html, encoding="utf-8")
            page = await browser.new_page(viewport={"width": 1024, "height": 1024})
            await page.goto(f"file://{tmp.resolve()}")
            await page.wait_for_timeout(200)
            await page.screenshot(
                path=str(out / f"{name}.png"),
                omit_background=transparent,
                clip={"x": 0, "y": 0, "width": 1024, "height": 1024},
            )
            await page.close()
            tmp.unlink()
            print(f"wrote assets/{name}.png")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())

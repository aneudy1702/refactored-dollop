export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { url, x, y, width = 1280, height = 800 } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const result = await page.evaluate((cx: number, cy: number) => {
      const el = document.elementFromPoint(cx, cy) as HTMLElement | null;
      if (!el) return { selector: 'body', tagName: 'BODY', innerText: '' };

      const tagName = el.tagName;
      let selector = '';

      if (el.id) {
        selector = `#${el.id}`;
      } else if (el.className && typeof el.className === 'string' && el.className.trim()) {
        const classes = el.className.trim().split(/\s+/).map((c: string) => `.${c}`).join('');
        selector = `${tagName.toLowerCase()}${classes}`;
      } else {
        // Build nth-child path
        const parts: string[] = [];
        let current: Element | null = el;
        while (current && current !== document.body) {
          const parent: Element | null = current.parentElement;
          if (!parent) break;
          const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
          const idx = siblings.indexOf(current as Element) + 1;
          parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${idx})`);
          current = parent;
        }
        selector = parts.join(' > ');
      }

      return {
        selector,
        tagName,
        innerText: (el.innerText || '').substring(0, 200),
      };
    }, x, y);

    await browser.close();
    return NextResponse.json(result);
  } catch (err: unknown) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

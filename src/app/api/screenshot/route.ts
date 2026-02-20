export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

type Action = {
  type: 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  delay?: number;
};

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { url, actions = [], width = 1280, height = 800 } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    for (const action of actions as Action[]) {
      if (action.type === 'click' && action.selector) {
        await page.click(action.selector);
      } else if (action.type === 'type' && action.selector && action.value) {
        await page.type(action.selector, action.value);
      } else if (action.type === 'wait') {
        if (action.selector) {
          await page.waitForSelector(action.selector, { timeout: 10000 });
        } else if (action.delay) {
          await new Promise(r => setTimeout(r, action.delay));
        }
      }
    }

    const screenshot = await page.screenshot({ encoding: 'base64', type: 'png' });
    await browser.close();

    return NextResponse.json({ screenshot });
  } catch (err: unknown) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

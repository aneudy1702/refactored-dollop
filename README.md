# SiteCompare

A visual side-by-side comparison tool for websites, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Quick Compare**: Enter two URLs and get a pixel-level diff overlay
- **Scenario Builder**: Save named URL pairs with click/type/wait action sequences
- **Element Inspector**: Click on any part of a screenshot to retrieve the CSS selector

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Puppeteer](https://pptr.dev/) for headless browser screenshots
- [pixelmatch](https://github.com/mapbox/pixelmatch) + [pngjs](https://github.com/pngjs/pngjs) for pixel diffing
- System fonts (sans-serif / monospace)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building

```bash
npm run build
npm start
```

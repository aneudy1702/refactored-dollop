export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export async function POST(req: NextRequest) {
  try {
    const { screenshot1, screenshot2 } = await req.json();

    if (!screenshot1 || !screenshot2) {
      return NextResponse.json({ error: 'Both screenshots are required' }, { status: 400 });
    }

    const buf1 = Buffer.from(screenshot1, 'base64');
    const buf2 = Buffer.from(screenshot2, 'base64');

    const img1 = PNG.sync.read(buf1);
    const img2 = PNG.sync.read(buf2);

    const width = Math.max(img1.width, img2.width);
    const height = Math.max(img1.height, img2.height);

    // Resize images if needed
    const data1 = padImageData(img1, width, height);
    const data2 = padImageData(img2, width, height);

    const diffPng = new PNG({ width, height });
    const pixelCount = pixelmatch(data1, data2, diffPng.data, width, height, {
      threshold: 0.1,
      diffColor: [255, 0, 0],
    });

    const diffBuffer = PNG.sync.write(diffPng);
    const diff = diffBuffer.toString('base64');
    const totalPixels = width * height;
    const diffPercent = parseFloat(((pixelCount / totalPixels) * 100).toFixed(2));

    return NextResponse.json({ diff, pixelCount, totalPixels, diffPercent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function padImageData(img: PNG, width: number, height: number): Buffer {
  if (img.width === width && img.height === height) {
    return img.data as unknown as Buffer;
  }
  const data = Buffer.alloc(width * height * 4, 0);
  for (let y = 0; y < img.height && y < height; y++) {
    for (let x = 0; x < img.width && x < width; x++) {
      const srcIdx = (y * img.width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      data[dstIdx] = img.data[srcIdx];
      data[dstIdx + 1] = img.data[srcIdx + 1];
      data[dstIdx + 2] = img.data[srcIdx + 2];
      data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }
  return data;
}

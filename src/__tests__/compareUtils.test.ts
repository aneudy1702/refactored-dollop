import { PNG } from 'pngjs';

// Re-implement padImageData here since it's a non-exported helper in route.ts
// This tests the core logic of the compare API
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

function makePng(width: number, height: number, fill: number[]): PNG {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = fill[0];
    png.data[i * 4 + 1] = fill[1];
    png.data[i * 4 + 2] = fill[2];
    png.data[i * 4 + 3] = fill[3];
  }
  return png;
}

describe('padImageData', () => {
  it('returns original data when dimensions match', () => {
    const img = makePng(2, 2, [255, 0, 0, 255]);
    const result = padImageData(img, 2, 2);
    expect(result).toBe(img.data);
  });

  it('pads smaller image with zeros on the right and bottom', () => {
    const img = makePng(1, 1, [100, 150, 200, 255]);
    const result = padImageData(img, 2, 2);
    // First pixel (0,0): copied from source
    expect(result[0]).toBe(100);
    expect(result[1]).toBe(150);
    expect(result[2]).toBe(200);
    expect(result[3]).toBe(255);
    // Second pixel (1,0): padded with zeros
    expect(result[4]).toBe(0);
    expect(result[5]).toBe(0);
    expect(result[6]).toBe(0);
    expect(result[7]).toBe(0);
    // Third pixel (0,1): padded with zeros
    expect(result[8]).toBe(0);
    // Fourth pixel (1,1): padded with zeros
    expect(result[12]).toBe(0);
  });

  it('outputs buffer of correct size', () => {
    const img = makePng(2, 3, [10, 20, 30, 40]);
    const result = padImageData(img, 4, 6);
    expect(result.length).toBe(4 * 6 * 4);
  });

  it('correctly copies all pixels from a multi-pixel image', () => {
    const img = makePng(2, 1, [10, 20, 30, 40]);
    // Override second pixel
    img.data[4] = 50;
    img.data[5] = 60;
    img.data[6] = 70;
    img.data[7] = 80;
    const result = padImageData(img, 3, 1);
    // First pixel
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(20);
    expect(result[2]).toBe(30);
    expect(result[3]).toBe(40);
    // Second pixel
    expect(result[4]).toBe(50);
    expect(result[5]).toBe(60);
    expect(result[6]).toBe(70);
    expect(result[7]).toBe(80);
    // Third pixel (padded)
    expect(result[8]).toBe(0);
    expect(result[9]).toBe(0);
    expect(result[10]).toBe(0);
    expect(result[11]).toBe(0);
  });
});

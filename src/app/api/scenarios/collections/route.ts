export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '../db';

export async function GET() {
  try {
    const store = readStore();
    return NextResponse.json(store.collections);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description = '' } = body;
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const store = readStore();
    const collection = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    store.collections.push(collection);
    writeStore(store);
    return NextResponse.json(collection, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

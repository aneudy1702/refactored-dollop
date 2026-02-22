export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '../../db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description } = body;
    const store = readStore();
    const idx = store.collections.findIndex(c => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    store.collections[idx] = {
      ...store.collections[idx],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    };
    writeStore(store);
    return NextResponse.json(store.collections[idx]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const store = readStore();
    const before = store.collections.length;
    store.collections = store.collections.filter(c => c.id !== id);
    if (store.collections.length === before) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    // Also delete all scenarios in this collection
    store.scenarios = store.scenarios.filter(s => s.collectionId !== id);
    writeStore(store);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

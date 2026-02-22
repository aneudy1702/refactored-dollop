export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '../db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, url1, url2, actions, collectionId } = body;
    const store = readStore();
    const idx = store.scenarios.findIndex(s => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }
    store.scenarios[idx] = {
      ...store.scenarios[idx],
      ...(name !== undefined && { name }),
      ...(url1 !== undefined && { url1 }),
      ...(url2 !== undefined && { url2 }),
      ...(actions !== undefined && { actions }),
      ...(collectionId !== undefined && { collectionId }),
    };
    writeStore(store);
    return NextResponse.json(store.scenarios[idx]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const store = readStore();
    const before = store.scenarios.length;
    store.scenarios = store.scenarios.filter(s => s.id !== id);
    if (store.scenarios.length === before) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }
    writeStore(store);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

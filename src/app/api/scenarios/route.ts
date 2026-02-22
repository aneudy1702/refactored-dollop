export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from './db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get('collectionId');
    const store = readStore();
    const scenarios = collectionId
      ? store.scenarios.filter(s => s.collectionId === collectionId)
      : store.scenarios;
    return NextResponse.json(scenarios);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url1, url2, actions = [], collectionId = '' } = body;
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const store = readStore();
    const scenario = {
      id: crypto.randomUUID(),
      name,
      url1: url1 || '',
      url2: url2 || '',
      actions,
      collectionId,
      createdAt: new Date().toISOString(),
    };
    store.scenarios.push(scenario);
    writeStore(store);
    return NextResponse.json(scenario, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

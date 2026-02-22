import fs from 'fs';
import path from 'path';

export type Action = {
  type: 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  delay?: number;
};

export interface Scenario {
  id: string;
  name: string;
  url1: string;
  url2: string;
  actions: Action[];
  collectionId: string;
  createdAt: string;
}

export interface ScenarioCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface ScenarioStore {
  collections: ScenarioCollection[];
  scenarios: Scenario[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'scenarios.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readStore(): ScenarioStore {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return { collections: [], scenarios: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as ScenarioStore;
  } catch {
    return { collections: [], scenarios: [] };
  }
}

export function writeStore(store: ScenarioStore): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * lib/storage.js
 * ==============
 * Persistance locale versionnée via IndexedDB (Dexie).
 * Aucune donnée n'est transmise à un serveur tiers.
 */

import Dexie from 'dexie';

const DB_NAME = 'calculo_db';
const APP_STATE_ID = 'app-state';
const LS_KEY = 'calculo_family_v1';
const SCHEMA_VERSION = 2;

class CalculoDatabase extends Dexie {
  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      appState: 'id,updatedAt',
    });

    this.version(2)
      .stores({
        appState: 'id,updatedAt,schemaVersion',
      })
      .upgrade(async (tx) => {
        await tx.table('appState').toCollection().modify((row) => {
          row.schemaVersion = SCHEMA_VERSION;
        });
      });
  }
}

const db = new CalculoDatabase();

export function defaultState() {
  return {
    annee: '2025',
    selectedMemberId: null,
    members: [],
    vehicles: [],
    formsByYearByMember: {},
  };
}

function sanitizeState(state) {
  const parsed = state || {};
  return {
    ...defaultState(),
    ...parsed,
    members: Array.isArray(parsed.members) ? parsed.members : [],
    vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
    formsByYearByMember: parsed.formsByYearByMember ?? {},
  };
}

async function migrateFromLegacyLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = sanitizeState(JSON.parse(raw));
    await db.table('appState').put({
      id: APP_STATE_ID,
      payload: parsed,
      updatedAt: Date.now(),
      schemaVersion: SCHEMA_VERSION,
    });
    localStorage.removeItem(LS_KEY);
    return parsed;
  } catch (_) {
    return null;
  }
}

export async function restaurerState() {
  try {
    const row = await db.table('appState').get(APP_STATE_ID);
    if (row?.payload) {
      return sanitizeState(row.payload);
    }

    const migrated = await migrateFromLegacyLocalStorage();
    return migrated || defaultState();
  } catch (_) {
    return defaultState();
  }
}

export async function sauvegarderState(state) {
  try {
    await db.table('appState').put({
      id: APP_STATE_ID,
      payload: sanitizeState(state),
      updatedAt: Date.now(),
      schemaVersion: SCHEMA_VERSION,
    });
  } catch (_) {
    /* IndexedDB indisponible (navigation privée stricte, quota dépassé, etc.) */
  }
}

export async function effacerState() {
  try {
    await db.table('appState').delete(APP_STATE_ID);
    localStorage.removeItem(LS_KEY);
  } catch (_) {
    /* rien */
  }
}

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
const SCHEMA_VERSION = 3;

function normalizeDetailedItemsInState(payload) {
  const state = payload || {};
  const formsByYearByMember = { ...(state.formsByYearByMember || {}) };

  Object.keys(formsByYearByMember).forEach((year) => {
    const byMember = { ...(formsByYearByMember[year] || {}) };
    Object.keys(byMember).forEach((memberId) => {
      const form = { ...(byMember[memberId] || {}) };
      form.chargesBureauItems = Array.isArray(form.chargesBureauItems) ? form.chargesBureauItems : [];
      form.chargesDoubleResidenceItems = Array.isArray(form.chargesDoubleResidenceItems) ? form.chargesDoubleResidenceItems : [];
      form.abonnementsBureauItems = Array.isArray(form.abonnementsBureauItems) ? form.abonnementsBureauItems : [];
      form.autresFraisItems = Array.isArray(form.autresFraisItems) ? form.autresFraisItems : [];
      form.prixMaterielItems = Array.isArray(form.prixMaterielItems) ? form.prixMaterielItems : [];
      form.prixEquipementBureauItems = Array.isArray(form.prixEquipementBureauItems) ? form.prixEquipementBureauItems : [];
      byMember[memberId] = form;
    });
    formsByYearByMember[year] = byMember;
  });

  return {
    ...state,
    formsByYearByMember,
  };
}

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

    this.version(3)
      .stores({
        appState: 'id,updatedAt,schemaVersion',
      })
      .upgrade(async (tx) => {
        await tx.table('appState').toCollection().modify((row) => {
          row.payload = normalizeDetailedItemsInState(row.payload);
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
  const normalized = normalizeDetailedItemsInState(parsed);
  return {
    ...defaultState(),
    ...normalized,
    members: Array.isArray(parsed.members) ? parsed.members : [],
    vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
    formsByYearByMember: normalized.formsByYearByMember ?? {},
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

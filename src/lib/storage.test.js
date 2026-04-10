import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { defaultState, effacerState, restaurerState, sauvegarderState } from './storage.js';
import { CONFIG_FISCALE } from '../config/fiscale.js';
import { calculerTransportMultiLignes } from './calculs.js';

describe('Dexie storage - structure et persistance', () => {
  beforeEach(async () => {
    await effacerState();
  });

  it('enregistre et restaure les tableaux items [{label, amount}]', async () => {
    const state = {
      ...defaultState(),
      annee: '2025',
      members: [{ id: 'm1', prenom: 'Alice' }],
      selectedMemberId: 'm1',
      formsByYearByMember: {
        2025: {
          m1: {
            salaire: '50000',
            chargesBureauItems: [{ id: 'i1', label: 'Facture Internet Fibre', amount: 480 }],
            autresFraisItems: [{ id: 'i2', label: 'Fournitures', amount: 120 }],
          },
        },
      },
    };

    await sauvegarderState(state);
    const restored = await restaurerState();

    expect(restored.formsByYearByMember['2025'].m1.chargesBureauItems).toEqual([
      { id: 'i1', label: 'Facture Internet Fibre', amount: 480 },
    ]);
    expect(restored.formsByYearByMember['2025'].m1.autresFraisItems).toEqual([
      { id: 'i2', label: 'Fournitures', amount: 120 },
    ]);
  });

  it('persiste les données détaillées après plusieurs restaurations (simulation refresh)', async () => {
    const state = {
      ...defaultState(),
      annee: '2025',
      members: [{ id: 'm1', prenom: 'Bob' }],
      selectedMemberId: 'm1',
      formsByYearByMember: {
        2025: {
          m1: {
            chargesDoubleResidenceItems: [{ id: 'i1', label: 'EDF', amount: 800 }],
          },
        },
      },
    };

    await sauvegarderState(state);
    const firstRead = await restaurerState();
    const secondRead = await restaurerState();

    expect(firstRead.formsByYearByMember['2025'].m1.chargesDoubleResidenceItems[0].label).toBe('EDF');
    expect(secondRead.formsByYearByMember['2025'].m1.chargesDoubleResidenceItems[0].amount).toBe(800);
  });

  it('persiste le cas 5CV électrique 10 000 km et conserve un calcul à 5954 après refresh', async () => {
    const state = {
      ...defaultState(),
      annee: '2025',
      members: [{ id: 'm1', prenom: 'Eva' }],
      selectedMemberId: 'm1',
      vehicles: [{ id: 've1', nom: 'VE', type: 'voiture', puissance: 5, type_energie: 'electrique' }],
      formsByYearByMember: {
        2025: {
          m1: {
            transportLignes: [
              { id: 'l1', mode: 'forfait', vehicleId: 've1', kmAller: '20', jours: '250' },
            ],
          },
        },
      },
    };

    await sauvegarderState(state);
    const restored = await restaurerState();

    const form = restored.formsByYearByMember['2025'].m1;
    const res = calculerTransportMultiLignes(CONFIG_FISCALE[2025], form.transportLignes, restored.vehicles);
    expect(res.montant).toBe(5954);
  });
});

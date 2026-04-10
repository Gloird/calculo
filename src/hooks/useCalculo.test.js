import { describe, expect, it } from 'vitest';
import { appliquerDepensesDetaillees, supprimerMembreDuStore } from './useCalculo.js';

describe('Intégrité famille - suppression membre', () => {
  it('supprime en cascade les formulaires du membre sur toutes les années', () => {
    const prev = {
      annee: '2025',
      selectedMemberId: 'm1',
      members: [
        { id: 'm1', prenom: 'Alice' },
        { id: 'm2', prenom: 'Bob' },
      ],
      vehicles: [],
      formsByYearByMember: {
        2024: {
          m1: { salaire: '1000' },
          m2: { salaire: '2000' },
        },
        2025: {
          m1: { salaire: '3000', autresFraisItems: [{ id: 'a', label: 'Frais A', amount: 100 }] },
          m2: { salaire: '4000' },
        },
      },
    };

    const next = supprimerMembreDuStore(prev, 'm1');

    expect(next.members.map((m) => m.id)).toEqual(['m2']);
    expect(next.selectedMemberId).toBe('m2');
    expect(next.formsByYearByMember['2024'].m1).toBeUndefined();
    expect(next.formsByYearByMember['2025'].m1).toBeUndefined();
    expect(next.formsByYearByMember['2025'].m2.salaire).toBe('4000');
  });
});

describe('Saisie detaillee - recalcul total', () => {
  it('recalcule le total depuis les lignes (400 + 400 = 800)', () => {
    const base = { autresFrais: '', autresFraisItems: [] };
    const next = appliquerDepensesDetaillees(base, 'autresFrais', [
      { id: 'l1', label: 'Frais A', amount: 400 },
      { id: 'l2', label: 'Frais B', amount: 400 },
    ]);

    expect(next.autresFrais).toBe('800.00');
    expect(next.autresFraisItems).toHaveLength(2);
  });
});

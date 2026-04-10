import { describe, expect, it } from 'vitest';
import { calculBaremeAutomobile, calculBaremeDeuxRoues, calculMontant, getBaremeTranches } from './fiscalEngine.js';

describe('fiscalEngine - conformité JSON stricte', () => {
  it('applique strictement les coefficients 5CV thermique sur 12 000 km', () => {
    const res = calculBaremeAutomobile(12000, 5, false);
    expect(res.montant).toBe(5679);
    expect(res.trancheIndex).toBe(2);
  });

  it('applique strictement les coefficients 5CV électrique sur 12 000 km', () => {
    const res = calculBaremeAutomobile(12000, 5, true);
    expect(res.montant).toBe(6810);
    expect(res.trancheIndex).toBe(2);
  });

  it('applique strictement les coefficients moto 3-5CV sur 4 000 km', () => {
    const res = calculBaremeDeuxRoues(4000, 'moto_plus_50', 5, false);
    expect(res.montant).toBe(1486);
    expect(res.trancheIndex).toBe(2);
  });

  it('respecte les bornes: 5 000 km tombe dans la premiere tranche', () => {
    const tranches = getBaremeTranches('vehicules_thermiques_a_hydrogene_ou_hybrides_automobile_5_cv');
    const res = calculMontant(5000, tranches);
    expect(res.trancheIndex).toBe(1);
    expect(res.montant).toBe(3180);
  });
});

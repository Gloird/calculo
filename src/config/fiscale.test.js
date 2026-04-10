import { describe, expect, it } from 'vitest';
import { CONFIG_FISCALE } from './fiscale.js';

describe('Conformité Service-Public A16343 - barème 2025 gelé', () => {
  it('conserve les coefficients officiels 5 CV (0.636 / 0.357 / 0.427)', () => {
    const tranches = CONFIG_FISCALE[2025].bareme_km[5];
    expect(tranches[0].calc(1000)).toBe(636);
    expect(tranches[1].calc(10000)).toBe(4965); // 10000*0.357 + 1395
    expect(tranches[2].calc(25000)).toBe(10675); // 25000*0.427
  });

  it('garde la majoration électrique à 20% en 2025', () => {
    expect(CONFIG_FISCALE[2025].majorationElectrique).toBe(0.2);
  });
});

/**
 * CONFIG_FISCALE
 * =============
 * Données fiscales officielles pour le calcul des frais professionnels.
 *
 * Sources :
 *  - Abattement 10 % : https://www.service-public.fr/particuliers/vosdroits/F408
 *  - Frais de repas  : https://www.service-public.fr/particuliers/vosdroits/F1981
 *  - Télétravail     : impots.gouv.fr – BOI-RSA-ED-10-60-20
 *  - Barème KM       : Arrêté ministériel (Journal Officiel)
 */
export const CONFIG_FISCALE = {

  // ──────────────────────────────────────────────────────────────
  // ANNÉE 2024 – Revenus déclarés en 2025
  // ──────────────────────────────────────────────────────────────
  2024: {
    annee: 2024,
    declaration: 2025,

    /** Abattement forfaitaire 10 % (source : service-public.fr/F408) */
    abattement: {
      taux:     0.10,
      plancher: 495,    // minimum garanti même si 10 % < plancher
      plafond:  14171,  // maximum même si 10 % > plafond
    },

    /**
     * Frais de repas (source : service-public.fr/F1981)
     * valeurDomicile    : valeur d'un repas pris chez soi (non déductible)
     * plafondDeductible : prix max retenu pour le calcul
     */
    repas: {
      valeurDomicile:    5.35,
      plafondDeductible: 20.20,
    },

    /** Forfait télétravail (impots.gouv.fr) */
    teletravail: {
      tauxJour:      2.70,
      plafondAnnuel: 580.80,
    },

    /** Majoration véhicule 100 % électrique */
    majorationElectrique: 0.10,

    /**
     * Barème kilométrique 2024 (Arrêté ministériel)
     * Tranche 1 : distance totale ≤ 5 000 km
     * Tranche 2 : 5 001 ≤ d ≤ 20 000 km
     * Tranche 3 : d > 20 000 km
     * d = distanceAller × 2 × joursTravailes
     */
    bareme_km: {
      4: [
        { max: 5000,     calc: (d) => d * 0.575 },
        { max: 20000,    calc: (d) => d * 0.323 + 1262 },
        { max: Infinity, calc: (d) => d * 0.387 },
      ],
      5: [
        { max: 5000,     calc: (d) => d * 0.636 },
        { max: 20000,    calc: (d) => d * 0.357 + 1395 },
        { max: Infinity, calc: (d) => d * 0.427 },
      ],
      6: [
        { max: 5000,     calc: (d) => d * 0.665 },
        { max: 20000,    calc: (d) => d * 0.374 + 1457 },
        { max: Infinity, calc: (d) => d * 0.447 },
      ],
    },

    // Barèmes deux-roues (tranches 3 000 / 6 000)
    bareme_2r: {
      cyclo_moins_50: [
        { max: 3000,     calc: (d) => d * 0.315 },
        { max: 6000,     calc: (d) => d * 0.079 + 711 },
        { max: Infinity, calc: (d) => d * 0.198 },
      ],
      // En attente d'un tableau officiel détaillé 1 a 4 CV, ces classes
      // reprennent le barème fourni pour > 5 CV afin de couvrir tous les cas UI.
      moto_plus_50: {
        1: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        2: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        3: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        4: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        5: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
      },
    },
  },

  // ──────────────────────────────────────────────────────────────
  // ANNÉE 2025 – Revenus déclarés en 2026 (Loi de Finances 2026)
  // Référence : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053508155
  // ──────────────────────────────────────────────────────────────
  2025: {
    annee: 2025,
    declaration: 2026,

    abattement: {
      taux:     0.10,
      plancher: 499,
      plafond:  14556,
    },

    repas: {
      valeurDomicile:    5.45,
      plafondDeductible: 21.10,
    },

    teletravail: {
      tauxJour:      2.70,
      plafondAnnuel: 580.80,
    },

    majorationElectrique: 0.20,

    // Barème KM 2025 (thermiques/hybrides)
    bareme_km: {
      4: [
        { max: 5000,     calc: (d) => d * 0.606 },
        { max: 20000,    calc: (d) => d * 0.340 + 1330 },
        { max: Infinity, calc: (d) => d * 0.407 },
      ],
      5: [
        { max: 5000,     calc: (d) => d * 0.636 },
        { max: 20000,    calc: (d) => d * 0.357 + 1395 },
        { max: Infinity, calc: (d) => d * 0.427 },
      ],
      6: [
        { max: 5000,     calc: (d) => d * 0.665 },
        { max: 20000,    calc: (d) => d * 0.374 + 1457 },
        { max: Infinity, calc: (d) => d * 0.447 },
      ],
      7: [
        { max: 5000,     calc: (d) => d * 0.701 },
        { max: 20000,    calc: (d) => d * 0.395 + 1543 },
        { max: Infinity, calc: (d) => d * 0.471 },
      ],
    },

    // Barèmes deux-roues (tranches 3 000 / 6 000)
    bareme_2r: {
      cyclo_moins_50: [
        { max: 3000,     calc: (d) => d * 0.315 },
        { max: 6000,     calc: (d) => d * 0.079 + 711 },
        { max: Infinity, calc: (d) => d * 0.198 },
      ],
      // En attente d'un tableau officiel détaillé 1 a 4 CV, ces classes
      // reprennent le barème fourni pour > 5 CV afin de couvrir tous les cas UI.
      moto_plus_50: {
        1: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        2: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        3: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        4: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
        5: [
          { max: 3000,     calc: (d) => d * 0.455 },
          { max: 6000,     calc: (d) => d * 0.081 + 1123 },
          { max: Infinity, calc: (d) => d * 0.268 },
        ],
      },
    },
  },
};

import { describe, it, expect } from 'vitest';
import { CONFIG_FISCALE } from '../config/fiscale.js';
import {
  calculerAbattement,
  calculerKM,
  calculerKMDeuxRoues,
  calculerRepas,
  calculerTeletravail,
  calculerAmortissement,
  calculerDoubleResidence,
  calculerQuotePartSurface,
  calculerDoubleResidenceEtendue,
  calculerPosteSimple,
  calculerKMMultiVehiculesForfait,
  calculerTransportMultiLignes,
  peutSupprimerVehicule,
} from './calculs.js';
import { distanceAnnuelle } from './geo.js';

const cfg2025 = CONFIG_FISCALE[2025];

// Convertit une distance annuelle cible d en paramètres de la fonction:
// d = distanceAller * 2 * jours
function calculKMDepuisDistanceAnnuelle(d, cv, electrique = false) {
  return calculerKM(cfg2025, d / 2, cv, 1, electrique);
}

describe('Loi de Finances 2026 - Revenus 2025', () => {
  describe('Abattement 10%', () => {
    it('Scénario A (Plancher): salaire 3 000 € => 499 €', () => {
      const res = calculerAbattement(cfg2025, 3000);
      expect(res.montant).toBe(499);
    });

    it('Scénario B (Standard): salaire 50 000 € => 5 000 €', () => {
      const res = calculerAbattement(cfg2025, 50000);
      expect(res.montant).toBe(5000);
    });

    it('Scénario C (Plafond): salaire 200 000 € => 14 556 €', () => {
      const res = calculerAbattement(cfg2025, 200000);
      expect(res.montant).toBe(14556);
    });
  });

  describe('Frais kilométriques 2025', () => {
    it('Voiture 4 CV thermique, 4 000 km => 2 424 €', () => {
      const res = calculKMDepuisDistanceAnnuelle(4000, 4, false);
      expect(res.montant).toBe(2424);
    });

    it('Voiture 5 CV thermique, 6 000 km => 3 537 €', () => {
      const res = calculKMDepuisDistanceAnnuelle(6000, 5, false);
      expect(res.montant).toBe(3537);
    });

    it('Voiture 4 CV électrique, 10 000 km => 5 676 €', () => {
      const res = calculKMDepuisDistanceAnnuelle(10000, 4, true);
      expect(res.montant).toBe(5676);
    });
  });

  describe('Frais de repas 2025', () => {
    it('Scénario Standard: 210 jours, 15 €, TR 3,50 € => 1 270,50 €', () => {
      const res = calculerRepas(cfg2025, 210, 15, 3.5);
      expect(res.montant).toBe(1270.5);
    });

    it('Scénario Plafonné: 200 jours, 25 €, TR 0 => 3 130 €', () => {
      const res = calculerRepas(cfg2025, 200, 25, 0);
      expect(res.montant).toBe(3130);
    });
  });

  describe('Télétravail', () => {
    it('Scénario Max: 230 jours => 580,80 € (plafond appliqué)', () => {
      const res = calculerTeletravail(cfg2025, 230);
      expect(res.montant).toBe(580.8);
    });
  });

  describe('Deux-roues', () => {
    it('Cyclomoteur <= 50 cm3, 4 000 km annuels', () => {
      const res = calculerKMDeuxRoues(cfg2025, 2000, 1, 'cyclo_moins_50', 5, false);
      expect(res.montant).toBe(1027);
    });

    it('Moto > 50 cm3 (5 CV+), 4 000 km annuels', () => {
      const res = calculerKMDeuxRoues(cfg2025, 2000, 1, 'moto_plus_50', 5, false);
      expect(res.montant).toBe(1447);
    });
  });

  describe('Amortissement matériel', () => {
    it('Prix < 500 € => déduction 100%', () => {
      const res = calculerAmortissement(450, 'ordinateur');
      expect(res.montant).toBe(450);
    });

    it('Prix >= 500 € => amortissement 3 ans', () => {
      const res = calculerAmortissement(1500, 'mobilier');
      expect(res.montant).toBe(500);
    });
  });

  describe('Double résidence 2025', () => {
    it('Loyer 600€/mois, 45 semaines, 1 AR/sem (100 km), 5 CV thermique', () => {
      const res = calculerDoubleResidence(cfg2025, {
        loyerMensuel: 600,
        fraisGestion: 0,
        semaines: 45,
        kmArHebdo: 100,
        cv: 5,
        electrique: false,
      });

      // 7 200 + bareme KM voiture 5 CV sur 4 500 km: 4 500 * 0.636 = 2 862
      expect(res.montant).toBe(10062);
    });

    it('Test TDD: Loyer2 + 1 AR train/semaine + taxe habitation2', () => {
      const res = calculerDoubleResidenceEtendue(cfg2025, {
        loyerMensuel: 600,
        taxesAnnexes: 900,
        semaines: 45,
        modeTrajet: 'train',
        trainArHebdo: 80,
      });

      // 7 200 + 900 + (45 * 80)
      expect(res.montant).toBe(11700);
    });
  });

  describe('Tests TDD Ultra-Exhaustifs', () => {
    it('Propriétaire télétravailleur: prorata taxe foncière + électricité + écran 600€ amorti', () => {
      const quotePart = calculerQuotePartSurface({
        surfaceBureau: 12,
        surfaceTotale: 60,
        taxeFonciere: 1500,
        charges: 900,
      });
      const ecran = calculerAmortissement(600, 'ecran');

      // ratio 20% de (1500 + 900) = 480, + amort écran 200
      expect(quotePart.montant).toBe(480);
      expect(ecran.montant).toBe(200);
      expect(quotePart.montant + ecran.montant).toBe(680);
    });

    it('Santé: reste à charge auditif de 400€ pour un enseignant', () => {
      const res = calculerPosteSimple(400, 'Reste à charge auditif');
      expect(res.montant).toBe(400);
    });

    it('Test profil: membre 1 avec Zoe électrique applique la majoration automatiquement', () => {
      const vehicles = [
        { id: 'zoe', nom: 'Zoe', type: 'voiture', puissance: 4, electrique: true },
      ];
      const lignes = [{ vehicleId: 'zoe', kmAller: 20, jours: 250 }]; // 10 000 km annuels
      const res = calculerKMMultiVehiculesForfait(cfg2025, lignes, vehicles);
      expect(res.montant).toBe(5676);
    });

    it('Validation suppression véhicule: interdit si utilisé dans un calcul en cours', () => {
      const lignes = [{ vehicleId: 'v1' }, { vehicleId: 'v2' }];
      expect(peutSupprimerVehicule('v1', lignes)).toBe(false);
      expect(peutSupprimerVehicule('v3', lignes)).toBe(true);
    });

    it('Transport multi-lignes: forfait + reel cumulés', () => {
      const vehicles = [{ id: 'v1', nom: 'Peugeot', type: 'voiture', puissance: 5, electrique: false }];
      const lignes = [
        { mode: 'forfait', vehicleId: 'v1', kmAller: 10, jours: 200 },
        { mode: 'reel', vehicleId: 'v1', carburant: 300, entretien: 100, usageProPercent: 50 },
      ];

      const res = calculerTransportMultiLignes(cfg2025, lignes, vehicles);
      // forfait 4000 km voiture 5CV: 2544 ; réel: (300+100)*50% = 200
      expect(res.montant).toBe(2744);
    });

    it('Validation adresses: 10 km aller × 210 jours = 4 200 km annuels', () => {
      expect(distanceAnnuelle(10, 210)).toBe(4200);
    });
  });
});

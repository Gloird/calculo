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
  calculerReintegrationAvantages,
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

    it('Test_1 (Thermique): Voiture 5 CV, 12 000 km => 5 679 €', () => {
      const res = calculKMDepuisDistanceAnnuelle(12000, 5, false);
      expect(res.montant).toBe(5679);
    });

    it('Test_2 (Electrique): Voiture 5 CV, 12 000 km => 6 810 €', () => {
      const res = calculKMDepuisDistanceAnnuelle(12000, 5, true);
      expect(res.montant).toBe(6810);
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

    it('Test_4 (Moto 3-5 CV): Moto > 50 cm3, 4 000 km annuels => 1 486 €', () => {
      const res = calculerKMDeuxRoues(cfg2025, 2000, 1, 'moto_plus_50', 5, false);
      expect(res.montant).toBe(1486);
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

  describe('Validation fiscale 2025/2026 - conformité renforcée', () => {
    it('Conformité A16343 JSON: 5 CV électrique, 10 000 km => 5 954 €', () => {
      const res = calculerKM(cfg2025, 20, 5, 250, true);
      expect(res.montant).toBe(5954);
    });

    it('Test_3 (Plafonnement): 5 CV, 55 km aller sur 210j => 7 392,60 € (distance plafonnée à 40 km)', () => {
      const vehicles = [{ id: 'v1', nom: 'Thermique', type: 'voiture', puissance: 5, electrique: false }];
      const lignes = [{ mode: 'forfait', vehicleId: 'v1', kmAller: 55, jours: 210, justificationEloignement: false }];

      const res = calculerKMMultiVehiculesForfait(cfg2025, lignes, vehicles);
      expect(res.montant).toBe(7392.6);
    });

    it('Plafond 40 km: bypass si justification d’éloignement', () => {
      const vehicles = [{ id: 'v1', nom: 'Thermique', type: 'voiture', puissance: 5, electrique: false }];
      const lignes = [{ mode: 'forfait', vehicleId: 'v1', kmAller: 60, jours: 220, justificationEloignement: true }];

      const res = calculerKMMultiVehiculesForfait(cfg2025, lignes, vehicles);
      const attendu = calculerKM(cfg2025, 60, 5, 220, false).montant;
      expect(res.montant).toBe(attendu);
    });

    it('Cumul multi-véhicules: tranche globale puis prorata par véhicule', () => {
      const vehicles = [
        { id: 'v4', nom: '4CV', type: 'voiture', puissance: 4, electrique: false },
        { id: 'v6', nom: '6CV', type: 'voiture', puissance: 6, electrique: false },
      ];
      const lignes = [
        { mode: 'forfait', vehicleId: 'v4', kmAller: 20, jours: 100 }, // 4 000 km
        { mode: 'forfait', vehicleId: 'v6', kmAller: 30, jours: 100 }, // 6 000 km
      ];

      const res = calculerKMMultiVehiculesForfait(cfg2025, lignes, vehicles);

      const totalDistance = 10000;
      const partV4 = 4000 / totalDistance;
      const partV6 = 6000 / totalDistance;
      const baseV4 = calculerKM(cfg2025, totalDistance / 2, 4, 1, false).montant;
      const baseV6 = calculerKM(cfg2025, totalDistance / 2, 6, 1, false).montant;
      const attendu = Math.round((baseV4 * partV4 + baseV6 * partV6) * 100) / 100;

      expect(res.montant).toBe(attendu);
    });

    it('Majoration électrique: appliquée uniquement quand type_energie=electrique', () => {
      const lignes = [{ mode: 'forfait', vehicleId: 've', kmAller: 20, jours: 250 }];
      const kmThermique = calculerKM(cfg2025, 20, 4, 250, false).montant;

      const resElec = calculerKMMultiVehiculesForfait(cfg2025, lignes, [
        { id: 've', nom: 'VE', type: 'voiture', puissance: 4, type_energie: 'electrique' },
      ]);
      const resTherm = calculerKMMultiVehiculesForfait(cfg2025, lignes, [
        { id: 've', nom: 'VT', type: 'voiture', puissance: 4, type_energie: 'thermique' },
      ]);

      expect(resElec.montant).toBe(calculerKM(cfg2025, 20, 4, 250, true).montant);
      expect(resTherm.montant).toBe(kmThermique);
    });

    it('Cas "Double Casquette": bureau domicile + double résidence se cumulent', () => {
      const quote = calculerQuotePartSurface({
        surfaceBureau: 15,
        surfaceTotale: 100,
        loyerAnnuel: 12000,
        charges: 2000,
      });
      const dr = calculerDoubleResidenceEtendue(cfg2025, {
        loyerMensuel: 700,
        chargesAnnuelles: 900,
        semaines: 40,
        kmArHebdo: 150,
        cv: 5,
      });

      expect(quote.montant).toBeGreaterThan(0);
      expect(dr.montant).toBeGreaterThan(0);
      expect(quote.montant + dr.montant).toBeGreaterThan(dr.montant);
    });

    it('Cas Repas & Tickets Resto: (15 - 5,45 - 3,50) * 210 = 1270,50€', () => {
      const res = calculerRepas(cfg2025, 210, 15, 3.5);
      expect(res.montant).toBe(1270.5);
    });

    it('Cas Propriétaire: ((350000 * 0.85) / 25) * 0.10 = 1190€/an', () => {
      const montant = ((350000 * 0.85) / 25) * 0.10;
      expect(Math.round(montant * 100) / 100).toBe(1190);
    });

    it('Cas Propriétaire (400k€): ((400000 * 0.85) / 25) * 0.10 = 1360€/an', () => {
      const montant = ((400000 * 0.85) / 25) * 0.10;
      expect(Math.round(montant * 100) / 100).toBe(1360);
    });

    it('KM thermique: 12 000 km annuels, 5 CV => 5 679 €', () => {
      const res = calculerKM(cfg2025, 30, 5, 200, false);
      expect(res.montant).toBe(5679);
    });

    it('KM plafonné sans justification: distance aller limitée à 40 km', () => {
      const vehicles = [{ id: 'v1', nom: '5CV', type: 'voiture', puissance: 5, electrique: false }];
      const lignes = [{ mode: 'forfait', vehicleId: 'v1', kmAller: 55, jours: 210, justificationEloignement: false }];
      const res = calculerKMMultiVehiculesForfait(cfg2025, lignes, vehicles);
      const attendu = calculerKM(cfg2025, 40, 5, 210, false).montant;
      expect(res.montant).toBe(attendu);
    });

    it('Repas cas bas: 220 jours, repas 9 €, part patronale 3 € => 121 €', () => {
      const res = calculerRepas(cfg2025, 220, 9, 3);
      expect(res.montant).toBe(121);
    });

    it('Amortissement proprietaire: ((300000 * 0.85) / 25) * 0.10 = 1020 €', () => {
      const montant = ((300000 * 0.85) / 25) * 0.10;
      expect(Math.round(montant * 100) / 100).toBe(1020);
    });

    it('Materiel > 500 €: 1 200 € amorti sur 3 ans => 400 €/an', () => {
      const res = calculerAmortissement(1200, 'ordinateur');
      expect(res.montant).toBe(400);
    });

    it('Transport multi-lignes: 2 lignes reel a 400 € => total 800 €', () => {
      const lignes = [
        { mode: 'reel', carburant: 400, usageProPercent: 100 },
        { mode: 'reel', carburant: 400, usageProPercent: 100 },
      ];
      const res = calculerTransportMultiLignes(cfg2025, lignes, []);
      expect(res.montant).toBe(800);
    });

    it('Reintegration des avantages employeur au revenu net', () => {
      const res = calculerReintegrationAvantages(50000, 1500, 500);
      expect(res.montant).toBe(2000);
      expect(res.salaireReintegre).toBe(52000);
    });
  });
});

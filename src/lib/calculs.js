/**
 * lib/calculs.js
 * ==============
 * Fonctions de calcul fiscal. Chaque fonction retourne :
 *   { montant: number, detail: string }
 */

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/** Formatte un montant en euros avec la locale fr-FR (ex : 1 234,56 €) */
export function eur(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);
}

/** Arrondit à 2 décimales pour éviter les erreurs de virgule flottante */
export function rond(n) {
  return Math.round((n ?? 0) * 100) / 100;
}

// ─── Calculs fiscaux ─────────────────────────────────────────────────────────

/**
 * [TRANSPORT] Frais kilométriques selon le barème officiel.
 *
 * Étapes :
 *  1. Distance totale annuelle = distanceAller × 2 (AR) × joursTravailes
 *  2. Application du barème par tranche selon la puissance fiscale (CV)
 *  3. Si véhicule électrique : montant × (1 + majorationElectrique)
 *
 * @param {object}  cfg   - paramètres fiscaux de l'année (CONFIG_FISCALE[année])
 * @param {number}  km    - distance aller simple (km)
 * @param {number}  cv    - puissance fiscale (4, 5, 6 ou 7)
 * @param {number}  jours - jours travaillés sur l'année
 * @param {boolean} elec  - true si le véhicule est électrique
 * @returns {{ montant: number, detail: string }}
 */
export function calculerKM(cfg, km, cv, jours, elec) {
  if (!km || !jours) {
    return { montant: 0, detail: 'Distance ou jours non renseignés' };
  }

  // Étape 1 – Distance totale annuelle (aller-retour)
  const dTotal = km * 2 * jours;

  // Étape 2 – Recherche de la tranche applicable
  const tranches = cfg.bareme_km[cv];
  let montantBase = 0;
  let numTranche = 1;
  for (let i = 0; i < tranches.length; i++) {
    if (dTotal <= tranches[i].max) {
      montantBase = tranches[i].calc(dTotal);
      numTranche = i + 1;
      break;
    }
  }

  // Étape 3 – Majoration pour véhicule électrique
  const montantFinal = elec ? montantBase * (1 + cfg.majorationElectrique) : montantBase;
  const coefficientElec = (1 + cfg.majorationElectrique).toFixed(2).replace('.', ',');
  const majStr = elec ? ` × ${coefficientElec} (élec. +${cfg.majorationElectrique * 100}%)` : '';

  const detail =
    `${km} km × 2 × ${jours} j = ${dTotal} km/an` +
    ` · ${cv}CV · Tranche ${numTranche}${majStr}`;

  return { montant: rond(montantFinal), detail };
}

function appliquerBaremeParTranches(tranches, distanceTotale) {
  let montantBase = 0;
  let numTranche = 1;
  for (let i = 0; i < tranches.length; i++) {
    if (distanceTotale <= tranches[i].max) {
      montantBase = tranches[i].calc(distanceTotale);
      numTranche = i + 1;
      break;
    }
  }
  return { montantBase, numTranche };
}

/**
 * [DEUX-ROUES] Calcule les frais KM cyclomoteur/moto selon barèmes dédiés.
 *
 * @param {object} cfg - paramètres fiscaux de l'année
 * @param {number} km - distance aller simple (km)
 * @param {number} jours - jours travaillés/an
 * @param {'cyclo_moins_50'|'moto_plus_50'} categorie
 * @param {number} motoCv - classe CV moto (1..5)
 * @param {boolean} electrique
 * @returns {{ montant: number, detail: string }}
 */
export function calculerKMDeuxRoues(cfg, km, jours, categorie, motoCv, electrique) {
  if (!km || !jours) {
    return { montant: 0, detail: 'Distance ou jours non renseignés' };
  }

  const distanceTotale = km * 2 * jours;
  let tranches;
  let libelle;

  if (categorie === 'cyclo_moins_50') {
    tranches = cfg.bareme_2r.cyclo_moins_50;
    libelle = 'Cyclomoteur ≤ 50 cm3';
  } else {
    const cv = Math.min(Math.max(parseInt(motoCv || 5, 10), 1), 5);
    tranches = cfg.bareme_2r.moto_plus_50[cv];
    libelle = `Moto > 50 cm3 (${cv} CV${cv === 5 ? ' et +' : ''})`;
  }

  const { montantBase, numTranche } = appliquerBaremeParTranches(tranches, distanceTotale);
  const montantFinal = electrique ? montantBase * (1 + cfg.majorationElectrique) : montantBase;
  const coef = (1 + cfg.majorationElectrique).toFixed(2).replace('.', ',');
  const majStr = electrique ? ` × ${coef} (élec. +${cfg.majorationElectrique * 100}%)` : '';
  const detail = `${km} km × 2 × ${jours} j = ${distanceTotale} km/an · ${libelle} · Tranche ${numTranche}${majStr}`;

  return { montant: rond(montantFinal), detail };
}

/**
 * [MATERIEL] Déduction immédiate ou amortissement linéaire 3 ans.
 * @param {number} prix
 * @param {string} type
 * @returns {{ montant: number, detail: string }}
 */
export function calculerAmortissement(prix, type = 'materiel') {
  const p = prix || 0;
  if (!p) return { montant: 0, detail: 'Aucun achat de matériel renseigné' };

  if (p < 500) {
    return {
      montant: rond(p),
      detail: `${type} < 500 € HT: déduction 100 % l'année d'achat`,
    };
  }

  return {
    montant: rond(p / 3),
    detail: `${type} ≥ 500 € HT: amortissement linéaire sur 3 ans (${eur(rond(p / 3))}/an)`,
  };
}

/**
 * [DOUBLE RESIDENCE] Loyer + frais de gestion + 1 AR hebdo (barème KM).
 * @returns {{ montant: number, detail: string }}
 */
export function calculerDoubleResidence(cfg, opts) {
  const {
    loyerMensuel = 0,
    fraisGestion = 0,
    semaines = 0,
    kmArHebdo = 0,
    cv = 5,
    electrique = false,
  } = opts || {};

  const coutLogement = rond((loyerMensuel || 0) * 12 + (fraisGestion || 0));
  const distanceAller = (kmArHebdo || 0) / 2;
  const kmHebdo = kmArHebdo ? calculerKM(cfg, distanceAller, cv, semaines || 0, electrique) : { montant: 0, detail: 'Aucun trajet hebdomadaire' };

  const total = rond(coutLogement + kmHebdo.montant);
  const detail = `Loyer annuel + frais: ${eur(coutLogement)}; Trajets hebdo: ${kmHebdo.detail}`;
  return { montant: total, detail };
}

/**
 * [COTISATION] Compare frais reels vs abattement pour les cotisations syndicales.
 * Crédit d'impôt en abattement: 66 % ; économie en frais réels: cotisation × TMI.
 */
export function comparerCotisationSyndicale(cotisation, tmiPercent) {
  const c = cotisation || 0;
  if (!c) return { message: '', meilleur: null, gain: 0 };

  const tmi = (tmiPercent || 0) / 100;
  const gainFraisReels = rond(c * tmi);
  const gainAbattement = rond(c * 0.66);

  if (gainFraisReels > gainAbattement) {
    return {
      meilleur: 'frais_reels',
      gain: rond(gainFraisReels - gainAbattement),
      message: `Cotisation syndicale: frais réels plus rentable de ${eur(rond(gainFraisReels - gainAbattement))} (hyp. TMI ${tmiPercent}%)`,
    };
  }

  if (gainAbattement > gainFraisReels) {
    return {
      meilleur: 'abattement',
      gain: rond(gainAbattement - gainFraisReels),
      message: `Cotisation syndicale: abattement + crédit d'impôt 66 % plus rentable de ${eur(rond(gainAbattement - gainFraisReels))} (hyp. TMI ${tmiPercent}%)`,
    };
  }

  return {
    meilleur: 'egalite',
    gain: 0,
    message: `Cotisation syndicale: égalité entre les deux options (hyp. TMI ${tmiPercent}%)`,
  };
}

function toPct(value) {
  return Math.min(Math.max((value || 0) / 100, 0), 1);
}

/**
 * [TRANSPORT REEL] Déduction sur factures avec % usage professionnel.
 */
export function calculerTransportReel(opts) {
  const {
    carburant = 0,
    entretien = 0,
    reparations = 0,
    assurance = 0,
    pneus = 0,
    loaLld = 0,
    usageProPercent = 100,
    amortissementAchat = 0,
    plafondCO2 = 0,
    interetsEmprunt = 0,
    parkingBox = 0,
    peages = 0,
  } = opts || {};

  const usage = toPct(usageProPercent);
  const baseFactures = carburant + entretien + reparations + assurance + pneus + loaLld;
  const amortPlafonne = plafondCO2 > 0 ? Math.min(amortissementAchat, plafondCO2) : amortissementAchat;
  const totalBrut = baseFactures + amortPlafonne + interetsEmprunt + parkingBox + peages;
  const total = rond(totalBrut * usage);

  const detail = `(${eur(baseFactures)} + amort. ${eur(amortPlafonne)} + intérêts ${eur(interetsEmprunt)} + parking ${eur(parkingBox)} + péages ${eur(peages)}) × ${Math.round(usage * 100)}%`;
  return { montant: total, detail };
}

/**
 * [TRANSPORT ALTERNATIF] Train, avion, taxi/VTC et mobilité douce.
 */
export function calculerTransportsAlternatifs(opts) {
  const {
    train = 0,
    avion = 0,
    taxiVtc = 0,
    mobiliteDouce = 0,
  } = opts || {};

  const total = rond((train || 0) + (avion || 0) + (taxiVtc || 0) + (mobiliteDouce || 0));
  const detail = `Train ${eur(train)} + Avion ${eur(avion)} + Taxi/VTC ${eur(taxiVtc)} + Mobilité douce ${eur(mobiliteDouce)}`;
  return { montant: total, detail };
}

/**
 * [BUREAU] Quote-part de surface appliquée aux charges logement et abonnements.
 */
export function calculerQuotePartSurface(opts) {
  const {
    surfaceBureau = 0,
    surfaceTotale = 0,
    loyerAnnuel = 0,
    amortissementProprietaire = 0,
    charges = 0,
    taxeFonciere = 0,
    assuranceMultirisque = 0,
    abonnements = 0,
    amenagement = 0,
  } = opts || {};

  if (!surfaceBureau || !surfaceTotale) {
    return { montant: 0, detail: 'Surface bureau/totale non renseignée' };
  }

  const ratio = Math.min(surfaceBureau / surfaceTotale, 1);
  const base =
    (loyerAnnuel || 0) +
    (amortissementProprietaire || 0) +
    (charges || 0) +
    (taxeFonciere || 0) +
    (assuranceMultirisque || 0) +
    (abonnements || 0) +
    (amenagement || 0);

  const montant = rond(base * ratio);
  const detail = `(${eur(base)}) × ratio bureau ${(ratio * 100).toFixed(2)}% (${surfaceBureau}/${surfaceTotale})`;
  return { montant, detail };
}

/**
 * [POSTE SIMPLE] Déduction d'un montant à 100 % avec détail de justification.
 */
export function calculerPosteSimple(montant, libelle) {
  const m = rond(montant || 0);
  return {
    montant: m,
    detail: m > 0 ? `${libelle}: ${eur(m)}` : `Aucun montant pour ${libelle}`,
  };
}

/**
 * [DOUBLE RESIDENCE ETENDUE] Inclut logement + taxes + trajet hebdo famille.
 */
export function calculerDoubleResidenceEtendue(cfg, opts) {
  const {
    loyerMensuel = 0,
    chargesAnnuelles = 0,
    assurance = 0,
    taxesAnnexes = 0,
    fraisAgenceBail = 0,
    fraisDemenagement = 0,
    gardeMeubles = 0,
    semaines = 0,
    kmArHebdo = 0,
    trainArHebdo = 0,
    modeTrajet = 'km',
    cv = 5,
    electrique = false,
  } = opts || {};

  const logement = rond(
    (loyerMensuel || 0) * 12 +
    (chargesAnnuelles || 0) +
    (assurance || 0) +
    (taxesAnnexes || 0) +
    (fraisAgenceBail || 0) +
    (fraisDemenagement || 0) +
    (gardeMeubles || 0)
  );

  let mobilite = { montant: 0, detail: 'Aucun trajet famille renseigné' };
  if (modeTrajet === 'train') {
    mobilite = {
      montant: rond((trainArHebdo || 0) * (semaines || 0)),
      detail: `${semaines} AR × ${eur(trainArHebdo || 0)} (train)`,
    };
  } else if (kmArHebdo > 0 && semaines > 0) {
    mobilite = calculerKM(cfg, (kmArHebdo || 0) / 2, cv, semaines, electrique);
  }

  const total = rond(logement + mobilite.montant);
  const detail = `Logement/frais: ${eur(logement)} + Mobilité: ${mobilite.detail}`;
  return { montant: total, detail };
}

/**
 * [REINTEGRATION AVANTAGES] Ajoute remboursements employeur au revenu net.
 */
export function calculerReintegrationAvantages(salaireNet, indemnitesKmEmployeur, allocationsForfaitaires) {
  const salaire = salaireNet || 0;
  const ik = indemnitesKmEmployeur || 0;
  const alloc = allocationsForfaitaires || 0;
  const totalReintegration = rond(ik + alloc);
  return {
    montant: totalReintegration,
    salaireReintegre: rond(salaire + totalReintegration),
    detail: `${eur(salaire)} + IK employeur ${eur(ik)} + allocations ${eur(alloc)} = ${eur(rond(salaire + totalReintegration))}`,
  };
}

/**
 * [JUSTIFICATIF PDF] Fabrique une ligne de justification standard.
 */
export function creerLigneJustificative(poste, calcul, source) {
  return {
    poste,
    calcul,
    justification: 'Dépense nécessitée par l\'exercice de la profession pour acquérir ou conserver un revenu.',
    source,
  };
}

/**
 * Règle multi-véhicules: somme des distances d'un membre puis prorata par véhicule.
 * Chaque ligne: { vehicleId, kmAller, jours }
 * Chaque véhicule: { id, type, puissance, electrique }
 */
export function calculerKMMultiVehiculesForfait(cfg, lignes, vehicules) {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { montant: 0, detail: 'Aucune ligne transport renseignée' };
  }

  const vehiclesMap = new Map((vehicules || []).map((v) => [v.id, v]));
  const lignesValides = lignes
    .map((l) => {
      const kmAller = Number(l.kmAller || 0);
      const jours = Number(l.jours || 0);
      const veh = vehiclesMap.get(l.vehicleId);
      if (!veh || !kmAller || !jours) return null;
      return {
        ...l,
        veh,
        distanceAnnuelle: kmAller * 2 * jours,
      };
    })
    .filter(Boolean);

  if (lignesValides.length === 0) {
    return { montant: 0, detail: 'Lignes transport incomplètes' };
  }

  const distanceTotale = lignesValides.reduce((s, l) => s + l.distanceAnnuelle, 0);
  let montant = 0;
  const chunks = [];

  for (const ligne of lignesValides) {
    const part = ligne.distanceAnnuelle / distanceTotale;
    let calcVehicule;
    if (ligne.veh.type === 'voiture') {
      calcVehicule = calculerKM(
        cfg,
        distanceTotale / 2,
        Number(ligne.veh.puissance || 4),
        1,
        Boolean(ligne.veh.electrique)
      );
    } else {
      calcVehicule = calculerKMDeuxRoues(
        cfg,
        distanceTotale / 2,
        1,
        ligne.veh.type,
        Number(ligne.veh.puissance || 5),
        Boolean(ligne.veh.electrique)
      );
    }

    const contribution = calcVehicule.montant * part;
    montant += contribution;
    chunks.push(`${ligne.veh.nom}: ${(part * 100).toFixed(1)}% de ${eur(calcVehicule.montant)}`);
  }

  return {
    montant: rond(montant),
    detail: `Distance totale ${Math.round(distanceTotale)} km/an; prorata par véhicule: ${chunks.join(' | ')}`,
  };
}

/**
 * Calcul transport multi-lignes par membre.
 * - Lignes forfait: regroupées et traitées avec prorata multi-véhicules
 * - Lignes réel: calculées ligne par ligne (factures x % usage pro)
 */
export function calculerTransportMultiLignes(cfg, lignes, vehicules) {
  const lignesSafe = Array.isArray(lignes) ? lignes : [];
  const lignesForfait = lignesSafe.filter((l) => (l.mode || 'forfait') === 'forfait');
  const lignesReel = lignesSafe.filter((l) => l.mode === 'reel');

  const forfait = calculerKMMultiVehiculesForfait(cfg, lignesForfait, vehicules);

  let totalReel = 0;
  const detailsReel = [];
  for (const l of lignesReel) {
    const res = calculerTransportReel({
      carburant: Number(l.carburant || 0),
      entretien: Number(l.entretien || 0),
      reparations: Number(l.reparations || 0),
      assurance: Number(l.assurance || 0),
      pneus: Number(l.pneus || 0),
      loaLld: Number(l.loaLld || 0),
      usageProPercent: Number(l.usageProPercent || 100),
      amortissementAchat: Number(l.amortissementAchat || 0),
      plafondCO2: Number(l.plafondCO2 || 0),
      interetsEmprunt: Number(l.interetsEmprunt || 0),
      parkingBox: Number(l.parkingBox || 0),
      peages: Number(l.peages || 0),
    });
    totalReel += res.montant;
    detailsReel.push(res.detail);
  }

  const total = rond((forfait?.montant || 0) + totalReel);
  const detail = [
    lignesForfait.length > 0 ? `Forfait: ${forfait.detail}` : '',
    lignesReel.length > 0 ? `Réel: ${detailsReel.join(' | ')}` : '',
  ].filter(Boolean).join(' || ');

  return {
    montant: total,
    detail: detail || 'Aucune ligne transport renseignée',
  };
}

export function peutSupprimerVehicule(vehicleId, lignesTransport) {
  return !(lignesTransport || []).some((l) => l.vehicleId === vehicleId);
}

/**
 * [REPAS] Frais de repas professionnels déductibles.
 *
 * Formule (art. 83-3° du CGI) :
 *   déductible/repas = MAX(0 ; MIN(prix_payé ; plafond_max) − valeur_domicile − part_patronale_TR)
 *   total            = déductible/repas × nb_jours
 *
 * Source : https://www.service-public.fr/particuliers/vosdroits/F1981
 *
 * @param {object} cfg          - paramètres fiscaux de l'année
 * @param {number} jours        - jours avec repas extérieur
 * @param {number} prix         - prix moyen du repas payé
 * @param {number} partPatronale- part patronale du Ticket-Restaurant (0 si aucun)
 * @returns {{ montant: number, detail: string }}
 */
export function calculerRepas(cfg, jours, prix, partPatronale) {
  if (!jours || !prix) {
    return { montant: 0, detail: 'Jours ou prix de repas non renseignés' };
  }

  // Le prix retenu est plafonné à plafondDeductible (20,20 €)
  const prixRetenu = Math.min(prix, cfg.repas.plafondDeductible);

  // Déductible par repas (ne peut pas être négatif)
  const dedParRepas = Math.max(0, prixRetenu - cfg.repas.valeurDomicile - (partPatronale || 0));
  const total = rond(dedParRepas * jours);

  const detail =
    `(MIN(${eur(prix)}, ${eur(cfg.repas.plafondDeductible)})` +
    ` − ${eur(cfg.repas.valeurDomicile)}` +
    ` − ${eur(partPatronale || 0)})` +
    ` × ${jours} j = ${eur(dedParRepas)}/j × ${jours} j`;

  return { montant: total, detail };
}

/**
 * [TÉLÉTRAVAIL] Forfait télétravail déductible.
 *
 * Barème : 2,70 €/jour dans la limite de 580,80 €/an.
 * Source : impots.gouv.fr – Loi de Finances 2023
 *
 * @param {object} cfg   - paramètres fiscaux de l'année
 * @param {number} jours - nombre de jours en télétravail
 * @returns {{ montant: number, detail: string }}
 */
export function calculerTeletravail(cfg, jours) {
  if (!jours) {
    return { montant: 0, detail: 'Aucun jour de télétravail renseigné' };
  }

  const brut = jours * cfg.teletravail.tauxJour;
  const montant = Math.min(brut, cfg.teletravail.plafondAnnuel);
  const cap = brut > cfg.teletravail.plafondAnnuel;

  const detail =
    `${jours} j × ${eur(cfg.teletravail.tauxJour)} = ${eur(brut)}` +
    (cap ? ` → plafonné à ${eur(cfg.teletravail.plafondAnnuel)}` : '');

  return { montant: rond(montant), detail };
}

/**
 * [ABATTEMENT] Abattement forfaitaire 10 %.
 *
 * Formule :
 *   brut   = salaire × 10 %
 *   final  = MAX(plancher ; MIN(brut ; plafond))
 *
 * Source : https://www.service-public.fr/particuliers/vosdroits/F408
 *
 * @param {object} cfg    - paramètres fiscaux de l'année
 * @param {number} salaire- salaire net imposable annuel
 * @returns {{ montant: number, detail: string }}
 */
export function calculerAbattement(cfg, salaire) {
  if (!salaire) {
    return { montant: 0, detail: 'Salaire non renseigné' };
  }

  const brut = salaire * cfg.abattement.taux;
  const montant = Math.max(cfg.abattement.plancher, Math.min(brut, cfg.abattement.plafond));

  let detail = `${eur(salaire)} × 10 % = ${eur(brut)}`;
  if (brut < cfg.abattement.plancher) {
    detail += ` → plancher appliqué : ${eur(cfg.abattement.plancher)}`;
  } else if (brut > cfg.abattement.plafond) {
    detail += ` → plafond appliqué : ${eur(cfg.abattement.plafond)}`;
  }

  return { montant: rond(montant), detail };
}

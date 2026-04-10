import barems from '../data/barems.json';

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeTranches(rawTranches) {
  return (rawTranches || []).map((row) => ({
    coef1: toNumber(row.coef_1),
    coef2: toNumber(row.coef_2),
    plageDebut: toNumber(row.plage_debut),
    plageFin: row.plage_fin === null ? null : toNumber(row.plage_fin),
  }));
}

const normalizedBaremes = Object.fromEntries(
  Object.entries(barems).map(([key, tranches]) => [key, normalizeTranches(tranches)])
);

function trancheContainsDistance(tranche, distance) {
  const inLowerBound = distance >= tranche.plageDebut;
  const inUpperBound = tranche.plageFin === null ? true : distance <= tranche.plageFin;
  return inLowerBound && inUpperBound;
}

export function calculMontant(distance, tranches) {
  const d = toNumber(distance);
  const list = Array.isArray(tranches) ? tranches : [];
  for (let i = 0; i < list.length; i++) {
    const tranche = list[i];
    if (!trancheContainsDistance(tranche, d)) continue;
    return {
      montant: (d * tranche.coef1) + tranche.coef2,
      trancheIndex: i + 1,
      tranche,
    };
  }
  return { montant: 0, trancheIndex: null, tranche: null };
}

function cvBucketAutomobile(cv) {
  const n = Math.max(1, Math.round(toNumber(cv) || 5));
  if (n <= 3) return '3_cv_et_moins';
  if (n >= 7) return '7_cv_et_plus';
  return `${n}_cv`;
}

function keyAutomobile(cv, electrique) {
  const bucket = cvBucketAutomobile(cv);
  if (electrique) return `vehicules_electriques_automobile_${bucket}`;
  return `vehicules_thermiques_a_hydrogene_ou_hybrides_automobile_${bucket}`;
}

function cvBucketMoto(cv) {
  const n = Math.max(1, Math.round(toNumber(cv) || 5));
  if (n <= 2) return '1_ou_2_cv';
  if (n <= 5) return '3_a_5_cv';
  return 'plus_de_5_cv';
}

function keyDeuxRoues(categorie, motoCv, electrique) {
  if (electrique) {
    if (categorie === 'cyclo_moins_50') return 'vehicules_electriques_cyclomoteur___4_kw_';
    return `vehicules_electriques_motocyclette_plus_4_kw__${cvBucketMoto(motoCv)}`;
  }

  if (categorie === 'cyclo_moins_50') {
    return 'vehicules_thermiques_a_hydrogene_ou_hybrides_deux_roues_moins_50cm3';
  }
  return `vehicules_thermiques_a_hydrogene_ou_hybrides_deux_roues_plus_50cm3_${cvBucketMoto(motoCv)}`;
}

export function getBaremeTranches(key) {
  return normalizedBaremes[key] || [];
}

export function calculBaremeAutomobile(distance, cv, electrique = false) {
  const key = keyAutomobile(cv, electrique);
  const tranches = getBaremeTranches(key);
  return {
    ...calculMontant(distance, tranches),
    key,
  };
}

export function calculBaremeDeuxRoues(distance, categorie, motoCv, electrique = false) {
  const key = keyDeuxRoues(categorie, motoCv, electrique);
  const tranches = getBaremeTranches(key);
  return {
    ...calculMontant(distance, tranches),
    key,
  };
}

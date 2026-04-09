import { useEffect, useMemo, useState } from 'react';
import { CONFIG_FISCALE } from '../config/fiscale.js';
import {
  calculerAbattement,
  calculerAmortissement,
  calculerTransportMultiLignes,
  calculerPosteSimple,
  calculerQuotePartSurface,
  calculerRepas,
  calculerTeletravail,
  comparerCotisationSyndicale,
  calculerDoubleResidenceEtendue,
  calculerReintegrationAvantages,
  creerLigneJustificative,
  rond,
  peutSupprimerVehicule,
} from '../lib/calculs.js';
import { effacerState, restaurerState, sauvegarderState } from '../lib/storage.js';
import { calculerDistanceAutomatique, normalizeAddress } from '../lib/geo.js';

const makeLine = () => ({ id: crypto.randomUUID(), mode: 'forfait', vehicleId: '', kmAller: '', jours: '', carburant: '', entretien: '', reparations: '', assurance: '', pneus: '', loaLld: '', usageProPercent: '100', amortissementAchat: '', plafondCO2: '', interetsEmprunt: '', parkingBox: '', peages: '' });

function caseDeclarationPourIndex(index) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = alphabet[index] || 'Z';
  return `1${letter}K`;
}

const BASE_FORM = {
  salaire: '',
  transportLignes: [makeLine()],
  joursRepas: '',
  prixRepas: '',
  partPatronale: '',
  fraisReception: '',
  receptionParticipants: '',
  receptionMotif: '',
  joursTeletravail: '',
  autresFrais: '',
  loyerMensuelDoubleResidence: '',
  chargesDoubleResidence: '',
  assuranceDoubleResidence: '',
  taxesDoubleResidence: '',
  fraisAgenceDoubleResidence: '',
  fraisGestionDoubleResidence: '',
  semainesDoubleResidence: '',
  kmArDoubleResidence: '',
  modeTrajetDoubleResidence: 'km',
  trainArDoubleResidence: '',
  fraisDemenagement: '',
  gardeMeubles: '',
  prixMateriel: '',
  typeMateriel: 'materiel professionnel',
  surfaceBureau: '',
  surfaceTotale: '',
  loyerAnnuelBureau: '',
  amortissementProprietaireBureau: '',
  chargesBureau: '',
  taxeFonciereBureau: '',
  assuranceBureau: '',
  abonnementsBureau: '',
  amenagementBureau: '',
  prixEquipementBureau: '',
  typeEquipementBureau: 'equipement bureau',
  fraisFormation: '',
  fraisRechercheEmploi: '',
  cotisationSyndicale: '',
  tmi: '30',
  vetementsSpeciaux: '',
  fraisEntretienVetements: '',
  fraisDefenseJuridique: '',
  cotisationsOrdresPrevoyance: '',
  resteSanteProthesesVue: '',
  adaptationPosteHandicap: '',
  visasPasseportsVaccins: '',
  blanchissageHotel: '',
  fraisCompteProAgios: '',
  indemnitesKmEmployeur: '',
  allocationsForfaitairesEmployeur: '',
  geoJustifications: [],
  // ── Détail multi-lignes (tableau [{id, label, amount}]) ──────────────────────
  chargesBureauItems: [],
  chargesDoubleResidenceItems: [],
  abonnementsBureauItems: [],
  autresFraisItems: [],
  prixMaterielItems: [],
  prixEquipementBureauItems: [],
};

function ensureForm(form) {
  const merged = { ...BASE_FORM, ...(form || {}) };
  if (!Array.isArray(merged.transportLignes) || merged.transportLignes.length === 0) {
    merged.transportLignes = [makeLine()];
  }
  return merged;
}

function getForm(store, annee, memberId) {
  return ensureForm(store.formsByYearByMember?.[annee]?.[memberId]);
}

function normalizeWorkplaces(workplaces) {
  if (!Array.isArray(workplaces)) return [];
  return workplaces
    .filter((w) => w && (w.address || w.adresse || '').toString().trim())
    .map((w) => ({
      id: w.id || crypto.randomUUID(),
      address: (w.address || w.adresse || '').toString().trim(),
      frequence: String(w.frequence ?? w.jours ?? ''),
    }));
}

function normalizeStore(restored) {
  if (restored.members.length === 0) {
    const member = {
      id: crypto.randomUUID(),
      prenom: 'Conjoint 1',
      salaireNet: '',
      repasJours: '',
      repasPrix: '',
      partPatronale: '',
      domicileAdresse: '',
      workplaces: [],
    };
    return {
      ...restored,
      members: [member],
      selectedMemberId: member.id,
    };
  }

  const normalizedMembers = restored.members.map((m) => ({
    ...m,
    domicileAdresse: m.domicileAdresse || m.adresseDomicile || m.adresse || '',
    workplaces: normalizeWorkplaces(m.workplaces || m.lieuxTravail || m.workAddresses || []),
  }));

  return {
    ...restored,
    members: normalizedMembers,
    selectedMemberId: restored.selectedMemberId || normalizedMembers[0].id,
  };
}

export function useCalculo() {
  const [store, setStore] = useState(() => normalizeStore({
    annee: '2025',
    selectedMemberId: null,
    members: [],
    vehicles: [],
    formsByYearByMember: {},
  }));
  const [isHydrated, setIsHydrated] = useState(false);

  const annee = store.annee;
  const members = store.members;
  const vehicles = store.vehicles;
  const selectedMemberId = store.selectedMemberId;
  const selectedMember = members.find((m) => m.id === selectedMemberId) || null;
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const restored = await restaurerState();
      if (cancelled) return;
      setStore(normalizeStore(restored));
      setIsHydrated(true);
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void sauvegarderState(store);
  }, [store, isHydrated]);

  const form = useMemo(() => {
    if (!selectedMemberId) return ensureForm(BASE_FORM);
    return getForm(store, annee, selectedMemberId);
  }, [store, annee, selectedMemberId]);

  function patchForm(next) {
    if (!selectedMemberId) return;
    setStore((prev) => {
      const formsByYearByMember = { ...(prev.formsByYearByMember || {}) };
      formsByYearByMember[prev.annee] = { ...(formsByYearByMember[prev.annee] || {}) };
      formsByYearByMember[prev.annee][selectedMemberId] = ensureForm(next);
      return { ...prev, formsByYearByMember };
    });
  }

  function handleChange(e) {
    const { id, value, type, checked } = e.target;
    patchForm({ ...form, [id]: type === 'checkbox' ? checked : value });
  }

  function handleItemsChange(fieldId, items, total) {
    patchForm({
      ...form,
      [`${fieldId}Items`]: items,
      [fieldId]: total > 0 ? String(total.toFixed(2)) : '',
    });
  }

  function handleTransportLineChange(lineId, field, value) {
    const transportLignes = form.transportLignes.map((l) => (l.id === lineId ? { ...l, [field]: value } : l));
    patchForm({ ...form, transportLignes });
  }

  function addTransportLine() {
    patchForm({ ...form, transportLignes: [...form.transportLignes, makeLine()] });
  }

  function removeTransportLine(lineId) {
    const lignes = form.transportLignes.filter((l) => l.id !== lineId);
    patchForm({ ...form, transportLignes: lignes.length ? lignes : [makeLine()] });
  }

  function handleAnneeChange(e) {
    setStore((prev) => ({ ...prev, annee: e.target.value }));
  }

  function addMember(payload) {
    const member = {
      id: crypto.randomUUID(),
      prenom: payload.prenom,
      salaireNet: payload.salaireNet || '',
      repasJours: payload.repasJours || '',
      repasPrix: payload.repasPrix || '',
      partPatronale: payload.partPatronale || '',
      domicileAdresse: payload.domicileAdresse || payload.adresseDomicile || '',
      workplaces: normalizeWorkplaces(payload.workplaces),
    };
    setStore((prev) => ({ ...prev, members: [...prev.members, member], selectedMemberId: member.id }));
    const defaults = ensureForm({
      salaire: payload.salaireNet || '',
      joursRepas: payload.repasJours || '',
      prixRepas: payload.repasPrix || '',
      partPatronale: payload.partPatronale || '',
    });
    setStore((prev) => {
      const formsByYearByMember = { ...(prev.formsByYearByMember || {}) };
      formsByYearByMember[prev.annee] = { ...(formsByYearByMember[prev.annee] || {}) };
      formsByYearByMember[prev.annee][member.id] = defaults;
      return { ...prev, formsByYearByMember };
    });
  }

  function deleteMember(memberId) {
    if (members.length <= 1) return;
    setStore((prev) => {
      const nextMembers = prev.members.filter((m) => m.id !== memberId);
      const formsByYearByMember = { ...(prev.formsByYearByMember || {}) };
      Object.keys(formsByYearByMember).forEach((y) => {
        const perMember = { ...(formsByYearByMember[y] || {}) };
        delete perMember[memberId];
        formsByYearByMember[y] = perMember;
      });
      return {
        ...prev,
        members: nextMembers,
        selectedMemberId: prev.selectedMemberId === memberId ? nextMembers[0]?.id || null : prev.selectedMemberId,
        formsByYearByMember,
      };
    });
  }

  function selectMember(memberId) {
    setStore((prev) => ({ ...prev, selectedMemberId: memberId }));
  }

  function addVehicle(payload) {
    const vehicle = {
      id: crypto.randomUUID(),
      nom: payload.nom,
      type: payload.type,
      puissance: Number(payload.puissance || 5),
      electrique: Boolean(payload.electrique),
      usage: payload.usage || 'proprietaire',
    };
    setStore((prev) => ({ ...prev, vehicles: [...prev.vehicles, vehicle] }));
  }

  function deleteVehicle(vehicleId) {
    const allLignes = Object.values(store.formsByYearByMember || {})
      .flatMap((perMember) => Object.values(perMember || {}))
      .flatMap((f) => f?.transportLignes || []);

    if (!peutSupprimerVehicule(vehicleId, allLignes)) {
      window.alert('Suppression impossible: ce véhicule est utilisé dans un calcul en cours.');
      return;
    }
    setStore((prev) => ({ ...prev, vehicles: prev.vehicles.filter((v) => v.id !== vehicleId) }));
  }

  function updateMember(memberId, payload) {
    const nextPayload = { ...payload };
    if ('workplaces' in nextPayload) {
      nextPayload.workplaces = normalizeWorkplaces(nextPayload.workplaces);
    }
    if ('domicileAdresse' in nextPayload && !nextPayload.domicileAdresse && nextPayload.adresseDomicile) {
      nextPayload.domicileAdresse = nextPayload.adresseDomicile;
    }

    setStore((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, ...nextPayload } : m)),
    }));
  }

  function updateVehicle(vehicleId, payload) {
    setStore((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === vehicleId ? { ...v, ...payload, puissance: Number(payload.puissance ?? v.puissance) } : v)),
    }));
  }

  function resetAll() {
    if (!window.confirm(`Réinitialiser les saisies de ${selectedMember?.prenom || 'ce membre'} pour l'année ${annee} ?`)) return;
    patchForm(ensureForm(BASE_FORM));
  }

  async function remplirDistancesDepuisAdresses() {
    if (!selectedMember) return;
    const domicile = selectedMember.domicileAdresse || selectedMember.adresseDomicile || selectedMember.adresse || '';
    const workplaces = normalizeWorkplaces(selectedMember.workplaces || selectedMember.lieuxTravail || selectedMember.workAddresses || []);
    if (!domicile || workplaces.length === 0) {
      setDistanceError('Renseignez une adresse domicile et au moins un lieu de travail dans le profil membre.');
      return;
    }

    setDistanceError('');
    setDistanceLoading(true);
    try {
      const defaultVehicleId = form.transportLignes.find((l) => l.vehicleId)?.vehicleId || vehicles[0]?.id || '';
      const lignes = [];
      const justifs = [];

      for (const w of workplaces) {
        if (!w.address) continue;
        const dist = await calculerDistanceAutomatique(domicile, w.address);
        const normalizedHome = await normalizeAddress(domicile);
        const normalizedWork = await normalizeAddress(w.address);
        lignes.push({
          ...makeLine(),
          mode: 'forfait',
          vehicleId: defaultVehicleId,
          kmAller: String(dist.oneWayKm),
          jours: String(w.frequence || 0),
        });
        justifs.push(`Distance calculée par itinéraire routier entre ${normalizedHome} et ${normalizedWork} : ${dist.oneWayKm} km.`);
      }

      if (lignes.length === 0) {
        setDistanceError('Aucun trajet valide à calculer.');
        return;
      }

      patchForm({
        ...form,
        transportLignes: lignes,
        geoJustifications: justifs,
      });
    } catch (e) {
      setDistanceError('API indisponible: saisie manuelle de la distance recommandée.');
    } finally {
      setDistanceLoading(false);
    }
  }

  const resultats = useMemo(() => {
    const cfg = CONFIG_FISCALE[parseInt(annee, 10)];
    const salaire = Number(form.salaire || selectedMember?.salaireNet || 0);

    const km = calculerTransportMultiLignes(
      cfg,
      form.transportLignes.map((l) => ({
        mode: l.mode || 'forfait',
        vehicleId: l.vehicleId,
        kmAller: Number(l.kmAller || 0),
        jours: Number(l.jours || 0),
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
      })),
      vehicles
    );

    const repas = calculerRepas(cfg, Number(form.joursRepas || 0), Number(form.prixRepas || 0), Number(form.partPatronale || 0));
    const reception = calculerPosteSimple(Number(form.fraisReception || 0), `Réception (${form.receptionParticipants || 'N/A'})`);
    const tt = calculerTeletravail(cfg, Number(form.joursTeletravail || 0));

    const quotePartBureau = calculerQuotePartSurface({
      surfaceBureau: Number(form.surfaceBureau || 0),
      surfaceTotale: Number(form.surfaceTotale || 0),
      loyerAnnuel: Number(form.loyerAnnuelBureau || 0),
      amortissementProprietaire: Number(form.amortissementProprietaireBureau || 0),
      charges: Number(form.chargesBureau || 0),
      taxeFonciere: Number(form.taxeFonciereBureau || 0),
      assuranceMultirisque: Number(form.assuranceBureau || 0),
      abonnements: Number(form.abonnementsBureau || 0),
      amenagement: Number(form.amenagementBureau || 0),
    });

    const amortissement = calculerAmortissement(Number(form.prixMateriel || 0), form.typeMateriel || 'materiel');
    const amortissementEquipementBureau = calculerAmortissement(Number(form.prixEquipementBureau || 0), form.typeEquipementBureau || 'equipement');

    const doubleResidence = calculerDoubleResidenceEtendue(cfg, {
      loyerMensuel: Number(form.loyerMensuelDoubleResidence || 0),
      chargesAnnuelles: Number(form.chargesDoubleResidence || 0),
      assurance: Number(form.assuranceDoubleResidence || 0),
      taxesAnnexes: Number(form.taxesDoubleResidence || 0),
      fraisAgenceBail: Number(form.fraisAgenceDoubleResidence || 0) + Number(form.fraisGestionDoubleResidence || 0),
      fraisDemenagement: Number(form.fraisDemenagement || 0),
      gardeMeubles: Number(form.gardeMeubles || 0),
      semaines: Number(form.semainesDoubleResidence || 0),
      kmArHebdo: Number(form.kmArDoubleResidence || 0),
      trainArHebdo: Number(form.trainArDoubleResidence || 0),
      modeTrajet: form.modeTrajetDoubleResidence || 'km',
    });

    const demenagement = calculerPosteSimple(Number(form.fraisDemenagement || 0) + Number(form.gardeMeubles || 0), 'Déménagement');
    const formation = calculerPosteSimple(Number(form.fraisFormation || 0), 'Formation');
    const rechercheEmploi = calculerPosteSimple(Number(form.fraisRechercheEmploi || 0), 'Recherche emploi');
    const syndicale = calculerPosteSimple(Number(form.cotisationSyndicale || 0), 'Cotisations syndicales/pro');
    const defenseJuridique = calculerPosteSimple(Number(form.fraisDefenseJuridique || 0), 'Défense juridique');
    const cotisationsObligatoires = calculerPosteSimple(Number(form.cotisationsOrdresPrevoyance || 0), 'Cotisations obligatoires');
    const sante = calculerPosteSimple(Number(form.resteSanteProthesesVue || 0), 'Santé reste à charge');
    const handicap = calculerPosteSimple(Number(form.adaptationPosteHandicap || 0), 'Adaptation handicap');
    const missions = calculerPosteSimple(Number(form.visasPasseportsVaccins || 0) + Number(form.blanchissageHotel || 0), 'Voyages professionnels');
    const banque = calculerPosteSimple(Number(form.fraisCompteProAgios || 0), 'Frais bancaires pro');
    const vetements = calculerPosteSimple(Number(form.vetementsSpeciaux || 0) + Number(form.fraisEntretienVetements || 0), 'Vêtements spéciaux');
    const autres = calculerPosteSimple(Number(form.autresFrais || 0), 'Autres frais');

    const total = rond(
      km.montant + repas.montant + reception.montant + tt.montant + quotePartBureau.montant +
      amortissement.montant + amortissementEquipementBureau.montant + doubleResidence.montant +
      demenagement.montant + formation.montant + rechercheEmploi.montant + syndicale.montant +
      defenseJuridique.montant + cotisationsObligatoires.montant + sante.montant + handicap.montant +
      missions.montant + banque.montant + vetements.montant + autres.montant
    );

    const reintegration = calculerReintegrationAvantages(
      salaire,
      Number(form.indemnitesKmEmployeur || 0),
      Number(form.allocationsForfaitairesEmployeur || 0)
    );

    const abattement = calculerAbattement(cfg, reintegration.salaireReintegre);
    const comparateurSyndical = comparerCotisationSyndicale(Number(form.cotisationSyndicale || 0), Number(form.tmi || 30));

    const justificatifs = [
      creerLigneJustificative('Transport', km.detail, 'BOI-RSA-BASE-30-50 / Loi de Finances 2025 & 2026'),
      creerLigneJustificative('Repas', repas.detail, 'BOI-RSA-BASE-30-50 / Loi de Finances 2025 & 2026'),
      creerLigneJustificative('Double résidence', doubleResidence.detail, 'BOI-RSA-BASE-30-50 / Loi de Finances 2025 & 2026'),
      ...((form.geoJustifications || []).map((g) => creerLigneJustificative('Distance domicile-travail', g, 'API Adresse data.gouv.fr + OSRM'))),
    ];

    return {
      cfg,
      annee: parseInt(annee, 10),
      salaire,
      salaireReintegre: reintegration.salaireReintegre,
      reintegration,
      km,
      transportsAlternatifs: calculerPosteSimple(0, 'Transports alternatifs'),
      repas,
      reception,
      tt,
      quotePartBureau,
      amortissementEquipementBureau,
      doubleResidence,
      demenagement,
      amortissement,
      formation,
      rechercheEmploi,
      syndicale,
      defenseJuridique,
      cotisationsObligatoires,
      sante,
      handicap,
      missions,
      banque,
      vetements,
      autres,
      total,
      abattement,
      justificatifs,
      comparateurSyndical,
      alerteReintegration: reintegration.montant > 0,
      alerteDistance: form.transportLignes.some((l) => Number(l.kmAller || 0) > 40),
    };
  }, [annee, form, selectedMember, vehicles]);

  const foyerRows = useMemo(() => {
    const cfg = CONFIG_FISCALE[parseInt(annee, 10)];
    return members.map((m, idx) => {
      const fm = getForm(store, annee, m.id);
      const km = calculerTransportMultiLignes(
        cfg,
        fm.transportLignes.map((l) => ({
          mode: l.mode || 'forfait',
          vehicleId: l.vehicleId,
          kmAller: Number(l.kmAller || 0),
          jours: Number(l.jours || 0),
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
        })),
        vehicles
      );
      const repas = calculerRepas(cfg, Number(fm.joursRepas || 0), Number(fm.prixRepas || 0), Number(fm.partPatronale || 0));
      const total = rond(km.montant + repas.montant + Number(fm.autresFrais || 0));
      const reintegration = calculerReintegrationAvantages(
        Number(fm.salaire || m.salaireNet || 0),
        Number(fm.indemnitesKmEmployeur || 0),
        Number(fm.allocationsForfaitairesEmployeur || 0)
      );
      const abattement = calculerAbattement(cfg, reintegration.salaireReintegre).montant;
      return {
        memberId: m.id,
        prenom: m.prenom,
        caseDeclaration: caseDeclarationPourIndex(idx),
        total,
        abattement,
        gain: Math.abs(total - abattement),
      };
    });
  }, [annee, members, vehicles, store]);

  function getPdfPayload(mode = 'personne') {
    const base = mode === 'foyer' ? { ...resultats, foyerRows } : resultats;
    return {
      ...base,
      formDetails: {
        chargesBureauItems: form.chargesBureauItems || [],
        chargesDoubleResidenceItems: form.chargesDoubleResidenceItems || [],
        abonnementsBureauItems: form.abonnementsBureauItems || [],
        autresFraisItems: form.autresFraisItems || [],
        prixMaterielItems: form.prixMaterielItems || [],
        prixEquipementBureauItems: form.prixEquipementBureauItems || [],
      },
    };
  }

  return {
    form,
    annee,
    resultats,
    members,
    vehicles,
    selectedMemberId,
    foyerRows,
    handleChange,
    handleAnneeChange,
    addMember,
    deleteMember,
    selectMember,
    addVehicle,
    deleteVehicle,
    updateMember,
    updateVehicle,
    resetAll,
    addTransportLine,
    removeTransportLine,
    handleItemsChange,
    handleTransportLineChange,
    remplirDistancesDepuisAdresses,
    distanceLoading,
    distanceError,
    getPdfPayload,
    clearAllState: effacerState,
  };
}

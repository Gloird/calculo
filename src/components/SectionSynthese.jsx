/**
 * components/SectionSynthese.jsx
 * Affiche la comparaison entre frais réels et abattement 10 %,
 * avec recommandation dynamique et détail de chaque poste.
 */
import { useMemo } from 'react';
import { eur }     from '../lib/calculs.js';

// ─── Carte de recommandation (couleur selon l'option la plus avantageuse) ──────
function RecommandationCard({ total, abattement }) {
  const { wrapClass, textClass, label, gainText } = useMemo(() => {
    if (!total && !abattement) {
      return {
        wrapClass: 'bg-gray-50 border border-gray-200',
        textClass: 'text-gray-400',
        label:     '–',
        gainText:  'Saisissez vos données',
      };
    }
    if (total > abattement) {
      return {
        wrapClass: 'bg-emerald-50 border border-emerald-300',
        textClass: 'text-emerald-700',
        label:     '✅ Frais Réels',
        gainText:  `Gain vs abattement 10 % : +${eur(total - abattement)}`,
      };
    }
    if (abattement > total) {
      return {
        wrapClass: 'bg-indigo-50 border border-indigo-300',
        textClass: 'text-indigo-700',
        label:     '✅ Abattement 10 %',
        gainText:  `Gain vs frais réels : +${eur(abattement - total)}`,
      };
    }
    return {
      wrapClass: 'bg-amber-50 border border-amber-300',
      textClass: 'text-amber-700',
      label:     '⚖️ Égalité',
      gainText:  'Les deux options sont équivalentes',
    };
  }, [total, abattement]);

  return (
    <div className={`${wrapClass} rounded-xl p-4 transition-all duration-300`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
        Option Recommandée
      </p>
      <p className={`text-xl font-extrabold ${textClass}`}>{label}</p>
      <p className={`text-xs font-semibold ${textClass} mt-1 opacity-80`}>{gainText}</p>
    </div>
  );
}

// ─── Ligne de détail d'un poste ────────────────────────────────────────────────
function LigneDetail({ icon, label, montant, detail }) {
  return (
    <div className="flex items-start justify-between py-3 gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-700">
          {icon} {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 break-words">{detail || '–'}</p>
      </div>
      <p className="font-bold text-gray-800 whitespace-nowrap">{eur(montant)}</p>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function SectionSynthese({ resultats }) {
  const {
    total,
    abattement,
    km,
    transportsAlternatifs,
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
    comparateurSyndical,
    alerteReintegration,
    reintegration,
    salaireReintegre,
  } = resultats;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">

      {/* Header de section */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 flex items-center gap-2">
        <span className="text-white text-xl">📊</span>
        <h2 className="text-white font-bold text-lg">Synthèse &amp; Recommandation</h2>
      </div>

      <div className="p-6">

        {/* 3 cartes de comparaison */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
              Frais Réels
            </p>
            <p className="text-3xl font-extrabold text-blue-700">{eur(total)}</p>
            <p className="text-xs text-blue-400 mt-1">Cumul des postes calculés</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
              Abattement Forfaitaire 10 %
            </p>
            <p className="text-3xl font-extrabold text-indigo-700">
              {eur(abattement.montant)}
            </p>
            <p className="text-xs text-indigo-400 mt-1 break-words">
              {abattement.detail || '–'}
            </p>
          </div>

          <RecommandationCard total={total} abattement={abattement.montant} />

        </div>

        {/* Tableau de détail */}
        <div className="border-t border-gray-100 pt-5">
          {alerteReintegration && (
            <div className="mb-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-lg p-3">
              <p className="text-xs text-red-800 font-medium">
                Attention : Déduire ces frais impose de déclarer les remboursements employeur associés comme revenus.
                Réintégration appliquée : {eur(reintegration.montant)}. Salaire réintégré : {eur(salaireReintegre)}.
              </p>
            </div>
          )}

          {comparateurSyndical?.message && (
            <div className="mb-4 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-3">
              <p className="text-xs text-amber-800 font-medium">
                En frais réels, votre cotisation est déduite à 100 %. En abattement 10 %, vous bénéficiez d'un crédit d'impôt de 66 %. {comparateurSyndical.message}
              </p>
            </div>
          )}

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Détail des frais réels
          </h3>
          <div className="divide-y divide-gray-50 text-sm">
            <LigneDetail icon="🚗" label="Transport – Barème kilométrique" montant={km.montant}    detail={km.detail} />
            <LigneDetail icon="🚆" label="Transports alternatifs"           montant={transportsAlternatifs.montant} detail={transportsAlternatifs.detail} />
            <LigneDetail icon="🍽️" label="Repas professionnels"           montant={repas.montant} detail={repas.detail} />
            <LigneDetail icon="🤝" label="Réception pro"                    montant={reception.montant} detail={reception.detail} />
            <LigneDetail icon="🏠" label="Télétravail"                     montant={tt.montant}    detail={tt.detail} />
            <LigneDetail icon="📐" label="Quote-part bureau"                montant={quotePartBureau.montant} detail={quotePartBureau.detail} />
            <LigneDetail icon="🪑" label="Amortissement équipement bureau"  montant={amortissementEquipementBureau.montant} detail={amortissementEquipementBureau.detail} />
            <LigneDetail icon="🏘️" label="Double résidence"                montant={doubleResidence.montant} detail={doubleResidence.detail} />
            <LigneDetail icon="📦" label="Déménagement"                    montant={demenagement.montant} detail={demenagement.detail} />
            <LigneDetail icon="💻" label="Amortissement matériel"          montant={amortissement.montant} detail={amortissement.detail} />
            <LigneDetail icon="🎓" label="Formation"                        montant={formation.montant} detail={formation.detail} />
            <LigneDetail icon="🔎" label="Recherche d'emploi"               montant={rechercheEmploi.montant} detail={rechercheEmploi.detail} />
            <LigneDetail icon="🧾" label="Cotisations syndicales/pro"      montant={syndicale.montant} detail={syndicale.detail} />
            <LigneDetail icon="⚖️" label="Défense juridique"                montant={defenseJuridique.montant} detail={defenseJuridique.detail} />
            <LigneDetail icon="📜" label="Cotisations obligatoires"         montant={cotisationsObligatoires.montant} detail={cotisationsObligatoires.detail} />
            <LigneDetail icon="🩺" label="Santé"                            montant={sante.montant} detail={sante.detail} />
            <LigneDetail icon="♿" label="Handicap"                          montant={handicap.montant} detail={handicap.detail} />
            <LigneDetail icon="✈️" label="Voyages pro"                      montant={missions.montant} detail={missions.detail} />
            <LigneDetail icon="🏦" label="Frais bancaires pro"              montant={banque.montant} detail={banque.detail} />
            <LigneDetail icon="🧥" label="Vêtements spéciaux"              montant={vetements.montant} detail={vetements.detail} />
            <LigneDetail icon="📦" label="Autres frais"                    montant={autres.montant} detail={autres.detail} />
          </div>
        </div>

      </div>
    </div>
  );
}

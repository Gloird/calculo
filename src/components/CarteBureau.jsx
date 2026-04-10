/**
 * components/CarteBureau.jsx
 * Section "Bureau & Autres" organized as direct visible sections.
 */
import { useState } from 'react';
import Card from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';
import DetailedExpenseModal from './ui/DetailedExpenseModal.jsx';

function itemsBadge(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (total <= 0) return null;
  return `${items.length} items · ${total.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} EUR`;
}

function DetailedField({
  id,
  label,
  hint,
  helpText,
  items = [],
  onItemsChange,
  form,
  onChange,
  modalHelp,
  ...rest
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasItems = items.length > 0;
  const computedTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const value = hasItems ? String(computedTotal.toFixed(2)) : form[id];

  function handleDirectChange(e) {
    onItemsChange(id, [], 0);
    onChange(e);
  }

  return (
    <div>
      <InputField
        id={id}
        label={label}
        hint={hint}
        helpText={helpText}
        value={value}
        onChange={handleDirectChange}
        readOnly={hasItems}
        {...rest}
      />
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {hasItems ? `Edit detail (${items.length})` : '+ Add detailed lines'}
        </button>
      </div>
      {modalOpen ? (
        <DetailedExpenseModal
          title={`Detail - ${label}`}
          help={modalHelp}
          items={items}
          onChange={(newItems, total) => onItemsChange(id, newItems, total)}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default function CarteBureau({ form, onChange, onItemsChange }) {
  const items = (field) => form[`${field}Items`] || [];

  return (
    <>
      <Card icon="🏠" iconBg="bg-purple-50 border border-purple-100" title="Logement & Teletravail" subtitle="Bureau a domicile et teletravail">
        <div className="space-y-3">
          {Number(form.joursTeletravail) > 0 ? <p className="hint">{form.joursTeletravail} jours saisis</p> : null}
          <InputField id="joursTeletravail" label="Jours de teletravail / an" hint="2,70 EUR/jour, plafond annuel 580,80 EUR" type="number" min="0" max="365" step="1" value={form.joursTeletravail} onChange={onChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="surfaceBureau" label="Surface bureau (m2)" type="number" min="0" step="0.5" value={form.surfaceBureau} onChange={onChange} />
            <InputField id="surfaceTotale" label="Surface totale logement (m2)" type="number" min="0" step="0.5" value={form.surfaceTotale} onChange={onChange} />
            <InputField id="loyerAnnuelBureau" label="Loyer annuel (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.loyerAnnuelBureau} onChange={onChange} />
            <InputField id="amortissementProprietaireBureau" label="Amortissement proprietaire (EUR)" hint="Formule: (Valeur bien x quote-part surface bureau) / duree fiscale d'amortissement" calculator={{ type: 'amortissement' }} type="number" min="0" step="10" value={form.amortissementProprietaireBureau} onChange={onChange} />
            <DetailedField id="chargesBureau" label="Charges annuelles (EUR)" hint="EDF, eau, gaz, assurance..." calculator={{ type: 'annual' }} type="number" min="0" step="10" items={items('chargesBureau')} onItemsChange={onItemsChange} form={form} onChange={onChange} modalHelp="Saisissez chaque facture en ligne separee." />
            <InputField id="taxeFonciereBureau" label="Taxe fonciere (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.taxeFonciereBureau} onChange={onChange} />
            <InputField id="assuranceBureau" label="Assurance multirisque (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.assuranceBureau} onChange={onChange} />
            <DetailedField id="abonnementsBureau" label="Internet / Mobile (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" items={items('abonnementsBureau')} onItemsChange={onItemsChange} form={form} onChange={onChange} modalHelp="Un poste par abonnement." />
            <InputField id="amenagementBureau" label="Amenagement bureau (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.amenagementBureau} onChange={onChange} />
          </div>
        </div>
      </Card>

      <Card icon="💻" iconBg="bg-indigo-50 border border-indigo-100" title="Equipement & Numerique" subtitle="Materiel, equipement et demenagement">
        <div className="space-y-3">
          {itemsBadge(items('prixMateriel')) || itemsBadge(items('prixEquipementBureau')) ? (
            <p className="hint">{itemsBadge(items('prixMateriel')) || itemsBadge(items('prixEquipementBureau'))}</p>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailedField id="prixMateriel" label="Achat materiel (EUR HT)" hint="<500 EUR deduction, sinon amortissement" calculator={{ type: 'annual' }} type="number" min="0" step="10" items={items('prixMateriel')} onItemsChange={onItemsChange} form={form} onChange={onChange} modalHelp="Un poste par achat." />
            <InputField id="typeMateriel" label="Type de materiel" type="text" value={form.typeMateriel} onChange={onChange} />
            <DetailedField id="prixEquipementBureau" label="Equipement bureau (EUR HT)" calculator={{ type: 'annual' }} type="number" min="0" step="10" items={items('prixEquipementBureau')} onItemsChange={onItemsChange} form={form} onChange={onChange} modalHelp="Un poste par equipement." />
            <InputField id="typeEquipementBureau" label="Type equipement bureau" type="text" value={form.typeEquipementBureau} onChange={onChange} />
            <InputField id="fraisDemenagement" label="Frais de demenagement (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisDemenagement} onChange={onChange} />
            <InputField id="gardeMeubles" label="Garde-meubles (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.gardeMeubles} onChange={onChange} />
          </div>
        </div>
      </Card>

      <Card icon="🎓" iconBg="bg-amber-50 border border-amber-100" title="Carriere & Formation" subtitle="Formation, emploi et juridique">
        <div className="space-y-3">
          {Number(form.fraisFormation) > 0 ? <p className="hint">{Number(form.fraisFormation).toLocaleString('fr-FR')} EUR saisis</p> : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="fraisFormation" label="Formation / abonnements techniques (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisFormation} onChange={onChange} />
            <InputField id="fraisRechercheEmploi" label="Recherche d'emploi (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisRechercheEmploi} onChange={onChange} />
            <InputField id="cotisationSyndicale" label="Cotisations syndicales/pro (EUR)" type="number" min="0" step="10" value={form.cotisationSyndicale} onChange={onChange} />
            <InputField id="tmi" label="TMI estimee (%)" type="number" min="0" max="60" step="1" value={form.tmi} onChange={onChange} />
            <InputField id="fraisDefenseJuridique" label="Defense avocat/huissier (EUR)" type="number" min="0" step="10" value={form.fraisDefenseJuridique} onChange={onChange} />
            <InputField id="cotisationsOrdresPrevoyance" label="Cotisations ordres/prevoyance (EUR)" type="number" min="0" step="10" value={form.cotisationsOrdresPrevoyance} onChange={onChange} />
          </div>
        </div>
      </Card>

      <Card icon="🩺" iconBg="bg-rose-50 border border-rose-100" title="Sante & Specifique" subtitle="Sante, missions et frais specifiques">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField id="resteSanteProthesesVue" label="Reste a charge sante (EUR)" hint="Uniquement le reste a charge indispensable au travail (non rembourse)." type="number" min="0" step="10" value={form.resteSanteProthesesVue} onChange={onChange} />
          <InputField id="adaptationPosteHandicap" label="Adaptation poste handicap (EUR)" type="number" min="0" step="10" value={form.adaptationPosteHandicap} onChange={onChange} />
          <InputField id="visasPasseportsVaccins" label="Visas/passeports/vaccins (EUR)" type="number" min="0" step="10" value={form.visasPasseportsVaccins} onChange={onChange} />
          <InputField id="blanchissageHotel" label="Blanchissage hotel en mission (EUR)" type="number" min="0" step="10" value={form.blanchissageHotel} onChange={onChange} />
          <InputField id="fraisCompteProAgios" label="Frais bancaires pro/agios (EUR)" type="number" min="0" step="10" value={form.fraisCompteProAgios} onChange={onChange} />
          <InputField id="vetementsSpeciaux" label="Vetements speciaux (EUR)" type="number" min="0" step="10" value={form.vetementsSpeciaux} onChange={onChange} />
          <InputField id="fraisEntretienVetements" label="Pressing/lavage domicile (EUR)" type="number" min="0" step="10" value={form.fraisEntretienVetements} onChange={onChange} />
        </div>
      </Card>

      <Card icon="🏘️" iconBg="bg-cyan-50 border border-cyan-100" title="Double Residence" subtitle="Logement secondaire et trajets hebdo">
        <div className="space-y-3">
          {Number(form.loyerMensuelDoubleResidence) > 0 ? <p className="hint">{Number(form.loyerMensuelDoubleResidence).toLocaleString('fr-FR')} EUR/mois</p> : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="loyerMensuelDoubleResidence" label="Loyer mensuel (EUR)" type="number" min="0" step="10" value={form.loyerMensuelDoubleResidence} onChange={onChange} />
            <InputField id="fraisGestionDoubleResidence" label="Frais de gestion annuels (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisGestionDoubleResidence} onChange={onChange} />
            <DetailedField id="chargesDoubleResidence" label="Charges annuelles (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" items={items('chargesDoubleResidence')} onItemsChange={onItemsChange} form={form} onChange={onChange} modalHelp="Detaillez EDF, eau, gaz, etc." />
            <InputField id="assuranceDoubleResidence" label="Assurance second logement (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.assuranceDoubleResidence} onChange={onChange} />
            <InputField id="taxesDoubleResidence" label="Taxes annexes logement (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.taxesDoubleResidence} onChange={onChange} />
            <InputField id="fraisAgenceDoubleResidence" label="Frais agence/bail (EUR)" calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisAgenceDoubleResidence} onChange={onChange} />
            <InputField id="semainesDoubleResidence" label="Semaines avec AR" type="number" min="0" max="52" step="1" value={form.semainesDoubleResidence} onChange={onChange} />
            <InputField id="kmArDoubleResidence" label="Distance AR hebdo (km)" calculator={{ type: 'km' }} type="number" min="0" step="1" value={form.kmArDoubleResidence} onChange={onChange} />
            <div>
              <label htmlFor="modeTrajetDoubleResidence" className="lbl">Mode trajet hebdo famille</label>
              <select id="modeTrajetDoubleResidence" className="inp cursor-pointer" value={form.modeTrajetDoubleResidence || 'km'} onChange={onChange}>
                <option value="km">Bareme KM</option>
                <option value="train">Train</option>
              </select>
            </div>
            <InputField id="trainArDoubleResidence" label="Cout 1 AR train/semaine (EUR)" type="number" min="0" step="5" value={form.trainArDoubleResidence} onChange={onChange} />
          </div>
        </div>
      </Card>

      <Card icon="📦" iconBg="bg-sky-50 border border-sky-100" title="Autres Frais Deductibles" subtitle="Depenses professionnelles complementaires">
        <div className="space-y-3">
          {itemsBadge(items('autresFrais')) || (Number(form.autresFrais) > 0 ? `${Number(form.autresFrais).toLocaleString('fr-FR')} EUR` : null) ? (
            <p className="hint">{itemsBadge(items('autresFrais')) || `${Number(form.autresFrais || 0).toLocaleString('fr-FR')} EUR`}</p>
          ) : null}
          <DetailedField
            id="autresFrais"
            label="Autres frais deductibles (EUR)"
            calculator={{ type: 'annual' }}
            type="number"
            min="0"
            step="10"
            items={items('autresFrais')}
            onItemsChange={onItemsChange}
            form={form}
            onChange={onChange}
            modalHelp="Ajoutez chaque poste separement (fournitures, impressions, etc.)."
          />
        </div>
      </Card>
    </>
  );
}

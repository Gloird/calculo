/**
 * components/CarteBureau.jsx
 * Saisie des jours de télétravail et des autres frais déductibles libres.
 */
import Card       from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';

export default function CarteBureau({ form, onChange }) {
  return (
    <Card
      icon="🏠"
      iconBg="bg-purple-50 border border-purple-100"
      title="Bureau & Autres"
      subtitle="Télétravail et frais divers"
    >
      <div className="space-y-4">

        <InputField
          id="joursTeletravail"
          label="Jours de télétravail / an"
          hint="2,70 €/jour · plafond annuel : 580,80 €"
          type="number"
          min="0"
          max="365"
          step="1"
          placeholder="80"
          value={form.joursTeletravail}
          onChange={onChange}
        />

        <InputField
          id="autresFrais"
          label="Autres frais déductibles (€)"
          hint="Exemple: petit materiel 180 EUR + fournitures 120 EUR = 300 EUR."
          calculator={{ type: 'annual' }}
          type="number"
          min="0"
          step="10"
          placeholder="350"
          value={form.autresFrais}
          onChange={onChange}
        />

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Double résidence</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              id="loyerMensuelDoubleResidence"
              label="Loyer mensuel (€)"
              hint="Exemple: 850 EUR/mois -> 10 200 EUR annuels deduits selon les regles."
              type="number"
              min="0"
              step="10"
              value={form.loyerMensuelDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="fraisGestionDoubleResidence"
              label="Frais de gestion annuels (€)"
              hint="Exemple: 35 EUR/mois de frais d'agence -> 420 EUR annuels."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.fraisGestionDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="chargesDoubleResidence"
              label="Charges (EDF/Eau) annuelles (€)"
              helpText="Somme annuelle de vos factures. Incluez EDF, Engie, Eau, Assurance habitation et taxe d'ordures menageres."
              hint="Exemple: EDF 900 EUR + Eau 240 EUR + assurance 180 EUR = 1 320 EUR."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.chargesDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="assuranceDoubleResidence"
              label="Assurance second logement (€)"
              hint="Exemple: 16 EUR/mois -> 192 EUR annuels."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.assuranceDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="taxesDoubleResidence"
              label="Taxes annexes logement (€)"
              hint="Exemple: taxe dechets 110 EUR + charges copro 240 EUR = 350 EUR."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.taxesDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="fraisAgenceDoubleResidence"
              label="Frais agence/bail (€)"
              hint="Exemple: frais de dossier 250 EUR + etat des lieux 120 EUR = 370 EUR."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.fraisAgenceDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="semainesDoubleResidence"
              label="Semaines avec AR"
              type="number"
              min="0"
              max="52"
              step="1"
              value={form.semainesDoubleResidence}
              onChange={onChange}
            />
            <InputField
              id="kmArDoubleResidence"
              label="Distance AR hebdo (km)"
              hint="Exemple: 160 km AR x 40 semaines = 6 400 km annuels."
              calculator={{ type: 'km' }}
              type="number"
              min="0"
              step="1"
              value={form.kmArDoubleResidence}
              onChange={onChange}
            />
            <div>
              <label htmlFor="modeTrajetDoubleResidence" className="lbl">Mode trajet hebdo famille</label>
              <select
                id="modeTrajetDoubleResidence"
                className="inp cursor-pointer"
                value={form.modeTrajetDoubleResidence || 'km'}
                onChange={onChange}
              >
                <option value="km">Barème KM</option>
                <option value="train">Train</option>
              </select>
            </div>
            <InputField
              id="trainArDoubleResidence"
              label="Coût 1 AR train/semaine (€)"
              hint="Exemple: 58 EUR par AR x 35 semaines = 2 030 EUR annuels."
              type="number"
              min="0"
              step="5"
              value={form.trainArDoubleResidence}
              onChange={onChange}
            />
          </div>
          <p className="hint">Source: BOI-RSA-BASE-30-50-10, section 510.</p>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Déménagement & Matériel</p>
          <InputField
            id="fraisDemenagement"
            label="Frais de déménagement (€)"
            hint="Exemple: transporteur 1 200 EUR + cartons 140 EUR = 1 340 EUR."
            calculator={{ type: 'annual' }}
            type="number"
            min="0"
            step="10"
            value={form.fraisDemenagement}
            onChange={onChange}
          />
          <InputField
            id="gardeMeubles"
            label="Garde-meubles (€)"
            hint="Exemple: 75 EUR/mois pendant 6 mois = 450 EUR."
            calculator={{ type: 'annual' }}
            type="number"
            min="0"
            step="10"
            value={form.gardeMeubles}
            onChange={onChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <InputField
              id="prixMateriel"
              label="Achat matériel (€ HT)"
              hint="< 500 €: déduction 100% ; >= 500 €: amortissement 3 ans"
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.prixMateriel}
              onChange={onChange}
            />
            <InputField
              id="typeMateriel"
              label="Type de matériel"
              type="text"
              value={form.typeMateriel}
              onChange={onChange}
            />
            <InputField
              id="prixEquipementBureau"
              label="Achat équipement bureau (€ HT)"
              hint="Exemple: ecran 320 EUR + chaise ergonomique 430 EUR = 750 EUR."
              calculator={{ type: 'annual' }}
              type="number"
              min="0"
              step="10"
              value={form.prixEquipementBureau}
              onChange={onChange}
            />
            <InputField
              id="typeEquipementBureau"
              label="Type équipement bureau"
              type="text"
              value={form.typeEquipementBureau}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Bureau à domicile (quote-part)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="surfaceBureau" label="Surface bureau (m²)" type="number" min="0" step="0.5" value={form.surfaceBureau} onChange={onChange} />
            <InputField id="surfaceTotale" label="Surface totale logement (m²)" type="number" min="0" step="0.5" value={form.surfaceTotale} onChange={onChange} />
            <InputField id="loyerAnnuelBureau" label="Loyer annuel (€)" helpText="Si locataire : part du loyer hors charges x % surface pro. Si proprietaire : utilisez la calculette pour l'amortissement des murs." hint="Exemple: loyer 1 100 EUR/mois et bureau 12% -> 1 584 EUR (13 200 x 12%)." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.loyerAnnuelBureau} onChange={onChange} />
            <InputField id="amortissementProprietaireBureau" label="Amortissement propriétaire (€)" helpText="Si locataire : part du loyer hors charges x % surface pro. Si proprietaire : utilisez la calculette pour l'amortissement des murs." hint="Exemple: bien 320 000 EUR, bureau 15% -> calculette amortissement disponible." calculator={{ type: 'amortissement' }} type="number" min="0" step="10" value={form.amortissementProprietaireBureau} onChange={onChange} />
            <InputField id="chargesBureau" label="Charges annuelles (€)" helpText="Somme annuelle de vos factures. Incluez EDF, Engie, Eau, Assurance habitation et taxe d'ordures menageres." hint="Exemple: EDF 1 080 EUR + gaz 620 EUR + eau 240 EUR = 1 940 EUR." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.chargesBureau} onChange={onChange} />
            <InputField id="taxeFonciereBureau" label="Taxe foncière (€)" hint="Exemple: taxe fonciere 1 300 EUR x bureau 10% = 130 EUR." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.taxeFonciereBureau} onChange={onChange} />
            <InputField id="assuranceBureau" label="Assurance multirisque (€)" hint="Exemple: assurance habitation 22 EUR/mois -> 264 EUR annuels." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.assuranceBureau} onChange={onChange} />
            <InputField id="abonnementsBureau" label="Internet/Mobile (€)" helpText="Montant total annuel de vos forfaits mobile et internet. L'application appliquera votre % d'usage pro." hint="Exemple: internet 39 EUR + mobile 19 EUR par mois -> 696 EUR/an avant prorata pro." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.abonnementsBureau} onChange={onChange} />
            <InputField id="amenagementBureau" label="Aménagement bureau (€)" hint="Exemple: peinture 220 EUR + eclairage 90 EUR + petit mobilier 180 EUR." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.amenagementBureau} onChange={onChange} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Formation, carrière et juridique</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="fraisFormation" label="Formation/abonnements techniques (€)" helpText="Frais d'inscription, livres specialises et trajets pour se rendre en formation." hint="Exemple: inscription 480 EUR + livres 95 EUR + train 120 EUR = 695 EUR." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisFormation} onChange={onChange} />
            <InputField id="fraisRechercheEmploi" label="Recherche d'emploi (€)" hint="Exemple: CV/impressions 45 EUR + deplacements 120 EUR = 165 EUR." calculator={{ type: 'annual' }} type="number" min="0" step="10" value={form.fraisRechercheEmploi} onChange={onChange} />
            <InputField id="fraisDefenseJuridique" label="Défense avocat/huissier (€)" type="number" min="0" step="10" value={form.fraisDefenseJuridique} onChange={onChange} />
            <InputField id="cotisationsOrdresPrevoyance" label="Cotisations ordres/prévoyance (€)" type="number" min="0" step="10" value={form.cotisationsOrdresPrevoyance} onChange={onChange} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Santé, handicap, voyages et banque</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="resteSanteProthesesVue" label="Reste à charge santé (prothèses/vue) (€)" type="number" min="0" step="10" value={form.resteSanteProthesesVue} onChange={onChange} />
            <InputField id="adaptationPosteHandicap" label="Adaptation poste handicap (€)" type="number" min="0" step="10" value={form.adaptationPosteHandicap} onChange={onChange} />
            <InputField id="visasPasseportsVaccins" label="Visas/passeports/vaccins (€)" type="number" min="0" step="10" value={form.visasPasseportsVaccins} onChange={onChange} />
            <InputField id="blanchissageHotel" label="Blanchissage hôtel en mission (€)" type="number" min="0" step="10" value={form.blanchissageHotel} onChange={onChange} />
            <InputField id="fraisCompteProAgios" label="Frais bancaires pro/agios (€)" type="number" min="0" step="10" value={form.fraisCompteProAgios} onChange={onChange} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Cotisations & Vêtements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              id="cotisationSyndicale"
              label="Cotisations syndicales/pro (€)"
              type="number"
              min="0"
              step="10"
              value={form.cotisationSyndicale}
              onChange={onChange}
            />
            <InputField
              id="tmi"
              label="TMI estimée (%)"
              type="number"
              min="0"
              max="60"
              step="1"
              value={form.tmi}
              onChange={onChange}
            />
          </div>

          <InputField
            id="vetementsSpeciaux"
            label="Vêtements spéciaux & entretien (€)"
            type="number"
            min="0"
            step="10"
            value={form.vetementsSpeciaux}
            onChange={onChange}
          />
            <InputField
              id="fraisEntretienVetements"
              label="Pressing / lavage domicile (€)"
              type="number"
              min="0"
              step="10"
              value={form.fraisEntretienVetements}
              onChange={onChange}
            />
        </div>

      </div>
    </Card>
  );
}

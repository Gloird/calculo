/**
 * components/CarteRevenus.jsx
 * Saisie du salaire net imposable annuel.
 */
import Card        from './ui/Card.jsx';
import InputField  from './ui/InputField.jsx';

export default function CarteRevenus({ form, onChange }) {
  return (
    <Card
      icon="💰"
      iconBg="bg-blue-50 border border-blue-100"
      title="Revenus"
      subtitle="Salaire annuel de référence"
    >
      <div className="space-y-4">
        <InputField
          id="salaire"
          label="Salaire net imposable annuel (€)"
          helpText="Cumulez les montants nets imposables de vos 12 bulletins de paie de l'annee (ou utilisez le montant indique sur votre recapitulatif annuel de salaire)."
          hint="Exemple: 2 950 EUR nets imposables/mois x 12 = 35 400 EUR annuels."
          calculator={{ type: 'annual' }}
          type="number"
          min="0"
          step="100"
          placeholder="35 000"
          value={form.salaire}
          onChange={onChange}
        />

        <InputField
          id="indemnitesKmEmployeur"
          label="Indemnités kilométriques employeur (€)"
          hint="Exemple: 120 EUR/mois d'indemnites = 1 440 EUR a reintegrer."
          calculator={{ type: 'annual' }}
          type="number"
          min="0"
          step="10"
          value={form.indemnitesKmEmployeur}
          onChange={onChange}
        />

        <InputField
          id="allocationsForfaitairesEmployeur"
          label="Allocations forfaitaires employeur (€)"
          hint="Exemple: prime panier 90 EUR/mois + teletravail 30 EUR/mois = 1 440 EUR annuels."
          calculator={{ type: 'annual' }}
          type="number"
          min="0"
          step="10"
          value={form.allocationsForfaitairesEmployeur}
          onChange={onChange}
        />
      </div>
    </Card>
  );
}

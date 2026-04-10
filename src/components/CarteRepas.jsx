/**
 * components/CarteRepas.jsx
 * Saisie des données pour le calcul des frais de repas professionnels.
 * Formule : (MIN(prix_payé, 20,20) − 5,35 − part_patronale_TR) × jours
 */
import Card       from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';

export default function CarteRepas({ form, onChange }) {
  return (
    <Card
      icon="🍽️"
      iconBg="bg-orange-50 border border-orange-100"
      title="Repas"
      subtitle="Frais de repas professionnels"
    >
      <div className="space-y-4">

        <InputField
          id="joursRepas"
          label="Jours avec repas extérieur / an"
          hint="Exemple: 4 jours/semaine x 47 semaines = 188 jours."
          calculator={{ type: 'annual' }}
          type="number"
          min="0"
          max="365"
          step="1"
          placeholder="200"
          value={form.joursRepas}
          onChange={onChange}
        />

        <InputField
          id="prixRepas"
          label="Prix moyen du repas payé (€)"
          helpText="Deduction repas: moins 5,45 EUR (valeur domicile), dans la limite de 21,10 EUR par repas."
          hint="Exemple: repas a 10 EUR -> base deductible theorique 4,55 EUR avant ticket-restaurant."
          type="number"
          min="0"
          step="0.50"
          placeholder="12.50"
          value={form.prixRepas}
          onChange={onChange}
        />

        <InputField
          id="partPatronale"
          label="Part patronale Ticket-Restaurant / repas (€)"
          hint="Exemple: ticket resto pris en charge a 5,50 EUR -> saisir 5,50."
          type="number"
          min="0"
          step="0.50"
          placeholder="5.50"
          value={form.partPatronale}
          onChange={onChange}
        />

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Réception pro</p>
          <InputField
            id="fraisReception"
            label="Invitations clients/partenaires (€)"
            hint="Exemple: 3 dejeuners clients a 45 EUR = 135 EUR annuels."
            calculator={{ type: 'annual' }}
            type="number"
            min="0"
            step="10"
            value={form.fraisReception}
            onChange={onChange}
          />
          <InputField
            id="receptionParticipants"
            label="Participants"
            hint="Nom(s) participant(s) pour la justification PDF"
            type="text"
            value={form.receptionParticipants}
            onChange={onChange}
          />
          <InputField
            id="receptionMotif"
            label="Motif professionnel"
            type="text"
            value={form.receptionMotif}
            onChange={onChange}
          />
        </div>

      </div>
    </Card>
  );
}

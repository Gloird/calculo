import Card from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';

function RealExpenseField({ line, field, label, onChange, step = '1' }) {
  return (
    <div>
      <label htmlFor={`${field}_${line.id}`} className="lbl">{label}</label>
      <input
        id={`${field}_${line.id}`}
        className="inp"
        type="number"
        min="0"
        step={step}
        value={line[field] || ''}
        onChange={(e) => onChange(line.id, field, e.target.value)}
      />
    </div>
  );
}

function TransportLine({ line, vehicles, onChange, onRemove, canRemove }) {
  return (
    <div className="transport-line-panel rounded-lg p-3 space-y-3">
      <div>
        <label htmlFor={`mode_${line.id}`} className="lbl">Mode ligne</label>
        <select
          id={`mode_${line.id}`}
          className="inp"
          value={line.mode || 'forfait'}
          onChange={(e) => onChange(line.id, 'mode', e.target.value)}
        >
          <option value="forfait">Forfait KM</option>
          <option value="reel">Frais réels</option>
        </select>
      </div>

      <div>
        <label htmlFor={`veh_${line.id}`} className="lbl">Quel véhicule a été utilisé ?</label>
        <select
          id={`veh_${line.id}`}
          className="inp"
          value={line.vehicleId}
          onChange={(e) => onChange(line.id, 'vehicleId', e.target.value)}
        >
          <option value="">Sélectionner un véhicule du garage</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
      </div>

      {(line.mode || 'forfait') === 'forfait' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`km_${line.id}`} className="lbl">Distance aller (km)</label>
            <input
              id={`km_${line.id}`}
              className="inp"
              type="number"
              min="0"
              step="0.5"
              value={line.kmAller}
              onChange={(e) => onChange(line.id, 'kmAller', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`jours_${line.id}`} className="lbl">Jours / an</label>
            <input
              id={`jours_${line.id}`}
              className="inp"
              type="number"
              min="0"
              step="1"
              value={line.jours}
              onChange={(e) => onChange(line.id, 'jours', e.target.value)}
            />
          </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={Boolean(line.justificationEloignement)}
              onChange={(e) => onChange(line.id, 'justificationEloignement', e.target.checked)}
            />
            <span>
              Justification d'éloignement spécifique (mutation, emploi du conjoint, etc.).
              Sans cette case, la distance déductible est plafonnée à 40 km aller (80 km AR).
            </span>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <RealExpenseField line={line} field="carburant" label="Carburant (€)" onChange={onChange} />
          <RealExpenseField line={line} field="entretien" label="Entretien (€)" onChange={onChange} />
          <RealExpenseField line={line} field="reparations" label="Réparations (€)" onChange={onChange} />
          <RealExpenseField line={line} field="assurance" label="Assurance (€)" onChange={onChange} />
          <RealExpenseField line={line} field="pneus" label="Pneus (€)" onChange={onChange} />
          <RealExpenseField line={line} field="loaLld" label="LOA/LLD (€)" onChange={onChange} />
          <RealExpenseField line={line} field="usageProPercent" label="Usage pro (%)" onChange={onChange} step="0.1" />
          <RealExpenseField line={line} field="amortissementAchat" label="Amortissement achat (€)" onChange={onChange} />
          <RealExpenseField line={line} field="plafondCO2" label="Plafond CO2 (€)" onChange={onChange} />
          <InputField
            id={`interets_${line.id}`}
            label="Interets d'emprunt"
            helpText="Uniquement la part des interets (hors assurance) de votre pret immobilier au prorata de la surface du bureau."
            hint="Exemple: interets annuels 2 000 EUR x quote-part pro 12% = 240 EUR."
            calculator={{ type: 'annual' }}
            type="number"
            min="0"
            value={line.interetsEmprunt || ''}
            onChange={(e) => onChange(line.id, 'interetsEmprunt', e.target.value)}
          />
          <RealExpenseField line={line} field="parkingBox" label="Parking / Box (€)" onChange={onChange} />
          <RealExpenseField line={line} field="peages" label="Péages (€)" onChange={onChange} />
        </div>
      )}

      {canRemove && (
        <button className="text-xs text-red-600 hover:underline" onClick={() => onRemove(line.id)}>
          Supprimer cette ligne
        </button>
      )}
    </div>
  );
}

export default function CarteTransport({
  form,
  vehicles,
  onAddLine,
  onRemoveLine,
  onLineChange,
  onAutoDistance,
  distanceLoading,
  distanceError,
}) {
  return (
    <Card
      icon="🚗"
      iconBg="bg-green-50 border border-green-100"
      title="Transport"
      subtitle="Sélection multi-véhicules depuis le garage"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"
            onClick={onAutoDistance}
            disabled={distanceLoading}
          >
            {distanceLoading ? 'Calcul en cours...' : 'Calculer à partir de mes adresses'}
          </button>
          <span className="text-xs text-gray-500">Fallback: saisie manuelle disponible si API indisponible</span>
        </div>

        {distanceError && <p className="text-xs text-red-600">{distanceError}</p>}

        {(form.transportLignes || []).map((line) => (
          <TransportLine
            key={line.id}
            line={line}
            vehicles={vehicles}
            onChange={onLineChange}
            onRemove={onRemoveLine}
            canRemove={(form.transportLignes || []).length > 1}
          />
        ))}

        <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg" onClick={onAddLine}>
          + Ajouter une ligne transport
        </button>

        <p className="hint">
          Les lignes forfait sont sommées et proratisées par véhicule; les lignes en frais réels sont calculées ligne par ligne.
        </p>
      </div>
    </Card>
  );
}

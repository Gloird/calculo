import Card from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';

function TransportLine({ line, vehicles, onChange, onRemove, canRemove }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/60 space-y-3">
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <input className="inp" type="number" min="0" placeholder="Carburant" value={line.carburant || ''} onChange={(e) => onChange(line.id, 'carburant', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Entretien" value={line.entretien || ''} onChange={(e) => onChange(line.id, 'entretien', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Réparations" value={line.reparations || ''} onChange={(e) => onChange(line.id, 'reparations', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Assurance" value={line.assurance || ''} onChange={(e) => onChange(line.id, 'assurance', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Pneus" value={line.pneus || ''} onChange={(e) => onChange(line.id, 'pneus', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="LOA/LLD" value={line.loaLld || ''} onChange={(e) => onChange(line.id, 'loaLld', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Usage pro %" value={line.usageProPercent || ''} onChange={(e) => onChange(line.id, 'usageProPercent', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Amortissement achat" value={line.amortissementAchat || ''} onChange={(e) => onChange(line.id, 'amortissementAchat', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Plafond CO2" value={line.plafondCO2 || ''} onChange={(e) => onChange(line.id, 'plafondCO2', e.target.value)} />
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
          <input className="inp" type="number" min="0" placeholder="Parking/Box" value={line.parkingBox || ''} onChange={(e) => onChange(line.id, 'parkingBox', e.target.value)} />
          <input className="inp" type="number" min="0" placeholder="Péages" value={line.peages || ''} onChange={(e) => onChange(line.id, 'peages', e.target.value)} />
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

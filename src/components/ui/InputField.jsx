/**
 * components/ui/InputField.jsx
 * Champ de saisie reutilisable avec label, aide contextuelle et calculette.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

function AnnualCalculator({ onApply, onClose }) {
  const [mode, setMode] = useState('12m');
  const [monthly, setMonthly] = useState('');
  const [months, setMonths] = useState(Array(12).fill(''));

  const total = mode === '12m'
    ? Number(monthly || 0) * 12
    : months.reduce((sum, m) => sum + Number(m || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === '12m' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`} onClick={() => setMode('12m')}>
          Mode 12 mois
        </button>
        <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'precis' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`} onClick={() => setMode('precis')}>
          Mode precis
        </button>
      </div>

      {mode === '12m' ? (
        <div>
          <p className="text-xs text-gray-600 mb-1">Saisissez un montant mensuel unique.</p>
          <input className="inp" type="number" min="0" step="0.01" placeholder="Ex: 78" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-600 mb-2">Saisissez vos 12 montants reels mois par mois.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MONTHS.map((label, idx) => (
              <input
                key={label}
                className="inp"
                type="number"
                min="0"
                step="0.01"
                placeholder={label}
                value={months[idx]}
                onChange={(e) => {
                  const next = [...months];
                  next[idx] = e.target.value;
                  setMonths(next);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-800">
        Total annuel calcule: <span className="font-semibold">{total.toFixed(2)} EUR</span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 text-sm text-gray-600 hover:underline" onClick={onClose}>Annuler</button>
        <button
          type="button"
          className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => onApply(total.toFixed(2))}
        >
          Appliquer
        </button>
      </div>
    </div>
  );
}

function KmCalculator({ onApply, onClose }) {
  const [days, setDays] = useState('');
  const [distanceAr, setDistanceAr] = useState('');
  const total = Number(days || 0) * Number(distanceAr || 0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">Calculateur KM: jours travailles x distance AR domicile-travail.</p>
      <input className="inp" type="number" min="0" step="1" placeholder="Nombre de jours travailles" value={days} onChange={(e) => setDays(e.target.value)} />
      <input className="inp" type="number" min="0" step="0.1" placeholder="Distance AR (km)" value={distanceAr} onChange={(e) => setDistanceAr(e.target.value)} />
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-800">
        KM annuels: <span className="font-semibold">{total.toFixed(1)} km</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 text-sm text-gray-600 hover:underline" onClick={onClose}>Annuler</button>
        <button type="button" className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => onApply(total.toFixed(1))}>Appliquer</button>
      </div>
    </div>
  );
}

function AmortissementCalculator({ onApply, onClose }) {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [surfacePercent, setSurfacePercent] = useState('');

  const annual = ((Number(purchasePrice || 0) * 0.85) / 25) * (Number(surfacePercent || 0) / 100);

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-600">Formule: (Prix achat x 85%) / 25 x % surface bureau.</p>
      <input className="inp" type="number" min="0" step="100" placeholder="Prix d'achat du bien" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
      <input className="inp" type="number" min="0" max="100" step="0.1" placeholder="% surface bureau" value={surfacePercent} onChange={(e) => setSurfacePercent(e.target.value)} />
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-800">
        Amortissement annuel: <span className="font-semibold">{annual.toFixed(2)} EUR</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="px-3 py-2 text-sm text-gray-600 hover:underline" onClick={onClose}>Annuler</button>
        <button type="button" className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => onApply(annual.toFixed(2))}>Appliquer</button>
      </div>
    </div>
  );
}

function CalculatorModal({ type, label, onApply, onClose }) {
  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-xl border border-blue-100 shadow-2xl p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">Calculette: {label}</h3>
          <button type="button" className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={onClose} aria-label="Fermer la calculette">x</button>
        </div>
        {type === 'km' && <KmCalculator onApply={onApply} onClose={onClose} />}
        {type === 'amortissement' && <AmortissementCalculator onApply={onApply} onClose={onClose} />}
        {(type === 'annual' || !type) && <AnnualCalculator onApply={onApply} onClose={onClose} />}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

export default function InputField({ id, label, hint, helpText, calculator = null, onChange, ...props }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  function applyCalculatedValue(nextValue) {
    if (onChange) {
      onChange({ target: { id, value: String(nextValue), type: 'number', checked: false } });
    }
    setCalcOpen(false);
  }

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2 mb-1.5">
          <label htmlFor={id} className="lbl mb-0 flex-1">
            {label}
          </label>

          {helpText && (
            <div className="relative">
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100"
                aria-label={`Aide pour ${label}`}
                onClick={() => setTooltipOpen((v) => !v)}
              >
                ℹ️
              </button>
              {tooltipOpen && (
                <div className="absolute right-0 top-8 z-20 w-72 p-3 rounded-xl border border-blue-200 bg-blue-50 text-xs text-blue-900 shadow-lg">
                  {helpText}
                </div>
              )}
            </div>
          )}

          {calculator && (
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-100"
              aria-label={`Ouvrir la calculette pour ${label}`}
              onClick={() => setCalcOpen(true)}
            >
              ⌨️
            </button>
          )}
        </div>
      )}
      <input id={id} className="inp" autoComplete="off" onChange={onChange} {...props} />
      {hint && <p className="hint">{hint}</p>}

      {calcOpen && (
        <CalculatorModal
          type={calculator?.type || 'annual'}
          label={label}
          onApply={applyCalculatedValue}
          onClose={() => setCalcOpen(false)}
        />
      )}
    </div>
  );
}

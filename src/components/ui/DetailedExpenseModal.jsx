/**
 * components/ui/DetailedExpenseModal.jsx
 * =========================================
 * Modale réutilisable pour la saisie granulaire d'un poste de frais.
 * Chaque ligne : { id, label, amount }.
 * La somme est injectée dans le champ parent via le callback onChange.
 *
 * Usage :
 *   <DetailedExpenseModal
 *     title="Charges annuelles – Bureau"
 *     help="Saisissez chaque facture séparément pour justifier en cas de contrôle fiscal."
 *     items={form.chargesBureauItems}
 *     onChange={(items, total) => onItemsChange('chargesBureau', items, total)}
 *     onClose={() => setModalOpen(false)}
 *   />
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';

function makeItem() {
  return { id: crypto.randomUUID(), label: '', amount: '' };
}

export default function DetailedExpenseModal({ title, help, items = [], onChange, onClose }) {
  const [rows, setRows] = useState(items.length > 0 ? items : [makeItem()]);

  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, makeItem()]);
  }

  function removeRow(id) {
    const next = rows.filter((r) => r.id !== id);
    setRows(next.length ? next : [makeItem()]);
  }

  function handleApply() {
    const clean = rows.filter((r) => r.label.trim() || Number(r.amount) > 0);
    onChange(clean, total);
    onClose();
  }

  function handleClear() {
    onChange([], 0);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-4 p-6 max-h-[90vh] overflow-y-auto">

        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
            {help && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{help}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg leading-none flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* En-tête colonnes */}
        <div className="grid grid-cols-[1fr_7rem_2rem] gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide px-0.5">
          <span>Libellé</span>
          <span className="text-right">Montant (€)</span>
          <span />
        </div>

        {/* Lignes d'items */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_7rem_2rem] gap-1.5 items-center">
              <input
                type="text"
                className="inp"
                placeholder="Ex : Facture EDF"
                value={row.label}
                onChange={(e) => updateRow(row.id, 'label', e.target.value)}
              />
              <input
                type="number"
                className="inp text-right"
                placeholder="0"
                min="0"
                step="0.01"
                value={row.amount}
                onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Supprimer cette ligne"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="text-blue-600 text-sm font-medium hover:underline self-start flex items-center gap-1"
        >
          + Ajouter une ligne
        </button>

        {/* Total calculé */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">Total calculé</span>
          <span className="text-sm font-bold text-blue-900">
            {total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 hover:underline"
          >
            Effacer le détail
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-600 hover:underline"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body,
  );
}

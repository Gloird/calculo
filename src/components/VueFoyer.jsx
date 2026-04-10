import { eur } from '../lib/calculs.js';

export default function VueFoyer({ foyerRows }) {
  const total = (foyerRows || []).reduce((s, r) => s + (r.gain || 0), 0);

  return (
    <div className="card rounded-2xl shadow-sm p-6 mb-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Vue Foyer</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 pr-3">Case</th>
              <th className="py-2 pr-3">Membre</th>
              <th className="py-2 pr-3">Frais réels</th>
              <th className="py-2 pr-3">Abattement 10%</th>
              <th className="py-2 pr-3">Option gagnante</th>
              <th className="py-2 pr-3">Gain</th>
            </tr>
          </thead>
          <tbody>
            {(foyerRows || []).map((r) => (
              <tr key={r.memberId} className="border-b border-gray-50">
                <td className="py-2 pr-3 font-mono text-xs text-gray-500">{r.caseDeclaration}</td>
                <td className="py-2 pr-3 font-medium text-gray-700">{r.prenom}</td>
                <td className="py-2 pr-3">{eur(r.total)}</td>
                <td className="py-2 pr-3">{eur(r.abattement)}</td>
                <td className="py-2 pr-3 text-xs font-semibold text-gray-700">{r.total >= r.abattement ? 'Frais réels' : 'Abattement 10%'}</td>
                <td className="py-2 pr-3 font-semibold text-emerald-700">{eur(r.gain)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 font-bold text-gray-700">Total économie foyer</td>
              <td />
              <td />
              <td className="pt-3 font-bold text-emerald-700">{eur(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

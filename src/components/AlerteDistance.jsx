/**
 * components/AlerteDistance.jsx
 * Bandeau d'avertissement : affiché quand la distance aller > 40 km.
 * Un justificatif légal est requis dans ce cas (art. 83-3° du CGI).
 */
export default function AlerteDistance({ visible }) {
  if (!visible) return null;

  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 p-4 rounded-xl flex items-start gap-3 shadow-sm">
      <span className="text-amber-500 text-xl flex-shrink-0 mt-0.5">⚠️</span>
      <div>
        <p className="text-amber-800 font-semibold text-sm">
          Distance supérieure à 40 km aller (80 km AR)
        </p>
        <p className="text-amber-700 text-xs mt-0.5">
          La déduction est limitée à 40 km (80 km AR) sauf justification de l'éloignement
          (mutation, emploi du conjoint...).
        </p>
      </div>
    </div>
  );
}

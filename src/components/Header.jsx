/**
 * components/Header.jsx
 * Barre de navigation principale : logo, sélecteur d'année, bouton reset.
 */
export default function Header({ annee, onAnneeChange, onReset }) {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo / Titre */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🧮
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Calculo</h1>
            <p className="text-blue-300 text-xs mt-0.5">
              Frais Réels vs Abattement 10 % · Impôts Français
            </p>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <label
            htmlFor="annee-fiscale"
            className="text-blue-200 text-sm font-medium whitespace-nowrap hidden sm:block"
          >
            Année fiscale :
          </label>

          <select
            id="annee-fiscale"
            value={annee}
            onChange={onAnneeChange}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition"
          >
            <option value="2024">2024 → Déclaration 2025</option>
            <option value="2025">2025 (Revenus de l'année en cours) → Déclaration 2026</option>
          </select>

          <button
            onClick={onReset}
            title="Réinitialiser tous les champs"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 py-2 text-sm transition flex items-center gap-1.5"
          >
            ↺ Reset
          </button>
        </div>

      </div>
    </header>
  );
}

/**
 * components/Footer.jsx
 * Pied de page avec mentions légales et bouton d'export PDF.
 */
export default function Footer({ onPDF, pdfMode, onPdfModeChange }) {
  return (
    <footer className="app-footer shadow-inner">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="text-center sm:text-left">
          <p className="text-xs app-footer-copy">
            Calculo · Toutes les données restent sur votre appareil (localStorage uniquement).
            Aucune donnée n'est transmise.
          </p>
          <p className="text-xs app-footer-copy mt-0.5">
            Ce simulateur est une aide au calcul. Vérifiez les valeurs officielles sur{' '}
            <a
              href="https://www.impots.gouv.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              impots.gouv.fr
            </a>
            .
          </p>
          <p className="text-xs app-footer-copy mt-0.5">
            L'optimisation inclut les frais de double résidence et d'amortissement de matériel selon les directives du BOFIP 2025/2026.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="inp min-w-[170px]"
            value={pdfMode}
            onChange={(e) => onPdfModeChange(e.target.value)}
          >
            <option value="personne">Rapport par personne</option>
            <option value="foyer">Rapport foyer (groupé)</option>
          </select>

          <button
            onClick={() => onPDF(pdfMode)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-700 hover:to-indigo-700 active:scale-95
                       text-white font-semibold px-6 py-3 rounded-xl transition-all
                       shadow-md hover:shadow-lg text-sm whitespace-nowrap"
          >
            <span>📄</span> Télécharger le récapitulatif PDF
          </button>
        </div>

      </div>
    </footer>
  );
}

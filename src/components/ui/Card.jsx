/**
 * components/ui/Card.jsx
 * Carte de saisie générique avec icône, titre et sous-titre.
 * La prop iconBg permet de personnaliser la couleur de fond de l'icône.
 */
export default function Card({ icon, iconBg = 'bg-blue-50 border border-blue-100', title, subtitle, children }) {
  return (
    <div className="card backdrop-blur-[1px] rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

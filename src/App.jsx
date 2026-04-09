/**
 * App.jsx
 * Composant racine : assemble toutes les sections de l'application.
 * Toute la logique d'état est déléguée au hook useCalculo.
 */
import { useState }          from 'react';
import { useCalculo }        from './hooks/useCalculo.js';
import { genererPDF }        from './lib/pdf.js';
import Header                from './components/Header.jsx';
import AlerteDistance        from './components/AlerteDistance.jsx';
import CarteRevenus          from './components/CarteRevenus.jsx';
import CarteTransport        from './components/CarteTransport.jsx';
import CarteRepas            from './components/CarteRepas.jsx';
import CarteBureau           from './components/CarteBureau.jsx';
import SectionSynthese       from './components/SectionSynthese.jsx';
import Footer                from './components/Footer.jsx';
import DashboardFamille      from './components/DashboardFamille.jsx';
import VueFoyer              from './components/VueFoyer.jsx';

export default function App() {
  const [pdfMode, setPdfMode] = useState('personne');
  const {
    form,
    annee,
    resultats,
    members,
    vehicles,
    selectedMemberId,
    foyerRows,
    handleChange,
    handleAnneeChange,
    addMember,
    deleteMember,
    updateMember,
    selectMember,
    addVehicle,
    deleteVehicle,
    updateVehicle,
    resetAll,
    addTransportLine,
    removeTransportLine,
    handleTransportLineChange,
    remplirDistancesDepuisAdresses,
    distanceLoading,
    distanceError,
    getPdfPayload,
  } = useCalculo();

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="bg-slate-50 min-h-screen text-gray-800 antialiased">

      <Header
        annee={annee}
        onAnneeChange={handleAnneeChange}
        onReset={resetAll}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-4 bg-blue-50 border border-blue-200 border-l-4 border-l-blue-600 rounded-xl p-3">
          <p className="text-sm text-blue-800 font-medium">
            Calcul basé sur la Loi de Finances 2026 (Texte JORF n°0053508155).
          </p>
        </div>

        <AlerteDistance visible={resultats.alerteDistance} />

        <DashboardFamille
          members={members}
          vehicles={vehicles}
          selectedMemberId={selectedMemberId}
          onSelectMember={selectMember}
          onAddMember={addMember}
          onDeleteMember={deleteMember}
          onUpdateMember={updateMember}
          onAddVehicle={addVehicle}
          onDeleteVehicle={deleteVehicle}
          onUpdateVehicle={updateVehicle}
        />

        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-indigo-800 font-medium">Pour quel membre calculez-vous ?</p>
          <select className="inp sm:max-w-xs" value={selectedMemberId || ''} onChange={(e) => selectMember(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.prenom}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <CarteRevenus   form={form} onChange={handleChange} />
          <CarteTransport
            form={form}
            vehicles={vehicles}
            onAddLine={addTransportLine}
            onRemoveLine={removeTransportLine}
            onLineChange={handleTransportLineChange}
            onAutoDistance={remplirDistancesDepuisAdresses}
            distanceLoading={distanceLoading}
            distanceError={distanceError}
            annee={annee}
          />
          <CarteRepas     form={form} onChange={handleChange} />
          <CarteBureau    form={form} onChange={handleChange} />
        </div>

        <SectionSynthese resultats={resultats} />

        <VueFoyer foyerRows={foyerRows} />

      </main>

      <Footer
        pdfMode={pdfMode}
        onPdfModeChange={setPdfMode}
        onPDF={(mode) => genererPDF(getPdfPayload(mode), mode, selectedMember?.prenom || 'Membre')}
      />

    </div>
  );
}

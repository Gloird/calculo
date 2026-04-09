import { useState } from 'react';
import Card from './ui/Card.jsx';
import InputField from './ui/InputField.jsx';

function emptyMemberDraft() {
  return {
    prenom: '',
    salaireNet: '',
    repasJours: '',
    repasPrix: '',
    partPatronale: '',
    domicileAdresse: '',
    workplaces: [],
  };
}

function emptyVehicleDraft() {
  return {
    nom: '',
    type: 'voiture',
    puissance: '5',
    electrique: false,
    usage: 'proprietaire',
  };
}

function normalizeWorkplaces(workplaces) {
  if (!Array.isArray(workplaces)) return [];
  return workplaces
    .filter((w) => w && (w.address || '').toString().trim())
    .map((w) => ({
      id: w.id || crypto.randomUUID(),
      address: (w.address || '').toString().trim(),
      frequence: String(w.frequence ?? ''),
    }));
}

export default function DashboardFamille({
  members,
  vehicles,
  selectedMemberId,
  onSelectMember,
  onAddMember,
  onDeleteMember,
  onUpdateMember,
  onAddVehicle,
  onDeleteVehicle,
  onUpdateVehicle,
}) {
  const [memberDraft, setMemberDraft] = useState(emptyMemberDraft());
  const [workplaceDraft, setWorkplaceDraft] = useState({ address: '', frequence: '' });
  const [vehicleDraft, setVehicleDraft] = useState(emptyVehicleDraft());
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  function addWorkplace() {
    if (!workplaceDraft.address.trim()) return;
    setMemberDraft((s) => ({
      ...s,
      workplaces: [
        ...(s.workplaces || []),
        { id: crypto.randomUUID(), address: workplaceDraft.address, frequence: workplaceDraft.frequence || '' },
      ],
    }));
    setWorkplaceDraft({ address: '', frequence: '' });
  }

  function removeWorkplace(id) {
    setMemberDraft((s) => ({
      ...s,
      workplaces: (s.workplaces || []).filter((w) => w.id !== id),
    }));
  }

  function saveMember() {
    if (!memberDraft.prenom.trim()) return;
    if (editingMemberId) {
      onUpdateMember(editingMemberId, { ...memberDraft });
      setEditingMemberId(null);
    } else {
      onAddMember({ ...memberDraft });
    }
    setMemberDraft(emptyMemberDraft());
    setWorkplaceDraft({ address: '', frequence: '' });
  }

  function startEditMember(member) {
    setEditingMemberId(member.id);
    setMemberDraft({
      prenom: member.prenom || '',
      salaireNet: member.salaireNet || '',
      repasJours: member.repasJours || '',
      repasPrix: member.repasPrix || '',
      partPatronale: member.partPatronale || '',
      domicileAdresse: member.domicileAdresse || '',
      workplaces: normalizeWorkplaces(member.workplaces),
    });
  }

  function cancelEditMember() {
    setEditingMemberId(null);
    setMemberDraft(emptyMemberDraft());
    setWorkplaceDraft({ address: '', frequence: '' });
  }

  function saveVehicle() {
    if (!vehicleDraft.nom.trim()) return;
    if (editingVehicleId) {
      onUpdateVehicle(editingVehicleId, { ...vehicleDraft });
      setEditingVehicleId(null);
    } else {
      onAddVehicle({ ...vehicleDraft });
    }
    setVehicleDraft(emptyVehicleDraft());
  }

  function startEditVehicle(vehicle) {
    setEditingVehicleId(vehicle.id);
    setVehicleDraft({
      nom: vehicle.nom || '',
      type: vehicle.type || 'voiture',
      puissance: String(vehicle.puissance || '5'),
      electrique: Boolean(vehicle.electrique),
      usage: vehicle.usage || 'proprietaire',
    });
  }

  function cancelEditVehicle() {
    setEditingVehicleId(null);
    setVehicleDraft(emptyVehicleDraft());
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      <Card icon="👨‍👩‍👧‍👦" iconBg="bg-sky-50 border border-sky-100" title="Dashboard Famille" subtitle="Gestion des membres">
        <div className="space-y-3">
          <InputField id="m_prenom" label="Prénom" type="text" value={memberDraft.prenom} onChange={(e) => setMemberDraft((s) => ({ ...s, prenom: e.target.value }))} />
          <InputField id="m_dom" label="Adresse du domicile" type="text" value={memberDraft.domicileAdresse} onChange={(e) => setMemberDraft((s) => ({ ...s, domicileAdresse: e.target.value }))} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField id="m_salaire" label="Salaire net annuel (€)" type="number" min="0" step="100" value={memberDraft.salaireNet} onChange={(e) => setMemberDraft((s) => ({ ...s, salaireNet: e.target.value }))} />
            <InputField id="m_jours" label="Repas défaut (jours)" type="number" min="0" step="1" value={memberDraft.repasJours} onChange={(e) => setMemberDraft((s) => ({ ...s, repasJours: e.target.value }))} />
            <InputField id="m_prix" label="Repas défaut prix (€)" type="number" min="0" step="0.5" value={memberDraft.repasPrix} onChange={(e) => setMemberDraft((s) => ({ ...s, repasPrix: e.target.value }))} />
            <InputField id="m_part" label="Part TR défaut (€)" type="number" min="0" step="0.5" value={memberDraft.partPatronale} onChange={(e) => setMemberDraft((s) => ({ ...s, partPatronale: e.target.value }))} />
          </div>

          <div className="border border-sky-100 rounded-lg p-3 bg-sky-50/50 space-y-2">
            <p className="text-xs font-bold text-sky-700 uppercase tracking-widest">Adresses de travail</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className="inp sm:col-span-2" placeholder="Adresse de travail" value={workplaceDraft.address} onChange={(e) => setWorkplaceDraft((s) => ({ ...s, address: e.target.value }))} />
              <input className="inp" type="number" min="0" step="1" placeholder="Jours/an" value={workplaceDraft.frequence} onChange={(e) => setWorkplaceDraft((s) => ({ ...s, frequence: e.target.value }))} />
            </div>
            <button className="text-xs text-sky-700 hover:underline" onClick={addWorkplace}>+ Ajouter lieu de travail</button>
            <div className="space-y-1">
              {(memberDraft.workplaces || []).map((w) => (
                <div key={w.id} className="flex items-center justify-between text-xs text-gray-700 bg-white border border-sky-100 rounded px-2 py-1">
                  <span>{w.address} ({w.frequence || 0} j/an)</span>
                  <button className="text-red-600 hover:underline" onClick={() => removeWorkplace(w.id)}>Supprimer</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-3 py-2 rounded-lg" onClick={saveMember}>
              {editingMemberId ? 'Enregistrer membre' : 'Ajouter membre'}
            </button>
            {editingMemberId && (
              <button className="text-sm text-gray-600 hover:underline" onClick={cancelEditMember}>Annuler</button>
            )}
          </div>

          <div className="space-y-2">
            {members.length === 0 && <p className="text-xs text-gray-400">Aucun membre configuré.</p>}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2">
                <button className="text-left flex-1" onClick={() => onSelectMember(m.id)}>
                  <p className="text-sm font-semibold text-gray-700">
                    {m.prenom} {selectedMemberId === m.id ? '• actif' : ''}
                  </p>
                  <p className="text-xs text-gray-500">Salaire: {m.salaireNet || 0} €</p>
                  <p className="text-xs text-gray-500">Domicile: {m.domicileAdresse || 'Non renseigné'}</p>
                  <p className="text-xs text-gray-500">Lieux de travail: {(m.workplaces || []).length}</p>
                </button>
                <div className="flex gap-3">
                  <button className="text-xs text-indigo-600 hover:underline" onClick={() => startEditMember(m)}>Modifier</button>
                  <button className="text-xs text-red-600 hover:underline" onClick={() => onDeleteMember(m.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card icon="🚘" iconBg="bg-emerald-50 border border-emerald-100" title="Garage familial" subtitle="Flotte réutilisable">
        <div className="space-y-3">
          <InputField id="v_nom" label="Nom du véhicule" type="text" value={vehicleDraft.nom} onChange={(e) => setVehicleDraft((s) => ({ ...s, nom: e.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="v_type" className="lbl">Type</label>
              <select id="v_type" className="inp" value={vehicleDraft.type} onChange={(e) => setVehicleDraft((s) => ({ ...s, type: e.target.value }))}>
                <option value="voiture">Voiture</option>
                <option value="moto_plus_50">Moto {'>'} 50cc</option>
                <option value="cyclo_moins_50">Cyclo {'<'} 50cc</option>
              </select>
            </div>
            <InputField id="v_p" label="Puissance CV" type="number" min="1" step="1" value={vehicleDraft.puissance} onChange={(e) => setVehicleDraft((s) => ({ ...s, puissance: e.target.value }))} />
            <div>
              <label htmlFor="v_usage" className="lbl">Usage</label>
              <select id="v_usage" className="inp" value={vehicleDraft.usage} onChange={(e) => setVehicleDraft((s) => ({ ...s, usage: e.target.value }))}>
                <option value="proprietaire">Propriétaire (barème/réel)</option>
                <option value="loa">LOA/LLD (loyers)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
              <input type="checkbox" checked={vehicleDraft.electrique} onChange={(e) => setVehicleDraft((s) => ({ ...s, electrique: e.target.checked }))} />
              100% électrique
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg" onClick={saveVehicle}>
              {editingVehicleId ? 'Enregistrer véhicule' : 'Ajouter véhicule'}
            </button>
            {editingVehicleId && (
              <button className="text-sm text-gray-600 hover:underline" onClick={cancelEditVehicle}>Annuler</button>
            )}
          </div>

          <div className="space-y-2">
            {vehicles.length === 0 && <p className="text-xs text-gray-400">Aucun véhicule configuré.</p>}
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{v.nom}</p>
                  <p className="text-xs text-gray-500">{v.type} · {v.puissance} CV · {v.electrique ? '100% électrique' : 'thermique/hybride'} · {v.usage}</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-xs text-indigo-600 hover:underline" onClick={() => startEditVehicle(v)}>Modifier</button>
                  <button className="text-xs text-red-600 hover:underline" onClick={() => onDeleteVehicle(v.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

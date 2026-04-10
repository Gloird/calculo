import { describe, expect, it, vi } from 'vitest';

const textCalls = [];
const tableCells = [];

vi.mock('jspdf', () => {
  class MockJsPDF {
    lastAutoTable = { finalY: 40 };
    internal = { getNumberOfPages: () => 1 };

    setFillColor() {}
    rect() {}
    setTextColor() {}
    setFont() {}
    setFontSize() {}
    text(value) { textCalls.push(String(value)); }
    addPage() {}
    setPage() {}
    setDrawColor() {}
    roundedRect() {}
    splitTextToSize(value) { return [String(value)]; }
    save() {}
  }

  return { jsPDF: MockJsPDF };
});

vi.mock('jspdf-autotable', () => ({
  default: (doc, options = {}) => {
    const body = Array.isArray(options.body) ? options.body : [];
    for (const row of body) {
      for (const cell of row) {
        if (typeof cell === 'string') tableCells.push(cell);
        if (cell && typeof cell === 'object' && typeof cell.content === 'string') tableCells.push(cell.content);
      }
    }
    doc.lastAutoTable = { finalY: (doc.lastAutoTable?.finalY || 40) + 20 };
  },
}));

import { genererPDF } from './pdf.js';

function makePayload() {
  return {
    annee: 2025,
    cfg: { declaration: 2026 },
    salaire: 50000,
    km: { montant: 0, detail: 'x' },
    transportsAlternatifs: { montant: 0, detail: 'x' },
    repas: { montant: 0, detail: 'x' },
    reception: { montant: 0, detail: 'x' },
    tt: { montant: 0, detail: 'x' },
    quotePartBureau: { montant: 0, detail: 'x' },
    amortissementEquipementBureau: { montant: 0, detail: 'x' },
    doubleResidence: { montant: 0, detail: 'x' },
    demenagement: { montant: 0, detail: 'x' },
    amortissement: { montant: 0, detail: 'x' },
    formation: { montant: 0, detail: 'x' },
    rechercheEmploi: { montant: 0, detail: 'x' },
    syndicale: { montant: 0, detail: 'x' },
    defenseJuridique: { montant: 0, detail: 'x' },
    cotisationsObligatoires: { montant: 0, detail: 'x' },
    sante: { montant: 0, detail: 'x' },
    handicap: { montant: 0, detail: 'x' },
    missions: { montant: 0, detail: 'x' },
    banque: { montant: 0, detail: 'x' },
    vetements: { montant: 0, detail: 'x' },
    autres: { montant: 0, detail: 'x' },
    total: 0,
    abattement: { montant: 0, detail: 'x' },
    justificatifs: [],
    formDetails: {
      abonnementsBureauItems: [{ label: 'Facture Internet Fibre', amount: 480 }],
      chargesBureauItems: [],
      chargesDoubleResidenceItems: [],
      autresFraisItems: [],
      prixMaterielItems: [],
      prixEquipementBureauItems: [],
    },
  };
}

describe('PDF conformité', () => {
  it('inclut la mention légale officielle demandée', () => {
    textCalls.length = 0;
    genererPDF(makePayload(), 'personne', 'Alice');

    expect(textCalls.some((t) => t.includes('Calcul conforme au BOI-RSA-BASE-30-50 et aux baremes Service-Public 2024/2025.'))).toBe(true);
  });

  it('inclut les libellés détaillés des sous-factures', () => {
    textCalls.length = 0;
    tableCells.length = 0;
    genererPDF(makePayload(), 'personne', 'Alice');

    expect(tableCells.some((t) => t.includes('Facture Internet Fibre'))).toBe(true);
  });
});

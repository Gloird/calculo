/**
 * lib/pdf.js
 * ==========
 * Génère et télécharge le PDF récapitulatif des frais professionnels.
 * Utilise jsPDF 2.5.x + jsPDF-AutoTable 3.8.x
 *
 * Structure du document :
 *  1. En-tête avec titre et date de génération
 *  2. Tableau des frais réels (Catégorie | Montant | Détail)
 *  3. Tableau de comparaison (Frais réels vs Abattement 10 %)
 *  4. Sources légales (URLs officielles)
 *  5. Avertissement en rouge
 *  6. Pied de page numéroté sur chaque page
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { eur, rond } from './calculs.js';

// ─── Palette couleurs ─────────────────────────────────────────────────────────
const C_DARK   = [15,  23,  80];
const C_BLUE   = [59,  130, 246];
const C_INDIGO = [99,  102, 241];
const C_GREY   = [75,  85,  99];
const C_LGREY  = [156, 163, 175];
const C_RED    = [220, 38,  38];
const C_GREEN  = [5,   150, 105];
const C_BG_REC = [209, 250, 229];

function formatDetailedItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '\u2013';
  return items
    .map((item) => `${item.label || 'Sans libellé'} : ${eur(Number(item.amount || 0))}`)
    .join(' · ');
}

function sumDetailedItems(items = []) {
  if (!Array.isArray(items)) return 0;
  return rond(items.reduce((s, item) => s + Number(item.amount || 0), 0));
}

/**
 * Génère et télécharge le PDF.
 * @param {object} resultats - objet retourné par useCalculo.resultats
 * @param {'personne'|'foyer'} mode
 * @param {string} membreNom
 */
export function genererPDF(resultats, mode = 'personne', membreNom = 'Membre') {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const r      = resultats;
  const cfg    = r.cfg;
  const an     = r.annee;
  const mX     = 14;  // marge horizontale
  const lW     = 182; // largeur utile

  // ── En-tête ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...C_DARK);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Calculo', mX, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Recapitulatif Frais Professionnels \u2013 Annee ${an} (Declaration ${cfg.declaration}) ${mode === 'personne' ? `- ${membreNom}` : '- Foyer'}`,
    mX, 21
  );

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.text(`Genere le ${dateStr}`, 210 - mX, 21, { align: 'right' });

  let y = 38;

  // ── Salaire de référence ──────────────────────────────────────────────────────
  if (r.salaire) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C_GREY);
    doc.text(`Salaire net imposable annuel : ${eur(r.salaire)}`, mX, y);
    y += 7;
  }

  // ═══ 1. Tableau des frais réels ═════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C_DARK);
  doc.text('1. Detail des Frais Reels', mX, y);
  y += 3;

  const lignesReels = [
    ['Transport (bareme KM)',    eur(r.km?.montant    ?? 0), r.km?.detail    ?? '\u2013'],
    ['Transports alternatifs',   eur(r.transportsAlternatifs?.montant ?? 0), r.transportsAlternatifs?.detail ?? '\u2013'],
    ['Repas professionnels',     eur(r.repas?.montant ?? 0), r.repas?.detail ?? '\u2013'],
    ['Reception professionnelle', eur(r.reception?.montant ?? 0), r.reception?.detail ?? '\u2013'],
    ['Teletravail',              eur(r.tt?.montant    ?? 0), r.tt?.detail    ?? '\u2013'],
    ['Quote-part bureau',        eur(r.quotePartBureau?.montant ?? 0), r.quotePartBureau?.detail ?? '\u2013'],
    ['Equipement bureau',        eur(r.amortissementEquipementBureau?.montant ?? 0), r.amortissementEquipementBureau?.detail ?? '\u2013'],
    ['Double residence',         eur(r.doubleResidence?.montant ?? 0), r.doubleResidence?.detail ?? '\u2013'],
    ['Frais de demenagement',    eur(r.demenagement?.montant ?? 0), r.demenagement?.detail ?? '\u2013'],
    ['Amortissement materiel',   eur(r.amortissement?.montant ?? 0), r.amortissement?.detail ?? '\u2013'],
    ['Formation',                eur(r.formation?.montant ?? 0), r.formation?.detail ?? '\u2013'],
    ['Recherche emploi',         eur(r.rechercheEmploi?.montant ?? 0), r.rechercheEmploi?.detail ?? '\u2013'],
    ['Cotisations syndicales/pro', eur(r.syndicale?.montant ?? 0), r.syndicale?.detail ?? '\u2013'],
    ['Defense juridique',        eur(r.defenseJuridique?.montant ?? 0), r.defenseJuridique?.detail ?? '\u2013'],
    ['Cotisations obligatoires', eur(r.cotisationsObligatoires?.montant ?? 0), r.cotisationsObligatoires?.detail ?? '\u2013'],
    ['Sante',                    eur(r.sante?.montant ?? 0), r.sante?.detail ?? '\u2013'],
    ['Handicap',                 eur(r.handicap?.montant ?? 0), r.handicap?.detail ?? '\u2013'],
    ['Voyages professionnels',   eur(r.missions?.montant ?? 0), r.missions?.detail ?? '\u2013'],
    ['Frais bancaires',          eur(r.banque?.montant ?? 0), r.banque?.detail ?? '\u2013'],
    ['Vetements speciaux',       eur(r.vetements?.montant ?? 0), r.vetements?.detail ?? '\u2013'],
    ['Autres frais',             eur(r.autres?.montant ?? 0), r.autres?.detail ?? '\u2013'],
    [
      { content: 'TOTAL Frais Reels', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: eur(r.total ?? 0),   styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: C_DARK } },
      { content: '',                  styles: { fillColor: [241, 245, 249] } },
    ],
  ];

  autoTable(doc, {
    startY: y,
    head:   [['Categorie', 'Montant Deduit', 'Detail du Calcul']],
    body:   lignesReels,
    margin: { left: mX, right: mX },
    headStyles:  { fillColor: C_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { fontSize: 8, textColor: C_GREY, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 28, halign: 'right' },
      2: { cellWidth: 108 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { overflow: 'linebreak', lineWidth: 0.1, lineColor: [220, 220, 220] },
  });
  y = doc.lastAutoTable.finalY + 8;

  // ═══ 1.b Détails des montants saisis (multi-lignes) ════════════════════════
  const formDetails = r.formDetails || {};
  const detailThemes = [
    {
      label: 'Charges bureau',
      items: formDetails.chargesBureauItems,
      source: 'BOI-RSA-BASE-30-50-10, §510 / Loi de Finances 2026',
    },
    {
      label: 'Abonnements bureau (Tel/Net)',
      items: formDetails.abonnementsBureauItems,
      source: 'CGI Art. 83-3° / BOI-RSA-BASE-30-50-20',
    },
    {
      label: 'Charges double residence',
      items: formDetails.chargesDoubleResidenceItems,
      source: 'BOI-RSA-BASE-30-50-10, §510 / Loi de Finances 2026',
    },
    {
      label: 'Materiel professionnel',
      items: formDetails.prixMaterielItems,
      source: 'BOI-BIC-AMT-20-20 / CGI Art. 39',
    },
    {
      label: 'Equipement bureau',
      items: formDetails.prixEquipementBureauItems,
      source: 'BOI-BIC-AMT-20-20 / CGI Art. 39',
    },
    {
      label: 'Autres frais detailles',
      items: formDetails.autresFraisItems,
      source: 'CGI Art. 83-3° / BOI-RSA-BASE-30-50',
    },
  ].filter((theme) => Array.isArray(theme.items) && theme.items.length > 0);

  if (detailThemes.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C_DARK);
    doc.text('1.b Detail des Montants Saisis', mX, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Thematique', 'Total saisi', 'Details postes', 'Source legale']],
      body: detailThemes.map((theme) => [
        theme.label,
        eur(sumDetailedItems(theme.items)),
        formatDetailedItems(theme.items),
        theme.source,
      ]),
      margin: { left: mX, right: mX },
      headStyles: { fillColor: C_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7, textColor: C_GREY, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 24, halign: 'right' },
        2: { cellWidth: 76 },
        3: { cellWidth: 47 },
      },
      styles: { overflow: 'linebreak', lineWidth: 0.1, lineColor: [220, 220, 220] },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ═══ 1.c Justifications (poste/calc/source) ═════════════════════════════════
  if (Array.isArray(r.justificatifs) && r.justificatifs.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C_DARK);
    doc.text('1.c Blocs de Justification', mX, y);
    y += 3;

    const lignesJustif = r.justificatifs.map((j) => [
      j.poste,
      j.calcul,
      j.justification,
      j.source,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Poste', 'Calcul', 'Justification', 'Source']],
      body: lignesJustif,
      margin: { left: mX, right: mX },
      headStyles: { fillColor: C_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7, textColor: C_GREY, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 38 },
      },
      styles: { overflow: 'linebreak', lineWidth: 0.1, lineColor: [220, 220, 220] },
    });
    y = doc.lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C_GREY);
    doc.text('Cases déclaration commune indicatives (1AK, 1BK, ...) pour copie dans la déclaration foyer.', mX, y);
    y += 6;
  }

  // ═══ 2. Comparaison abattement 10 % ═══════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C_DARK);
  doc.text("2. Comparaison avec l'Abattement Forfaitaire 10 %", mX, y);
  y += 3;

  const totalReels      = r.total ?? 0;
  const totalAbattement = r.abattement?.montant ?? 0;

  let recommandation, gainInfo;
  if (totalReels > totalAbattement) {
    recommandation = 'Frais Reels (plus avantageux)';
    gainInfo       = `Gain : +${eur(rond(totalReels - totalAbattement))}`;
  } else if (totalAbattement > totalReels) {
    recommandation = 'Abattement 10 % (plus avantageux)';
    gainInfo       = `Gain : +${eur(rond(totalAbattement - totalReels))}`;
  } else if (totalReels > 0) {
    recommandation = 'Egalite \u2013 options equivalentes';
    gainInfo       = '\u2013';
  } else {
    recommandation = '\u2013 (saisir les donnees)';
    gainInfo       = '\u2013';
  }

  const lignesComp = [
    ['Frais Reels (postes ci-dessus)', eur(totalReels),      'Somme cumulee de tous les postes'],
    ['Abattement forfaitaire 10 %',    eur(totalAbattement), r.abattement?.detail ?? '\u2013'],
    [
      { content: '\u2713 Option recommandee', styles: { fontStyle: 'bold', fillColor: C_BG_REC } },
      { content: gainInfo,                    styles: { fontStyle: 'bold', fillColor: C_BG_REC, textColor: C_GREEN } },
      { content: recommandation,              styles: { fontStyle: 'bold', fillColor: C_BG_REC, textColor: C_GREEN } },
    ],
  ];

  autoTable(doc, {
    startY: y,
    head:   [['Option', 'Montant', 'Detail']],
    body:   lignesComp,
    margin: { left: mX, right: mX },
    headStyles:  { fillColor: C_INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { fontSize: 8, textColor: C_GREY, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 62 },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 88 },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { overflow: 'linebreak', lineWidth: 0.1, lineColor: [220, 220, 220] },
  });
  y = doc.lastAutoTable.finalY + 10;

  if (mode === 'foyer' && Array.isArray(r.foyerRows) && r.foyerRows.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C_DARK);
    doc.text('2.b Vue d\'ensemble foyer', mX, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [['Case', 'Membre', 'Frais reels', 'Abattement 10%', 'Gain']],
      body: r.foyerRows.map((row) => [row.caseDeclaration || '-', row.prenom, eur(row.total), eur(row.abattement), eur(row.gain)]),
      margin: { left: mX, right: mX },
      headStyles: { fillColor: C_INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: C_GREY, cellPadding: 3 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (y > 230) { doc.addPage(); y = 20; }

  // ═══ 3. Sources légales ══════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...C_DARK);
  doc.text('3. Sources Legales', mX, y);
  y += 7;

  const sources = [
    {
      label: 'Loi de Finances 2025 (revenus 2024) :',
      url:   'https://www.legifrance.gouv.fr',
    },
    ...(an === 2025
      ? [{
          label: 'Loi de Finances 2026, Article [X] :',
          url:   'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053508155',
        }]
      : []),
    {
      label: 'BOI-RSA-BASE-30-50 (frais reels) :',
      url:   'https://bofip.impots.gouv.fr',
    },
    {
      label: 'Abattement 10 % (plancher & plafond) :',
      url:   'https://www.service-public.fr/particuliers/vosdroits/F408',
    },
    {
      label: 'Frais de repas professionnels :',
      url:   'https://www.service-public.fr/particuliers/vosdroits/F1981',
    },
    {
      label: 'Bareme kilometrique & teletravail :',
      url:   'https://www.impots.gouv.fr/particulier/questions/quels-sont-les-frais-que-je-peux-deduire',
    },
    {
      label: 'Deduction des frais reels (guide complet) :',
      url:   'https://www.impots.gouv.fr/particulier/les-frais-reels',
    },
  ];

  for (const src of sources) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C_GREY);
    doc.text(`\u2022 ${src.label}`, mX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_BLUE);
    doc.text(src.url, mX + 5, y + 4.5);
    y += 11;
  }

  y += 4;
  if (y > 258) { doc.addPage(); y = 20; }

  // ═══ 4. Avertissement en rouge ═══════════════════════════════════════════════
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...C_RED);
  doc.roundedRect(mX, y, lW, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C_RED);
  doc.text('\u26A0 Avertissement important', mX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    "L'application Calculo n'est pas responsable des erreurs de saisie. Ce document est une aide au calcul,",
    mX + 4, y + 12
  );
  doc.text(
    'conservez vos factures originales pendant 3 ans. Consultez un conseiller fiscal pour validation.',
    mX + 4, y + 17
  );

  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...C_GREY);
  doc.text(
    "L'optimisation inclut les frais de double residence et d'amortissement de materiel selon les directives du BOFIP 2025/2026.",
    mX,
    Math.min(y, 286)
  );

  // ── Pied de page sur chaque page ──────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C_LGREY);
    doc.text(
      `Calculo \u2013 Document genere le ${dateStr} \u00B7 Page ${p}/${pageCount}`,
      105, 292,
      { align: 'center' }
    );
  }

  doc.save(`Calculo_FraisPro_${an}.pdf`);
}

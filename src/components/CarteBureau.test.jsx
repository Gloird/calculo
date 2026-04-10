import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CarteBureau from './CarteBureau.jsx';

function makeForm() {
  return {
    joursTeletravail: '',
    surfaceBureau: '',
    surfaceTotale: '',
    loyerAnnuelBureau: '',
    amortissementProprietaireBureau: '',
    chargesBureau: '',
    taxeFonciereBureau: '',
    assuranceBureau: '',
    abonnementsBureau: '',
    amenagementBureau: '',
    prixMateriel: '',
    typeMateriel: '',
    prixEquipementBureau: '',
    typeEquipementBureau: '',
    fraisDemenagement: '',
    gardeMeubles: '',
    fraisFormation: '',
    fraisRechercheEmploi: '',
    cotisationSyndicale: '',
    tmi: '',
    fraisDefenseJuridique: '',
    cotisationsOrdresPrevoyance: '',
    resteSanteProthesesVue: '',
    adaptationPosteHandicap: '',
    visasPasseportsVaccins: '',
    blanchissageHotel: '',
    fraisCompteProAgios: '',
    vetementsSpeciaux: '',
    fraisEntretienVetements: '',
    loyerMensuelDoubleResidence: '',
    fraisGestionDoubleResidence: '',
    chargesDoubleResidence: '',
    assuranceDoubleResidence: '',
    taxesDoubleResidence: '',
    fraisAgenceDoubleResidence: '',
    semainesDoubleResidence: '',
    kmArDoubleResidence: '',
    modeTrajetDoubleResidence: 'km',
    trainArDoubleResidence: '',
    autresFrais: '',
    chargesBureauItems: [],
    chargesDoubleResidenceItems: [],
    abonnementsBureauItems: [],
    autresFraisItems: [],
    prixMaterielItems: [],
    prixEquipementBureauItems: [],
  };
}

describe('Bureau & Autres - UX découplée', () => {
  it('découpe la zone en cartes thématiques distinctes', () => {
    const html = renderToStaticMarkup(
      <CarteBureau form={makeForm()} onChange={() => {}} onItemsChange={() => {}} />
    );

    expect(html).toContain('Logement &amp; Teletravail');
    expect(html).toContain('Equipement &amp; Numerique');
    expect(html).toContain('Carriere &amp; Formation');
    expect(html).toContain('Sante &amp; Specifique');
    expect(html).toContain('Double Residence');
    expect(html).toContain('Autres Frais Deductibles');
  });

  it('n’utilise plus d’accordéon (pas de toggle aria-expanded)', () => {
    const html = renderToStaticMarkup(
      <CarteBureau form={makeForm()} onChange={() => {}} onItemsChange={() => {}} />
    );

    expect(html.includes('aria-expanded')).toBe(false);
  });
});

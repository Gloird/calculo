# Calculo

Application React de simulation des frais reels pour la declaration d'impot, avec gestion multi-profils, garage de vehicules, export PDF, et persistance locale versionnee via IndexedDB (Dexie).

## Objectif

Calculo aide a comparer:

- Abattement forfaitaire de 10%
- Option frais reels

Le projet est oriente usage pratique:

- Saisie detaillee des depenses professionnelles
- Calcul automatique de postes fiscaux courants
- Vue foyer pour arbitrer au niveau menage
- Export PDF justifiable

## Fonctionnalites principales

- Calculs fiscaux multi-postes:
  - Transport (forfait km, frais reels, deux-roues)
  - Repas
  - Teletravail
  - Double residence
  - Bureau a domicile (quote-part)
  - Materiel et amortissements
  - Formation, juridique, cotisations, etc.
- Gestion familiale:
  - Plusieurs membres
  - Selection du membre actif
  - Vue agregat foyer
- Garage de vehicules partage:
  - Reutilisation des vehicules entre membres
  - Verification avant suppression d'un vehicule utilise
- Geolocalisation/adresses:
  - Aide au calcul de distance domicile-travail
- Aides UX:
  - Tooltips explicatifs
  - Calculatrices integrees (annuel 12 mois, annuel precis, km, amortissement)
- Export PDF:
  - Version personne
  - Version foyer
  - Details et traces de justification
- Persistance locale versionnee:
  - Dexie + IndexedDB
  - Migration automatique de l'ancien localStorage

## Stack technique

- Frontend: React 18 + Vite
- UI: Tailwind CSS
- Tests: Vitest
- PDF: jsPDF + jspdf-autotable
- Persistance: Dexie (IndexedDB)

## Prerequis

- Node.js 18+
- npm 9+

## Installation

1. Cloner le projet
2. Installer les dependances

```bash
npm install
```

## Lancement

### Developpement

```bash
npm run dev
```

### Build production

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

### Tests

```bash
npm run test
```

ou en mode execution unique:

```bash
npm run test:run
```

## Scripts npm

- dev: demarre Vite en local
- build: build production
- preview: sert le build localement
- test: lance Vitest
- test:run: execute les tests une seule fois

## Structure du projet

```text
src/
  App.jsx
  main.jsx
  index.css
  config/
    fiscale.js
  hooks/
    useCalculo.js
  lib/
    calculs.js
    calculs.test.js
    geo.js
    pdf.js
    storage.js
  components/
    Header.jsx
    Footer.jsx
    DashboardFamille.jsx
    CarteRevenus.jsx
    CarteTransport.jsx
    CarteRepas.jsx
    CarteBureau.jsx
    SectionSynthese.jsx
    VueFoyer.jsx
    ui/
      Card.jsx
      InputField.jsx
```

## Persistance et gestion de versions

La persistance est geree dans src/lib/storage.js via Dexie.

- Base IndexedDB: calculo_db
- Table: appState
- Enregistrement unique: id = app-state
- Version de schema actuelle: 2

Comportement:

- Au demarrage, l'app lit l'etat depuis IndexedDB
- Si vide, elle tente une migration depuis localStorage (ancienne cle calculo_family_v1)
- Toute modification est resauvegardee en local

Aucune donnee n'est envoyee a un serveur.

## Donnees fiscales

Les parametres fiscaux sont centralises dans src/config/fiscale.js.

Points importants:

- Support des annees de revenus 2024 et 2025
- Parametres repas, abattement, teletravail, baremes km, majoration electrique
- Valeurs documentees et sourcees dans le fichier

## Workflow d'utilisation recommande

1. Configurer les membres du foyer
2. Configurer le garage de vehicules
3. Choisir le membre actif
4. Remplir les cartes de saisie (revenus, transport, repas, bureau/autres)
5. Verifier la synthese
6. Comparer en vue foyer
7. Exporter en PDF (mode personne ou foyer)

## Qualite et tests

Le projet inclut des tests unitaires dans src/lib/calculs.test.js couvrant les principaux scenarios de calcul.

Bonnes pratiques recommandees:

- Ajouter un test a chaque evolution de regle fiscale
- Verifier build + tests avant merge

## Accessibilite UX

Les champs supportent:

- Bouton aide
- Bouton calculette
- Remplissage automatique apres calcul

Objectif: reduire les erreurs de saisie et rendre la simulation plus pedagogique.

## Confidentialite

- Donnees stockees uniquement en local (navigateur)
- Pas de backend
- Pas de transmission reseau des donnees personnelles de saisie

## Limites connues

- Outil d'aide a la simulation: ne remplace pas un conseil fiscal personnalise
- Certaines interpretations peuvent dependre du contexte exact du contribuable
- Toujours verifier les regles officielles en vigueur a la date de declaration

## Depannage

### npm run dev echoue

Verifier:

- Version Node/npm
- Installation complete des dependances
- Port local disponible

Relancer:

```bash
npm install
npm run dev
```

### Donnees incoherentes en local

- Utiliser la reinitialisation depuis l'interface
- Ou vider le stockage du site dans les outils navigateur

### Build avec warning de chunk trop gros

Ce warning n'est pas bloquant. Optimisations possibles:

- Decoupage dynamique des modules
- Configuration manuelle des chunks dans Vite

## Evolution recommandee

- Ajouter tests UI (Playwright ou equivalent)
- Versionner davantage les migrations Dexie (v3, v4...)
- Ajouter ecran de changelog fiscal par annee

## Avertissement legal

Calculo est fourni a titre informatif et d'aide a la preparation. L'utilisateur reste responsable de sa declaration.

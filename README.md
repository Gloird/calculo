# Calculo

Application React de simulation des frais reels pour la declaration d'impot.
Calculo permet de comparer rapidement l'abattement forfaitaire de 10% et l'option frais reels, avec une gestion multi-membres du foyer, un garage de vehicules partage, et un export PDF detaille.

## Objectif

Calculo est concu pour un usage pratique:

- saisie structuree des depenses professionnelles
- calcul fiscal automatique par poste
- arbitrage au niveau du foyer
- generation d'un recap PDF exploitable

## Fonctionnalites principales

### Calculs fiscaux

- transport multi-lignes (bareme km auto/deux-roues, frais reels, transports alternatifs)
- repas professionnels
- teletravail
- double residence
- bureau a domicile (quote-part)
- equipement et amortissements
- autres postes: formation, recherche emploi, cotisations, defense juridique, sante, handicap, missions, banque, vetements, etc.

### Gestion familiale

- plusieurs membres du foyer
- selection du membre actif
- vue de synthese foyer
- correspondance des cases indicatives de declaration (1AK, 1BK, ...)

### Vehicules et distances

- garage de vehicules partage entre membres
- blocage de suppression d'un vehicule deja reference dans un calcul
- aide geographique pour remplir les distances domicile-travail

### Export PDF

- mode personne
- mode foyer
- detail des postes
- blocs de justification (calcul, contexte, source)

### Persistance locale

- stockage local versionne via IndexedDB (Dexie)
- migration automatique depuis l'ancien localStorage
- aucune donnee envoyee a un serveur

## Stack technique

- React 18 + Vite 5
- Tailwind CSS
- Vitest
- Dexie (IndexedDB)
- jsPDF + jspdf-autotable

## Prerequis

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Commandes utiles

```bash
npm run dev
```

Lance l'application en developpement.

```bash
npm run build
```

Genere le build de production.

```bash
npm run preview
```

Sert localement le build produit.

```bash
npm run test
```

Lance Vitest en mode watch.

```bash
npm run test:run
```

Execute les tests une seule fois.

## Structure du projet

```text
.
  index.html
  package.json
  src/
    App.jsx
    main.jsx
    index.css
    components/
      AlerteDistance.jsx
      CarteBureau.jsx
      CarteRepas.jsx
      CarteRevenus.jsx
      CarteTransport.jsx
      DashboardFamille.jsx
      Footer.jsx
      Header.jsx
      SectionSynthese.jsx
      VueFoyer.jsx
      ui/
        Card.jsx
        DetailedExpenseModal.jsx
        InputField.jsx
    config/
      fiscale.js
    data/
      barems.json
    hooks/
      useCalculo.js
    lib/
      calculs.js
      geo.js
      pdf.js
      storage.js
    logic/
      fiscalEngine.js
```

## Persistance et versionnement

La persistance est geree dans src/lib/storage.js.

- base IndexedDB: calculo_db
- table: appState
- enregistrement unique: id = app-state
- version de schema actuelle: 3

Comportement:

- lecture au demarrage depuis IndexedDB
- migration depuis localStorage (cle legacy: calculo_family_v1) si besoin
- sauvegarde automatique a chaque mise a jour d'etat

## Donnees fiscales

Les regles et constantes fiscales principales sont dans src/config/fiscale.js, et les baremes detaillees dans src/data/barems.json.

Version actuellement supportee dans le code:

- revenus 2024 (declaration 2025)
- revenus 2025 (declaration 2026)

## Qualite et tests

Le projet inclut des tests unitaires sur les zones critiques:

- composants React (cartes, alertes)
- hook metier principal (useCalculo)
- moteur fiscal (logic/fiscalEngine)
- bibliotheques utilitaires (calculs, stockage, PDF, config fiscale)

Commande recommandee avant livraison:

```bash
npm run test:run
npm run build
```

## Workflow utilisateur recommande

1. Creer les membres du foyer
2. Configurer les vehicules
3. Selectionner le membre a traiter
4. Completer les cartes de saisie (revenus, transport, repas, bureau, autres)
5. Verifier la synthese et la recommandation
6. Controler la vue foyer
7. Exporter le PDF (personne ou foyer)

## Confidentialite

- donnees stockees localement dans le navigateur
- pas de backend
- pas de transmission de donnees personnelles

## Limites

- outil d'aide a la simulation, non substitut a un conseil fiscal personnalise
- certains cas peuvent dependre de situations individuelles specifiques
- toujours verifier les sources officielles au moment de la declaration

## Depannage rapide

### Le mode dev ne demarre pas

- verifier la version de Node/npm
- reinstaller les dependances

```bash
npm install
npm run dev
```

### Donnees locales incoherentes

- utiliser la reinitialisation dans l'interface
- ou vider le stockage du site dans le navigateur

### Warning de taille de chunk au build

Ce warning n'est pas bloquant. Pistes d'amelioration:

- decoupage dynamique de modules
- reglages de chunks manuels dans Vite

## Avertissement legal

Calculo est fourni a titre informatif. L'utilisateur reste responsable de sa declaration fiscale.

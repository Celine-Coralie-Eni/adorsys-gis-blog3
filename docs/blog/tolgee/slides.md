---
title: Tolgee – Internationalisation Moderne
lang: fr
description: Découvrez comment intégrer Tolgee pour traduire et localiser vos applications web de manière efficace avec un flux de travail collaboratif.
tags:
  - i18n
  - localization
  - tooling
---

![Tolgee](https://docs.tolgee.io/assets/images/extracted_files-7fa2946e0f64400365e816d27d5321a3.png)

---

title: Tolgee – Internationalisation Moderne
lang: fr
description: Découvrez comment intégrer Tolgee pour traduire et localiser vos applications web de manière efficace avec un flux de travail collaboratif.
tags:

* i18n
* localization
* tooling

---

![Tolgee](https://tolgee.io/img/og-image.png)

---

## Introduction à Tolgee

Tolgee est une **plateforme d’internationalisation moderne** qui simplifie la traduction et la localisation des applications web.
Elle fournit des outils pour gérer les traductions, collaborer avec les équipes et intégrer facilement un système i18n dans vos projets.

---

## Pourquoi utiliser Tolgee ?

1. **Traductions en contexte** (directement dans l’app)
2. **Collaboration en temps réel** entre développeurs et traducteurs
3. **Support multi-framework** (React, Angular, Vue, Next.js, etc.)
4. **API & SDKs** simples à intégrer
5. **Hébergement Cloud ou Self-Hosted**

---

## Installation de Base (React)

```bash
npm install @tolgee/react
```

---

## Exemple d’Intégration

```jsx
import { TolgeeProvider, T } from "@tolgee/react";

<TolgeeProvider
  apiUrl="https://app.tolgee.io"
  apiKey="votre_api_key"
  fallback="fr"
>
  <T keyName="hello_world" />
</TolgeeProvider>
```

---

## Fonctionnalités Clés

* **Inline Editing** – Modifier les traductions directement dans l’UI
* **Tolgee Cloud** – Gestion centralisée des projets de traduction
* **Synchronisation Git** – Pousser et récupérer les fichiers de langue
* **Automatisation** – Import/export des traductions JSON, PO, XLIFF

---

## Flux de Travail Collaboratif

1. Développeurs marquent les clés de traduction dans le code
2. Tolgee détecte automatiquement les clés manquantes
3. Traducteurs ajoutent ou mettent à jour les traductions via l’interface web
4. Les mises à jour sont appliquées en temps réel dans l’app

---

## Avantages

* Gain de temps sur la gestion des fichiers de traduction
* Réduction des erreurs grâce à l’édition en contexte
* Améliore la collaboration entre équipes techniques et linguistiques
* Évolutif pour les projets multi-langues

---

## Conclusion

Tolgee modernise l’internationalisation en rendant la **traduction simple, collaborative et intégrée** au flux de développement.
C’est l’outil idéal pour les équipes qui veulent livrer des applications prêtes pour un marché global.

---

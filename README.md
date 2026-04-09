# SApplication Full Stack Production-Ready – TP3

[![CI](https://github.com/COMTETethan/Ynov_CI_CD_TP3/actions/workflows/ci.yml/badge.svg)](https://github.com/COMTETethan/Ynov_CI_CD_TP3/actions/workflows/ci.yml)

## Description

API Node.js (Hono) pour la gestion de commandes de livraison, avec calculs avancés (frais, promo, surge), validation, tests unitaires et d'intégration, linter, couverture, et pipeline CI/CD complet.

---

## Démarrage rapide

### Lancer le serveur

```bash
npm run start
```

### Lancer les tests unitaires et d'intégration

```bash
npm run test
```

### Lancer le linter

```bash
npm run lint
```

### Lancer la couverture de tests

```bash
npm run test:coverage
```

---

## Qualité & CI/CD

- **Lint** : ESLint (règles recommandées, variables/imports inutiles, code mort)
- **Tests** : Vitest (unitaires + intégration, 160+ tests)
- **Couverture** : Istanbul (seuil 80% minimum, >95% atteint)
- **Pipeline** : GitHub Actions (voir badge ci-dessus)
- **Conventional Commits** respectés

---

## Documentation Swagger

Lancez le serveur puis ouvrez :
```
http://localhost:3000/docs
```

---

## Structure

- `src/` : code source (app, utils, validators)
- `tests/` : tests unitaires et d'intégration
- `.github/workflows/ci.yml` : pipeline CI/CD
- `coverage/` : rapport de couverture (non versionné)

---

## Auteurs

- Ethan (Ynov 2026)

# Budji

Simulateur de budget entièrement **côté client** : carnets (containers) avec lignes revenus/dépenses, activation/inclusion dans le total global, persistance **`localStorage`** sous la clé `tables`.

## Stack (pour les prochains agents)

| Zone | Choix |
|------|--------|
| UI | **React 18** (composants fonctionnels), **TypeScript** |
| Build | **Vite 5** |
| Runtime local / Docker | **Bun** |
| Styles | **CSS “vanilla”** : tokens centralisés dans `src/styles/design-system.css` (couleurs, typo, espacements), styles applicatifs dans `src/styles/app.css` — **pas** de Bootstrap |
| Stockage | `localStorage` via `src/lib/budget.ts` (`loadTables`, `saveTables`, clé `tables`) |

**Retiré** : Vue (fichier `js/main.js` + `vue.min.js`), jQuery, Bootstrap.

## Structure utile

- `src/App.tsx` — état global (carnets, modal, import, flag sauvegarde)
- `src/components/` — UI découpée (`BudgetCard`, `EditModal`, `HeroSection`, etc.)
- `src/lib/budget.ts` — parsing / totaux / import JSON / persistance
- `src/types.ts` — `Bill`, `BudgetTable`
- `index.html` — point d’entrée Vite ; le montage React est dans `src/main.tsx`

## Port HTTP (une seule source)

1. Copier le modèle : `cp .env.example .env`
2. Éditer **uniquement** `PORT` dans `.env` si besoin.

Vite (`bun run dev`, `bun run preview`) lit ce fichier via `vite.config.ts`. **Docker Compose** utilise la même variable : le fichier `.env` à la racine du projet est pris en charge automatiquement pour l’interpolation `${PORT}` (mapping et variable passée au conteneur).

Sans fichier `.env`, le port par défaut est **9012** (défini dans `.env.example` et en repli dans `vite.config.ts` / compose).

## Personnalisation visuelle

Modifier **uniquement** `src/styles/design-system.css` pour le thème (variables `--color-*`, `--font-*`, `--radius-*`, etc.). `app.css` consomme ces variables.

## Commandes (hôte)

```bash
bun install
bun run dev
```

Application : après `bun run dev`, ouvrir **http://localhost:9012** si tu gardes `PORT=9012` dans `.env`, sinon remplace **9012** par la valeur de **`PORT`**.

Build statique :

```bash
bun run build
bun run preview   # sert aussi sur 9012
```

## Docker

```bash
docker compose up --build
```

Le mapping hôte ↔ conteneur suit **`PORT`** (fichier `.env` à la racine, défaut **9012**). Le `docker-compose` monte le répertoire courant pour le hot-reload en dev ; `node_modules` est un volume anonyme pour éviter d’écraser les deps installées dans l’image.

## Import JSON

Le panneau **Import** attend une **chaîne JSON** : tableau de carnets au même format que `localStorage` (voir `normalizeTable` / types dans `src/lib/budget.ts`).

## Notes migration

Les utilisateurs ayant déjà des données sous la clé `tables` en local les retrouvent telles quelles après la bascule React (même schéma : `name`, `bills[]`, `countMe`).

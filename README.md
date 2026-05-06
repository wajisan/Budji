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

## Personnalisation visuelle

Modifier **uniquement** `src/styles/design-system.css` pour le thème (variables `--color-*`, `--font-*`, `--radius-*`, etc.). `app.css` consomme ces variables.

## Commandes (hôte)

```bash
bun install
bun run dev
```

Application : **http://localhost:9012** (port fixé dans `vite.config.ts` et scripts `package.json`).

Build statique :

```bash
bun run build
bun run preview   # sert aussi sur 9012
```

## Docker

```bash
docker compose up --build
```

Même port **9012** (mapping hôte ↔ conteneur). Le `docker-compose` monte le répertoire courant pour le hot-reload en dev ; `node_modules` est un volume anonyme pour éviter d’écraser les deps installées dans l’image.

## Import JSON

Le panneau **Import** attend une **chaîne JSON** : tableau de carnets au même format que `localStorage` (voir `normalizeTable` / types dans `src/lib/budget.ts`).

## Notes migration

Les utilisateurs ayant déjà des données sous la clé `tables` en local les retrouvent telles quelles après la bascule React (même schéma : `name`, `bills[]`, `countMe`).

# Casino Roulette

Composant Vue 3 re-utilisable fournissant une roue de casino animee dessinee sur `<canvas>`. Le package est pense comme une petite librairie publisable (`npm install vue-roulette`) et inclut une demo locale (`npm run dev`).

## Installation

```bash
npm install vue-roulette
```

Ensuite importez le composant (ou le type `RouletteItem`) depuis le package.

## Utilisation rapide

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CasinoRoulette, { type RouletteItem } from 'vue-roulette'

const items = ref<RouletteItem[]>([
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 }
])

const selection = ref<RouletteItem | null>(null)
const rouletteRef = ref<InstanceType<typeof CasinoRoulette> | null>(null)

const onSelect = (item: RouletteItem) => {
  selection.value = item
}

const spin = () => rouletteRef.value?.spin()
</script>

<template>
  <CasinoRoulette
    ref="rouletteRef"
    :items="items"
    :useColor="false"
    @select="onSelect"
  />
  <button @click="spin">Lancer</button>
  <p v-if="selection">Gagnant: {{ selection.label }}</p>
</template>
```

## Props

| Prop | Type | Defaut | Description |
| --- | --- | --- | --- |
| `items` | `RouletteItem[]` | requis | Segments a dessiner. |
| `size` | `number` | `400` | Largeur/hauteur du canvas. |
| `spinDuration` | `number` | `4000` | Duree totale de l'animation (ms). |
| `easingFunction` | `(t: number) => number` | `t => 1 - (1 - t)^4` | Courbe d'acceleration/deceleration. |
| `useColor` | `boolean` | `false` | Utilise la couleur fournie par chaque item quand `true`. |
| `initialVelocity` | `number` | `2000` | Degres par seconde appliques au lancement pour definir le nombre de tours. |
| `initialAngle` | `number` | `0` | Angle de depart. |
| `enableTickSound` | `boolean` | `false` | Active un clic audio a chaque passage de segment. |

### Interface `RouletteItem`

```ts
interface RouletteItem {
  label: string
  value: unknown
  color?: string
}
```

## Evenements emis

| Evenement | Payload | Quand |
| --- | --- | --- |
| `spin-start` | `void` | Lancement d'une rotation. |
| `spin-end` | `void` | Fin de l'animation (vitesse nulle). |
| `select` | `RouletteItem` | Item en face du pointeur apres arret. |
| `update:angle` | `number` | Angle courant (0-360) a chaque frame. |

## Methodes exposees

Referencez le composant via `ref` puis utilisez `defineExpose`:

- `spin(): void` — lance une rotation vers un item choisi aleatoirement.
- `stop(): void` — demande un arret progressif vers l'item actuellement vise.
- `reset(): void` — annule l'animation et ramene l'angle a `initialAngle`.
- `getCurrentItem(): RouletteItem | null` — renvoie l'item sous le pointeur.

## Logique des couleurs

- `useColor = true` : chaque item utilise `item.color` (fallback palette interne si indefinie).
- `useColor = false` : alternance automatique rouge/noir. Si le nombre d'items est impair, une case verte ("0") est ajoutee en position 0 avant d'appliquer l'alternance.

## Demo locale

```bash
npm install
npm run dev
```

La page racine charge `Example.vue`, qui illustre les props, les evenements et les methodes exposees (`spin`, `stop`, `reset`).

## Build et publication

```bash
npm run build
```

- `dist/casino-roulette.js` : module ES.
- `dist/casino-roulette.umd.cjs` : build UMD.
- `dist/index.d.ts` : declarations TypeScript.

Publiez ensuite sur npm (apres connexion) :

```bash
npm publish --access public
```

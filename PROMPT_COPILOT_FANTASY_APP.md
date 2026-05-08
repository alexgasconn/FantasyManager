# 🧠 MEGA-PROMPT PARA COPILOT / CURSOR / WINDSURF
## App de Fantasy Fútbol con Scraping de FutbolFantasy.com

---

## CONTEXTO GENERAL

Eres un experto en desarrollo de aplicaciones web modernas. Voy a darte instrucciones
para construir (o expandir una app existente) una aplicación completa de Fantasy
Fútbol que extrae datos en tiempo real de FutbolFantasy.com mediante scraping,
y los muestra en un dashboard rico con múltiples secciones funcionales.

La app usa tecnología: **Next.js 14 (App Router) + TypeScript + Tailwind CSS +
Shadcn/ui + Recharts + Cheerio/Playwright para scraping**.

---

## PARTE 1: SISTEMA DE SCRAPING — INSTRUCCIONES DETALLADAS

### 1.1 Fuente de datos

La URL base es: `https://www.futbolfantasy.com/laliga/equipos/{slug-equipo}`

Ejemplos de slugs:
```
barcelona, real-madrid, atletico, athletic, betis, celta, espanyol,
getafe, girona, mallorca, osasuna, rayo-vallecano, real-sociedad,
sevilla, valencia, villarreal, alaves, levante, elche
```

### 1.2 Estructura HTML a extraer

Cada jugador está en un `<a>` con `data-probabilidad` dentro de un wrapper
`<div class="jugador_{id} camiseta-wrapper">`.

**Campos disponibles por jugador (todos son atributos `data-*` del `<a>`):**

```typescript
interface PlayerRawData {
  // IDENTIDAD
  nombre: string;           // alt del <img> dentro del <a>
  url: string;              // href del <a>
  edad: string;             // data-edad
  nacionalidad: string;     // data-nacionalidad (código ISO: "ES", "BR"...)
  pie: string;              // data-pie ("Derecho" | "Izquierdo")

  // ESTADO PARA EL PARTIDO
  probabilidad: string;     // data-probabilidad ("95%", "70%", "0%"...)
  estado: string;           // data-estado ("0"=ok, otros=problema)
  lesion: string;           // data-lesion ("-1"=sin lesión, número=días)
  apercibido: string;       // data-apercibido ("0"|"1")
  sancionado: string;       // data-sancionado ("0"|"1")
  nodisponible: string;     // data-nodisponible ("0"|"1")
  vacaciones: string;       // data-vacaciones ("0"|"1")

  // POSICIÓN Y TÁCTICA
  posicion: string;         // data-posicion del DIV padre (Portero/Defensa/Mediocampista/Delantero)
  posicionLaliga: string;   // data-posicionlaligafantasy
  posicionComunio: string;  // data-posicioncomunio
  posicionBiwenger: string; // data-posicion2biwenger

  // PARTIDO PRÓXIMO
  rival: string;            // data-rival (código equipo: "RMD", "ATM"...)
  rivalDifIndex: string;    // data-rival_dif_index ("1"=fácil..."5"=muy difícil)
  locvis: string;           // data-locvis ("🏠"=local | "✈"=visitante)

  // JERARQUÍA EN EL EQUIPO
  jerarquia: string;        // data-jerarquia
                            // "10"=Indiscutible, "20"=Titular habitual,
                            // "30"=Rotación alta, "40"=Importante,
                            // "50"=Suplente, "60"=Marginal, "70"=Cedido

  // FORMA RECIENTE
  forma: string;            // data-forma ("arrow-1"..arrow-5")
                            // arrow-1=muy bajando, arrow-3=estable, arrow-5=muy subiendo
  formaValue: string;       // data-forma_value (número decimal)

  // ESTADÍSTICAS DE TEMPORADA
  totalPartidosJugados: string;        // data-totalpartidosjugados
  totalPartidosJugadosSuplente: string;// data-totalpartidosjugadossuplente
  totalPartidosSustituido: string;     // data-totalpartidossustituido
  totalMinutosJugados: string;         // data-totalminutosjugados
  totalGoles: string;                  // data-totalgoles
  totalAsistencias: string;            // data-totalasistencias
  totalAmarillas: string;              // data-totalamarillas
  totalRojas: string;                  // data-totalrojas
  totalEstrellas: string;              // data-totalestrellas
  totalEstrellasPartido: string;       // data-totalestrellaspartido
  totalNotaCopaPart: string;           // data-totalnotacopepartido
  totalPicas: string;                  // data-totalpicas
  totalPicasPartido: string;           // data-totalpicaspartido

  // PUNTOS TOTALES POR PLATAFORMA
  puntosTotalesLaliga: string;         // data-puntos-totales-laliga-fantasy
  puntosTotalesComunio: string;        // data-puntos-totales-comunio
  puntosTotalesBiwengerSofascore: string; // data-puntos-totales-biwenger-sofascore
  puntosTotalesFutmondoMixto: string;  // data-puntos-totales-futmondo-mixto
  puntosTotalesMisterMixto: string;    // data-puntos-totales-mister-mixto
  puntosTotalesModosPicas: string;     // data-puntos-totales-modo-picas
  puntosTotalesFutbolfantasyRpg: string; // data-puntos-totales-futbolfantasy-rpg

  // MEDIAS POR PARTIDO POR PLATAFORMA
  mediaLaliga: string;          // data-puntos-media-laliga-fantasy
  mediaComunio: string;         // data-puntos-media-comunio
  mediaBiwenger: string;        // data-puntos-media-biwenger-sofascore
  mediaFutmondo: string;        // data-puntos-media-futmondo-mixto
  mediaMister: string;          // data-puntos-media-mister-mixto
  mediaModosPicas: string;      // data-puntos-media-modo-picas
  mediaFutbolfantasyRpg: string;// data-puntos-media-futbolfantasy-rpg

  // VALORES DE MERCADO (en euros, número entero)
  valorLaliga: string;          // data-valor-laliga-fantasy
  valorComunio: string;         // data-valor-comunio
  valorBiwenger: string;        // data-valor-biwenger
  valorFutmondo: string;        // data-valor-futmondo
  valorFantasyMarca: string;    // data-valor-fantasy-marca
  valorMister: string;          // data-valor-mister
  valorBiwengerFantasy: string; // data-valor-biwenger-fantasy

  // VARIACIONES DE VALOR (en euros, puede ser negativo)
  diffLaliga: string;           // data-valor-diff-laliga-fantasy
  diffComunio: string;          // data-valor-diff-comunio
  diffBiwenger: string;         // data-valor-diff-biwenger
  diffFutmondo: string;         // data-valor-diff-futmondo
  diffMister: string;           // data-valor-diff-mister
}
```

### 1.3 Código del scraper (Cheerio — SSR o API Route)

```typescript
// lib/scraper/futbolfantasy.ts
import * as cheerio from 'cheerio';

export async function scrapePlantilla(equipo: string): Promise<PlayerData[]> {
  const url = `https://www.futbolfantasy.com/laliga/equipos/${equipo}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-ES,es;q=0.9',
    },
    next: { revalidate: 3600 } // cache 1 hora
  });

  const html = await res.text();
  const $ = cheerio.load(html);
  const players: PlayerData[] = [];
  const seen = new Set<string>();

  $('a[data-probabilidad]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href') || '';
    if (!href.includes('/jugadores/')) return;

    const img = a.find('img[alt]').first();
    const nombre = img.attr('alt') || '';
    if (!nombre || seen.has(nombre)) return;
    seen.add(nombre);

    // Posición viene del div padre
    const parentDiv = a.closest('div[class*="jugador_"]');
    const posicion = parentDiv.attr('data-posicion') || '';

    const get = (attr: string) => a.attr(attr) || '';

    const probStr = get('data-probabilidad');
    const probVal = parseInt(probStr) || 0;

    // Determinar estado
    const lesion = get('data-lesion');
    const sancionado = get('data-sancionado');
    const apercibido = get('data-apercibido');
    let status: 'disponible' | 'lesionado' | 'sancionado' | 'apercibido' = 'disponible';
    if (lesion !== '-1' && lesion !== '') status = 'lesionado';
    else if (sancionado !== '0') status = 'sancionado';
    else if (apercibido !== '0') status = 'apercibido';

    // Mapear forma
    const formaMap: Record<string, string> = {
      'arrow-1': 'muy_bajando', 'arrow-2': 'bajando',
      'arrow-3': 'estable', 'arrow-4': 'subiendo', 'arrow-5': 'muy_subiendo'
    };

    // Mapear jerarquía
    const jerarquiaMap: Record<string, string> = {
      '10': 'Indiscutible', '20': 'Titular habitual', '30': 'Rotación alta',
      '40': 'Importante', '50': 'Suplente', '60': 'Marginal', '70': 'Reserva'
    };

    players.push({
      nombre,
      url: href,
      posicion,
      edad: parseInt(get('data-edad')) || 0,
      nacionalidad: get('data-nacionalidad'),
      pie: get('data-pie'),
      probabilidad: probStr,
      probabilidadVal: probVal,
      status,
      diasLesion: lesion !== '-1' ? parseInt(lesion) : 0,
      jerarquia: jerarquiaMap[get('data-jerarquia')] || 'Reserva',
      forma: formaMap[get('data-forma')] || 'estable',
      formaValue: parseFloat(get('data-forma_value')) || 1,
      rival: get('data-rival'),
      rivalDificultad: parseInt(get('data-rival_dif_index')) || 3,
      localVisitante: get('data-locvis') === '🏠' ? 'local' : 'visitante',
      stats: {
        partidos: parseInt(get('data-totalpartidosjugados')) || 0,
        partidosSuplente: parseInt(get('data-totalpartidosjugadossuplente')) || 0,
        vecessustituido: parseInt(get('data-totalpartidossustituido')) || 0,
        minutos: parseInt(get('data-totalminutosjugados')) || 0,
        goles: parseInt(get('data-totalgoles')) || 0,
        asistencias: parseInt(get('data-totalasistencias')) || 0,
        amarillas: parseInt(get('data-totalamarillas')) || 0,
        rojas: parseInt(get('data-totalrojas')) || 0,
        picas: parseInt(get('data-totalpicas')) || 0,
        picasPartido: parseFloat(get('data-totalpicaspartido')) || 0,
        estrellas: parseInt(get('data-totalestrellas')) || 0,
        estrellasPartido: parseFloat(get('data-totalestrellaspartido')) || 0,
      },
      fantasy: {
        laliga: {
          media: parseFloat(get('data-puntos-media-laliga-fantasy')) || 0,
          total: parseInt(get('data-puntos-totales-laliga-fantasy')) || 0,
          valor: parseInt(get('data-valor-laliga-fantasy')) || 0,
          diff: parseInt(get('data-valor-diff-laliga-fantasy')) || 0,
        },
        comunio: {
          media: parseFloat(get('data-puntos-media-comunio')) || 0,
          total: parseInt(get('data-puntos-totales-comunio')) || 0,
          valor: parseInt(get('data-valor-comunio')) || 0,
          diff: parseInt(get('data-valor-diff-comunio')) || 0,
        },
        biwenger: {
          media: parseFloat(get('data-puntos-media-biwenger-sofascore')) || 0,
          total: parseInt(get('data-puntos-totales-biwenger-sofascore')) || 0,
          valor: parseInt(get('data-valor-biwenger')) || 0,
          diff: parseInt(get('data-valor-diff-biwenger')) || 0,
        },
        futmondo: {
          media: parseFloat(get('data-puntos-media-futmondo-mixto')) || 0,
          total: parseFloat(get('data-puntos-totales-futmondo-mixto')) || 0,
          valor: parseInt(get('data-valor-futmondo')) || 0,
          diff: parseInt(get('data-valor-diff-futmondo')) || 0,
        },
        mister: {
          media: parseFloat(get('data-puntos-media-mister-mixto')) || 0,
          total: parseInt(get('data-puntos-totales-mister-mixto')) || 0,
          valor: parseInt(get('data-valor-mister')) || 0,
          diff: parseInt(get('data-valor-diff-mister')) || 0,
        },
        picas: {
          media: parseFloat(get('data-puntos-media-modo-picas')) || 0,
          total: parseInt(get('data-puntos-totales-modo-picas')) || 0,
        },
        rpg: {
          media: parseFloat(get('data-puntos-media-futbolfantasy-rpg')) || 0,
          total: parseInt(get('data-puntos-totales-futbolfantasy-rpg')) || 0,
        },
      }
    });
  });

  return players;
}
```

### 1.4 API Route en Next.js

```typescript
// app/api/plantilla/[equipo]/route.ts
import { NextResponse } from 'next/server';
import { scrapePlantilla } from '@/lib/scraper/futbolfantasy';

export async function GET(
  request: Request,
  { params }: { params: { equipo: string } }
) {
  try {
    const data = await scrapePlantilla(params.equipo);
    return NextResponse.json({ success: true, data, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error scraping' }, { status: 500 });
  }
}
```

---

## PARTE 2: TIPOS TYPESCRIPT COMPLETOS

```typescript
// types/fantasy.ts

export type Posicion = 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
export type Status = 'disponible' | 'lesionado' | 'sancionado' | 'apercibido';
export type Forma = 'muy_bajando' | 'bajando' | 'estable' | 'subiendo' | 'muy_subiendo';
export type Plataforma = 'laliga' | 'comunio' | 'biwenger' | 'futmondo' | 'mister';

export interface FantasyStats {
  media: number;
  total: number;
  valor: number;
  diff: number;
}

export interface PlayerData {
  nombre: string;
  url: string;
  posicion: Posicion;
  edad: number;
  nacionalidad: string;
  pie: string;
  probabilidad: string;
  probabilidadVal: number;
  status: Status;
  diasLesion: number;
  jerarquia: string;
  forma: Forma;
  formaValue: number;
  rival: string;
  rivalDificultad: number;  // 1 (fácil) - 5 (muy difícil)
  localVisitante: 'local' | 'visitante';
  stats: {
    partidos: number;
    partidosSuplente: number;
    vecessustituido: number;
    minutos: number;
    goles: number;
    asistencias: number;
    amarillas: number;
    rojas: number;
    picas: number;
    picasPartido: number;
    estrellas: number;
    estrellasPartido: number;
  };
  fantasy: {
    laliga: FantasyStats;
    comunio: FantasyStats;
    biwenger: FantasyStats;
    futmondo: FantasyStats;
    mister: FantasyStats;
    picas: { media: number; total: number };
    rpg: { media: number; total: number };
  };
}

export interface EquipoData {
  slug: string;
  nombre: string;
  jugadores: PlayerData[];
  lastUpdated: number;
}
```

---

## PARTE 3: SECCIONES DE LA APP — IMPLEMENTACIÓN COMPLETA

Implementa TODAS estas secciones. Cada una tiene su lógica de datos y componente.

---

### SECCIÓN 1: MI EQUIPO (Team Management)

**Componente:** `components/MiEquipo.tsx`

**Funcionalidad:**
- El usuario selecciona jugadores de su plantilla (máx 15 según liga)
- Muestra el equipo en una cuadrícula con camisetas
- Por cada jugador: nombre, probabilidad (círculo de color), media en su plataforma,
  valor actual, variación semanal (↑↓) con color verde/rojo
- Barra lateral: valor total del equipo, media combinada, presupuesto restante
- Badge especial si hay lesionados o apercibidos en tu equipo
- Botón "Actualizar datos" que re-hace el scraping
- Estado local en `localStorage` para persistir el equipo

**Lógica de probabilidad de color:**
```typescript
function probColor(val: number): string {
  if (val >= 80) return 'green';   // Muy probable
  if (val >= 60) return 'lime';    // Probable
  if (val >= 40) return 'yellow';  // Dudoso
  if (val >= 20) return 'orange';  // Poco probable
  if (val > 0)   return 'red';     // Casi imposible
  return 'gray';                    // No juega / lesionado
}
```

---

### SECCIÓN 2: FORMACIÓN TÁCTICA (Pitch View)

**Componente:** `components/Formacion.tsx`

**Funcionalidad:**
- Campo de fútbol visual (SVG o div con gradiente verde)
- Los jugadores se colocan en el campo según su posición
- Formaciones disponibles: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2
- Drag & drop para reorganizar jugadores en el campo
- Cada camiseta muestra: foto miniatura, nombre, probabilidad como color
  de fondo (verde/amarillo/rojo), media de puntos
- Selector de plataforma (LaLiga Fantasy / Comunio / Biwenger / etc.)
  que cambia qué medias se muestran
- Resaltar en rojo los jugadores con < 50% probabilidad (dudosos)

**Datos del campo (posición CSS en %):**
```typescript
const posicionesEnCampo = {
  '4-3-3': {
    portero: [{ x: 50, y: 88 }],
    defensas: [{ x:15,y:70},{x:35,y:70},{x:65,y:70},{x:85,y:70}],
    medios:   [{ x:25,y:50},{x:50,y:50},{x:75,y:50}],
    delanteros:[{x:20,y:25},{x:50,y:20},{x:80,y:25}]
  },
  // ... resto de formaciones
}
```

---

### SECCIÓN 3: MERCADO DE FICHAJES

**Componente:** `components/Mercado.tsx`

**Funcionalidad:**
- Tabla completa de TODOS los jugadores de UN equipo seleccionado
  (scraping del equipo elegido en el selector)
- Columnas: Jugador | Pos | Prob% | Jerarquía | Media LL | Media Biwenger |
  Valor LaLiga | Variación | Goles | Asist | Minutos | Forma
- Ordenar por cualquier columna (click en header)
- Filtros: por posición, por probabilidad mínima (slider), por plataforma,
  por estado (solo disponibles, mostrar lesionados...)
- Búsqueda por nombre
- Resaltar en verde jugadores con valor subiendo, rojo bajando
- Botón "Añadir a mi equipo" por jugador
- Mini-chart sparkline (últimas 5 jornadas de puntos)
- Color de forma con icono: 🔥 subiendo mucho, ↗ subiendo, → estable, ↘ bajando

---

### SECCIÓN 4: PREDICCIONES DE ALINEACIÓN

**Componente:** `components/Predicciones.tsx`

**Funcionalidad:**
- Muestra el once más probable según probabilidades scraped
- Algoritmo: tomar los 1 portero, 4 defensas, 3-4 medios, 3 delanteros
  con mayor probabilidad (> 60%)
- "Once probable" vs "Once alternativo" (tabs)
- Por jugador: probabilidad animada como progress bar, jerarquía, forma,
  rival con dificultad coloreada (verde=fácil, rojo=difícil), local/visitante
- Sección "Dudosos": jugadores entre 30-60% con explicación del estado
- Sección "Bajas confirmadas": jugadores al 0% con razón (lesionado/sancionado)
- Consejo fantasy: "Mejor capitán" (mayor media * probabilidad),
  "Mejor fichaje" (mejor ratio valor/media), "Evitar" (apercibidos + titular habitual)

---

### SECCIÓN 5: SCORES Y PUNTUACIONES

**Componente:** `components/Scores.tsx`

**Funcionalidad:**
- Tabla de puntuaciones de MI equipo por jornada
- Para cada jugador: sus puntos en cada plataforma (LaLiga, Comunio, Biwenger,
  Futmondo, Mister) lado a lado
- Selector de jornada (J1 - J38)
- Gráfica de barras: comparativa de puntos totales por jornada de todo el equipo
- Gráfica de líneas: evolución de mi equipo vs media de la liga en cada jornada
- Tabla resumen: jugador, partidos, total puntos, media, mejor jornada, peor jornada
- Código de colores por puntuación:
  - 🔴 < 4 puntos (mala jornada)
  - 🟡 4-6 puntos (normal)
  - 🟢 > 6 puntos (buena jornada)
  - 💎 > 10 puntos (jornada premium)

---

### SECCIÓN 6: PRÓXIMOS RIVALES (Fixture Analysis)

**Componente:** `components/ProximosRivales.tsx`

**Funcionalidad:**
- Para cada jugador de MI equipo, muestra las próximas 5 jornadas
- Indicador de dificultad por jornada (1-5 estrellas, coloreado):
  1-2 = verde (fácil), 3 = amarillo (normal), 4-5 = rojo (difícil)
- Local (🏠) / Visitante (✈) por jornada
- Score de "Calidad del fixture" = media de dificultad de las próximas 3 jornadas
- Ranking de jugadores de mi equipo ordenados por mejor fixture
- Vista "Jornada ideal": qué semana tiene mejor fixture tu equipo completo
- Heatmap visual: filas = jugadores, columnas = jornadas, color = dificultad

---

### SECCIÓN 7: ESTADÍSTICAS Y GRÁFICAS

**Componente:** `components/Graficas.tsx`

**Sub-secciones con tabs:**

**7a. Comparativa de jugadores**
- Radar chart comparando hasta 3 jugadores: goles, asistencias, media puntos,
  minutos, picas/partido, valor mercado
- Selector de plataforma para los puntos

**7b. Evolución de valor de mercado**
- Línea temporal del valor de cada jugador de mi equipo
- Con indicadores de jornadas (cuándo subió/bajó el valor)
- Usando `data-valor-diff-*` para construir la curva retroactiva

**7c. Distribución de mi plantilla**
- Pie chart: distribución por posición
- Pie chart: distribución por jerarquía (titulares vs rotación vs suplentes)
- Pie chart: distribución por probabilidad (>80%, 60-80%, <60%)

**7d. Top performers**
- Bar chart horizontal: top 10 jugadores por media en la plataforma seleccionada
- Filtrable por posición
- Coloreado por forma (verde=subiendo, rojo=bajando)

**7e. Análisis de riesgo**
- Scatter plot: eje X = valor mercado, eje Y = media puntos
- Tamaño del punto = probabilidad de jugar
- Color = forma
- Cuadrantes: "Joya" (alto valor, alta media), "Sobrevalorado", "Ganga", "Evitar"

---

### SECCIÓN 8: JUGADORES (Plantilla completa / Explorador)

**Componente:** `components/Jugadores.tsx`

**Funcionalidad:**
- Vista de cards (grid) o tabla — toggle entre las dos
- Selector de equipo (desplegable con los 20 equipos de LaLiga)
  → dispara nuevo scraping de ese equipo
- Cada card muestra:
  - Foto del jugador (desde `media.futbolfantasy.com/thumb/150x150/...`)
  - Nombre, edad, posición, nacionalidad (bandera)
  - Probabilidad: círculo grande coloreado
  - Status badge: 🏥 Lesionado / ⚠️ Apercibido / ✅ Disponible
  - Jerarquía: "Indiscutible", "Titular habitual", etc.
  - Forma: flecha animada (↑ / → / ↓)
  - Stats compactos: G/A/Min/Amarillas
  - Medias: LL Fantasy | Comunio | Biwenger (tabs o dropdown)
  - Valores de mercado + variación (+/-)
- Click en card → panel lateral con todos los datos
- Export a CSV de los datos filtrados
- Comparar: seleccionar 2-3 jugadores para ver radar comparativo

---

## PARTE 4: STORE GLOBAL (Zustand)

```typescript
// store/fantasyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerData, Plataforma } from '@/types/fantasy';

interface FantasyStore {
  // Mi equipo
  miEquipo: PlayerData[];
  addJugador: (player: PlayerData) => void;
  removeJugador: (nombre: string) => void;

  // Plataforma activa
  plataformaActiva: Plataforma;
  setPlataforma: (p: Plataforma) => void;

  // Cache de datos por equipo
  equiposCache: Record<string, { data: PlayerData[], timestamp: number }>;
  setEquipoData: (slug: string, data: PlayerData[]) => void;

  // Presupuesto
  presupuestoTotal: number;
  setPresupuesto: (n: number) => void;

  // UI
  equipoSeleccionado: string;
  setEquipoSeleccionado: (slug: string) => void;
}

export const useFantasyStore = create<FantasyStore>()(
  persist(
    (set, get) => ({
      miEquipo: [],
      plataformaActiva: 'laliga',
      equiposCache: {},
      presupuestoTotal: 100000000,
      equipoSeleccionado: 'barcelona',

      addJugador: (player) => set(state => ({
        miEquipo: [...state.miEquipo.filter(p => p.nombre !== player.nombre), player]
      })),
      removeJugador: (nombre) => set(state => ({
        miEquipo: state.miEquipo.filter(p => p.nombre !== nombre)
      })),
      setPlataforma: (p) => set({ plataformaActiva: p }),
      setEquipoData: (slug, data) => set(state => ({
        equiposCache: {
          ...state.equiposCache,
          [slug]: { data, timestamp: Date.now() }
        }
      })),
      setPresupuesto: (n) => set({ presupuestoTotal: n }),
      setEquipoSeleccionado: (slug) => set({ equipoSeleccionado: slug }),
    }),
    { name: 'fantasy-store' }
  )
);
```

---

## PARTE 5: HOOK PARA SCRAPING CON CACHÉ

```typescript
// hooks/useEquipoData.ts
import { useEffect, useState } from 'react';
import { useFantasyStore } from '@/store/fantasyStore';
import { PlayerData } from '@/types/fantasy';

const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export function useEquipoData(equipoSlug: string) {
  const { equiposCache, setEquipoData } = useFantasyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cached = equiposCache[equipoSlug];
  const isStale = !cached || Date.now() - cached.timestamp > CACHE_TTL;

  useEffect(() => {
    if (!isStale) return;

    setLoading(true);
    fetch(`/api/plantilla/${equipoSlug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setEquipoData(equipoSlug, res.data);
        else setError('Error cargando datos');
      })
      .catch(() => setError('Error de red'))
      .finally(() => setLoading(false));
  }, [equipoSlug, isStale]);

  return {
    jugadores: cached?.data ?? [],
    loading,
    error,
    lastUpdated: cached?.timestamp,
    refresh: () => { /* forzar revalidación */ }
  };
}
```

---

## PARTE 6: FUNCIONES UTILITARIAS IMPORTANTES

```typescript
// lib/utils/fantasy.ts

// Valor formateado
export function fmtValor(v: number, plataforma?: string): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
}

// Variación con signo y color
export function fmtDiff(diff: number): { text: string; color: string } {
  if (diff > 0) return { text: `+${fmtValor(diff)}`, color: 'green' };
  if (diff < 0) return { text: fmtValor(diff), color: 'red' };
  return { text: '=', color: 'gray' };
}

// Calcular puntuación de riesgo/valor para scatter plot
export function calcRiskScore(player: PlayerData, plataforma: Plataforma): number {
  const media = player.fantasy[plataforma].media;
  const prob = player.probabilidadVal / 100;
  return media * prob; // "expected points"
}

// Mejor once probable (algoritmo greedy)
export function calcOnceProbable(jugadores: PlayerData[], formacion = '4-3-3'): PlayerData[] {
  const [def, med, del] = formacion.split('-').map(Number);
  const disponibles = jugadores.filter(j => j.probabilidadVal > 0);

  const sort = (pos: string, n: number) =>
    disponibles
      .filter(j => j.posicion === pos)
      .sort((a, b) => b.probabilidadVal - a.probabilidadVal)
      .slice(0, n);

  return [
    ...sort('Portero', 1),
    ...sort('Defensa', def),
    ...sort('Mediocampista', med),
    ...sort('Delantero', del),
  ];
}

// Score de fixture (1=facilísimo, 10=imposible)
export function fixtureScore(rivalDificultad: number, localVisitante: 'local' | 'visitante'): number {
  const base = rivalDificultad * 2;
  const bonus = localVisitante === 'local' ? -1 : +1;
  return Math.max(1, Math.min(10, base + bonus));
}

// Forma como emoji + color
export function formaDisplay(forma: string): { emoji: string; color: string; label: string } {
  const map: Record<string, { emoji: string; color: string; label: string }> = {
    'muy_bajando': { emoji: '↓↓', color: '#E24B4A', label: 'Muy mal' },
    'bajando':     { emoji: '↓',  color: '#D85A30', label: 'Bajando' },
    'estable':     { emoji: '→',  color: '#888780', label: 'Estable' },
    'subiendo':    { emoji: '↑',  color: '#639922', label: 'Subiendo' },
    'muy_subiendo':{ emoji: '↑↑', color: '#1D9E75', label: 'En forma' },
  };
  return map[forma] || map['estable'];
}
```

---

## PARTE 7: EQUIPOS DE LALIGA — CATÁLOGO COMPLETO

```typescript
// data/equipos.ts
export const EQUIPOS_LALIGA = [
  { slug: 'alaves',        nombre: 'Alavés',        id: 28 },
  { slug: 'athletic',      nombre: 'Athletic Club',  id: 1  },
  { slug: 'atletico',      nombre: 'Atlético Madrid',id: 2  },
  { slug: 'barcelona',     nombre: 'Barcelona',      id: 3  },
  { slug: 'betis',         nombre: 'Betis',          id: 4  },
  { slug: 'celta',         nombre: 'Celta de Vigo',  id: 5  },
  { slug: 'elche',         nombre: 'Elche',          id: 21 },
  { slug: 'espanyol',      nombre: 'Espanyol',       id: 7  },
  { slug: 'getafe',        nombre: 'Getafe',         id: 8  },
  { slug: 'girona',        nombre: 'Girona',         id: 30 },
  { slug: 'levante',       nombre: 'Levante',        id: 10 },
  { slug: 'mallorca',      nombre: 'Mallorca',       id: 12 },
  { slug: 'osasuna',       nombre: 'Osasuna',        id: 13 },
  { slug: 'rayo-vallecano',nombre: 'Rayo Vallecano', id: 14 },
  { slug: 'real-madrid',   nombre: 'Real Madrid',    id: 15 },
  { slug: 'real-sociedad', nombre: 'Real Sociedad',  id: 16 },
  { slug: 'sevilla',       nombre: 'Sevilla',        id: 17 },
  { slug: 'valencia',      nombre: 'Valencia',       id: 18 },
  { slug: 'villarreal',    nombre: 'Villarreal',     id: 22 },
  { slug: 'real-oviedo',   nombre: 'Real Oviedo',    id: 43 },
];

// URL de escudo: https://static.futbolfantasy.com/uploads/images/cabecera/webp/{id}.webp
// URL foto jugador: https://media.futbolfantasy.com/thumb/150x150/v{version}/uploads/images/jugadores/ficha/{id}.png
```

---

## PARTE 8: LAYOUT GENERAL DE LA APP

```
app/
├── layout.tsx              ← Navbar + sidebar con tabs de secciones
├── page.tsx                ← Dashboard home (resumen de todo)
├── mi-equipo/page.tsx
├── formacion/page.tsx
├── mercado/page.tsx
├── predicciones/page.tsx
├── scores/page.tsx
├── rivales/page.tsx
├── graficas/page.tsx
├── jugadores/page.tsx
└── api/
    ├── plantilla/[equipo]/route.ts   ← Scraping endpoint
    └── todos-equipos/route.ts        ← Scraping de todos los equipos
```

**Navbar items:**
🏠 Mi Equipo | 🧩 Formación | 🔄 Mercado | 🔮 Predicciones |
📊 Scores | 📅 Rivales | 📈 Gráficas | 👥 Jugadores

**Selector de plataforma** (siempre visible en la navbar):
LaLiga Fantasy | Comunio | Biwenger | Futmondo | Mister

---

## PARTE 9: REGLAS DE NEGOCIO FANTASY

Implementar estas reglas universales en toda la app:

```typescript
// Presemupuesto disponible = presupuestoTotal - suma de valores de jugadores en mi equipo
// Plantilla válida = exactamente 15 jugadores (o el límite configurado)
// Máximo por equipo real = 3 jugadores del mismo equipo real
// Titulares = 11, suplentes = 4

// Alertas automáticas:
// - Jugador de mi equipo con probabilidad < 50% → ⚠️ warning
// - Jugador de mi equipo lesionado → 🏥 alert rojo
// - Jugador apercibido y titular → ⚠️ cautela
// - Valor de jugador cayendo 3 semanas seguidas → 📉 alerta
// - Rival de dificultad 5 en próxima jornada → 🔴 alerta

// Sistema de puntuación esperada:
// puntos_esperados = media_plataforma * (probabilidad / 100)
// Usar para rankear capitán y fichar jugadores
```

---

## INSTRUCCIONES FINALES PARA COPILOT

1. Empieza instalando dependencias:
   ```bash
   npm install cheerio zustand @tanstack/react-query recharts lucide-react
   npm install -D @types/cheerio
   ```

2. Crea primero el scraper (`lib/scraper/futbolfantasy.ts`) y testéalo
   con un `console.log` de los datos del Barcelona.

3. Crea las API routes con caché de 1 hora (Next.js `revalidate`).

4. Implementa el store de Zustand con persistencia en localStorage.

5. Construye los componentes de cada sección usando los datos del store.

6. En cada sección, añade un botón "Actualizar datos" que invalide la caché
   y vuelva a hacer el scraping.

7. Maneja estados de carga (skeleton loaders) y errores (toast notifications).

8. Todos los valores monetarios formateados: `48.023.228` → `48,0M`

9. El selector de plataforma en el navbar afecta globalmente qué medias
   y valores se muestran en TODA la app.

10. Si el scraping falla (error de red, cambio en la web), mostrar los últimos
    datos cacheados con un badge "Datos desactualizados".
```

---

*Prompt generado para uso con GitHub Copilot, Cursor, Windsurf o cualquier
asistente de código con soporte para contexto largo.*
*Fuente de datos: futbolfantasy.com | Jornada 35 LaLiga 2025-26*

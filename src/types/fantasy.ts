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

export interface PlayerStats {
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
}

export interface PlayerFantasy {
    laliga: FantasyStats;
    comunio: FantasyStats;
    biwenger: FantasyStats;
    futmondo: FantasyStats;
    mister: FantasyStats;
    picas: { media: number; total: number };
    rpg: { media: number; total: number };
}

// IA Scores
export interface IAScores {
    rendimiento: number;   // 0-100
    mercado: number;       // 0-100
    partido: number;       // 0-100
    general: number;       // 0-100 combined
}

export type SmartLabel =
    | 'GANGA' | 'SOBREVALORADO' | 'EVITAR' | 'INVERSIÓN'
    | 'TITULAR_FIJO' | 'ROTACIÓN' | 'LESIONADO' | 'RIESGO'
    | 'EN_RACHA' | 'CAPITÁN' | 'ARIETE' | 'DIFERENCIAL'
    | 'APUESTA' | 'HIGH_RISK' | 'SAFE_PICK' | 'VALUE_PICK';

export type Recommendation = 'vender' | 'mantener' | 'alinear' | 'banquillo' | 'inversión' | 'clausular' | 'transferible';

export interface PlayerData {
    nombre: string;
    url: string;
    equipo?: string;
    equipoSlug?: string;
    posicion: Posicion;
    posiciones?: Posicion[];
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
    rivalDificultad: number;
    localVisitante: 'local' | 'visitante';
    stats: PlayerStats;
    fantasy: PlayerFantasy;
    // IA enrichment (computed client-side)
    scores?: IAScores;
    labels?: SmartLabel[];
    recommendation?: Recommendation;
    roi?: number;
    valorEsperado?: number;
    diffVsEsperado?: number;
    volatilidad?: number;
    consistencia?: number;
    elo?: number;
    eloDificultad?: number;
}

export interface EquipoData {
    slug: string;
    nombre: string;
    jugadores: PlayerData[];
    lastUpdated: number;
}

export interface Equipo {
    slug: string;
    nombre: string;
    id: number;
}

export interface AppSettings {
    precioMaxCapitan: number;
    precioMaxAriete: number;
    maxJugadoresMismoEquipo: number;
    useMultiPosicion: boolean;
    pesosScores: { rendimiento: number; mercado: number; partido: number };
    agresividadMercado: number; // 1-5
    thresholdGanga: number;    // percentile
    thresholdRiesgo: number;   // percentile
    formacion: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
    precioMaxCapitan: 30_000_000,
    precioMaxAriete: 15_000_000,
    maxJugadoresMismoEquipo: 3,
    useMultiPosicion: false,
    pesosScores: { rendimiento: 0.4, mercado: 0.3, partido: 0.3 },
    agresividadMercado: 3,
    thresholdGanga: 25,
    thresholdRiesgo: 75,
    formacion: '4-3-3',
};

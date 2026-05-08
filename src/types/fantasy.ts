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
    rivalDificultad: number;
    localVisitante: 'local' | 'visitante';
    stats: PlayerStats;
    fantasy: PlayerFantasy;
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerData, Plataforma } from '../types/fantasy';

interface BiwengerAuth {
    token: string;
    user: { id: string; name: string };
    league: { id: string; name: string };
}

interface FantasyStore {
    // Biwenger Auth
    biwengerAuth: BiwengerAuth | null;
    setBiwengerAuth: (auth: BiwengerAuth | null) => void;
    isBiwengerLoggedIn: () => boolean;

    // Mi equipo
    miEquipo: PlayerData[];
    addJugador: (player: PlayerData) => void;
    removeJugador: (nombre: string) => void;
    clearEquipo: () => void;

    // Plataforma activa
    plataformaActiva: Plataforma;
    setPlataforma: (p: Plataforma) => void;

    // Cache de datos por equipo
    equiposCache: Record<string, { data: PlayerData[]; timestamp: number }>;
    setEquipoData: (slug: string, data: PlayerData[]) => void;
    clearCache: () => void;

    // Presupuesto
    presupuestoTotal: number;
    setPresupuesto: (n: number) => void;

    // UI
    equipoSeleccionado: string;
    setEquipoSeleccionado: (slug: string) => void;

    // Favoritos
    favoritos: string[];
    toggleFavorito: (nombre: string) => void;
    isFavorito: (nombre: string) => boolean;
}

export const useFantasyStore = create<FantasyStore>()(
    persist(
        (set, get) => ({
            biwengerAuth: null,
            miEquipo: [],
            plataformaActiva: 'laliga',
            equiposCache: {},
            presupuestoTotal: 100_000_000,
            equipoSeleccionado: 'barcelona',
            favoritos: [],

            setBiwengerAuth: (auth) => set({ biwengerAuth: auth }),
            isBiwengerLoggedIn: () => get().biwengerAuth !== null,

            addJugador: (player) =>
                set(state => ({
                    miEquipo: [...state.miEquipo.filter(p => p.nombre !== player.nombre), player],
                })),

            removeJugador: (nombre) =>
                set(state => ({
                    miEquipo: state.miEquipo.filter(p => p.nombre !== nombre),
                })),

            clearEquipo: () => set({ miEquipo: [] }),

            setPlataforma: (p) => set({ plataformaActiva: p }),

            setEquipoData: (slug, data) =>
                set(state => ({
                    equiposCache: {
                        ...state.equiposCache,
                        [slug]: { data, timestamp: Date.now() },
                    },
                })),

            clearCache: () => set({ equiposCache: {} }),

            setPresupuesto: (n) => set({ presupuestoTotal: n }),

            setEquipoSeleccionado: (slug) => set({ equipoSeleccionado: slug }),

            toggleFavorito: (nombre) =>
                set(state => ({
                    favoritos: state.favoritos.includes(nombre)
                        ? state.favoritos.filter(n => n !== nombre)
                        : [...state.favoritos, nombre],
                })),

            isFavorito: (nombre) => get().favoritos.includes(nombre),
        }),
        {
            name: 'fantasy-store',
            version: 1,
        }
    )
);

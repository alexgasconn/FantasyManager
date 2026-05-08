import { Equipo } from '../types/fantasy';

export const EQUIPOS_LALIGA: Equipo[] = [
    { slug: 'alaves', nombre: 'Alavés', id: 28 },
    { slug: 'athletic', nombre: 'Athletic Club', id: 1 },
    { slug: 'atletico', nombre: 'Atlético Madrid', id: 2 },
    { slug: 'barcelona', nombre: 'Barcelona', id: 3 },
    { slug: 'betis', nombre: 'Betis', id: 4 },
    { slug: 'celta', nombre: 'Celta de Vigo', id: 5 },
    { slug: 'elche', nombre: 'Elche', id: 21 },
    { slug: 'espanyol', nombre: 'Espanyol', id: 7 },
    { slug: 'getafe', nombre: 'Getafe', id: 8 },
    { slug: 'girona', nombre: 'Girona', id: 30 },
    { slug: 'levante', nombre: 'Levante', id: 10 },
    { slug: 'mallorca', nombre: 'Mallorca', id: 12 },
    { slug: 'osasuna', nombre: 'Osasuna', id: 13 },
    { slug: 'rayo-vallecano', nombre: 'Rayo Vallecano', id: 14 },
    { slug: 'real-madrid', nombre: 'Real Madrid', id: 15 },
    { slug: 'real-sociedad', nombre: 'Real Sociedad', id: 16 },
    { slug: 'sevilla', nombre: 'Sevilla', id: 17 },
    { slug: 'valencia', nombre: 'Valencia', id: 18 },
    { slug: 'villarreal', nombre: 'Villarreal', id: 22 },
    { slug: 'real-oviedo', nombre: 'Real Oviedo', id: 43 },
];

export const getEquipoNombre = (slug: string): string => {
    const equipo = EQUIPOS_LALIGA.find(e => e.slug === slug);
    return equipo?.nombre || slug;
};

export const getEquipoId = (slug: string): number | undefined => {
    const equipo = EQUIPOS_LALIGA.find(e => e.slug === slug);
    return equipo?.id;
};

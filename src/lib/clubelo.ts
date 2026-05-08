// ClubElo API integration
// Maps LaLiga team names from ClubElo format to our slugs
import { apiUrl } from './api';

const ELO_SLUG_MAP: Record<string, string> = {
    'Barcelona': 'barcelona',
    'Real Madrid': 'real-madrid',
    'Atletico Madrid': 'atletico',
    'Athletic Bilbao': 'athletic',
    'Real Sociedad': 'real-sociedad',
    'Villarreal': 'villarreal',
    'Betis': 'betis',
    'Sevilla': 'sevilla',
    'Osasuna': 'osasuna',
    'Celta Vigo': 'celta',
    'Mallorca': 'mallorca',
    'Rayo Vallecano': 'rayo-vallecano',
    'Getafe': 'getafe',
    'Girona': 'girona',
    'Espanyol': 'espanyol',
    'Alaves': 'alaves',
    'Valencia': 'valencia',
    'Valladolid': 'valladolid',
    'Leganes': 'leganes',
    'Las Palmas': 'las-palmas',
    'Levante': 'levante',
    'Elche': 'elche',
    'Real Oviedo': 'real-oviedo',
};

export interface EloEntry {
    slug: string;
    name: string;
    elo: number;
    country: string;
}

let eloCache: EloEntry[] | null = null;

export async function fetchClubElo(): Promise<EloEntry[]> {
    if (eloCache) return eloCache;

    try {
        const res = await fetch(apiUrl('/api/clubelo'));
        const csv = await res.text();
        const lines = csv.trim().split('\n');

        const entries: EloEntry[] = [];
        for (const line of lines.slice(1)) {
            const parts = line.split(',');
            if (parts.length < 4) continue;
            const [, country, , name, eloStr] = parts;
            if (country !== 'ESP') continue;

            const elo = parseFloat(eloStr);
            const slug = ELO_SLUG_MAP[name.trim()] || name.toLowerCase().replace(/\s+/g, '-');

            entries.push({ slug, name: name.trim(), elo, country });
        }

        eloCache = entries;
        return entries;
    } catch (e) {
        console.error('Error fetching ClubElo:', e);
        return [];
    }
}

export function getEloDificultad(rivalElo: number, myElo: number): number {
    const diff = rivalElo - myElo;
    if (diff > 150) return 5;
    if (diff > 50) return 4;
    if (diff > -50) return 3;
    if (diff > -150) return 2;
    return 1;
}

export function eloDificultadColor(dif: number): string {
    if (dif <= 1) return 'bg-green-500';
    if (dif <= 2) return 'bg-lime-500';
    if (dif <= 3) return 'bg-yellow-500';
    if (dif <= 4) return 'bg-orange-500';
    return 'bg-red-500';
}

export function clearEloCache() {
    eloCache = null;
}

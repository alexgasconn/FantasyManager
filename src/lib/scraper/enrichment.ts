import { PlayerData } from '../../types/fantasy';
import { scrapePlantilla } from './futbolfantasy';

// Cache de equipos ya scrapeados
let cachedTeams: Record<string, PlayerData[]> = {};

export async function enrichBiwengerPlayer(biwengerPlayer: any): Promise<PlayerData | null> {
    try {
        // Obtener equipo del jugador
        const teamSlug = biwengerPlayer.team?.slug || '';
        const playerName = biwengerPlayer.name || '';

        if (!teamSlug) return null;

        // Obtener datos del equipo si no están cacheados
        if (!cachedTeams[teamSlug]) {
            try {
                cachedTeams[teamSlug] = await scrapePlantilla(teamSlug);
            } catch (e) {
                console.warn(`No se pudo scrapear equipo ${teamSlug}`);
                return null;
            }
        }

        // Buscar jugador por nombre (búsqueda fuzzy)
        const fantasyPlayer = cachedTeams[teamSlug].find(
            p => normalizeText(p.nombre).includes(normalizeText(playerName)) ||
                normalizeText(playerName).includes(normalizeText(p.nombre))
        );

        return fantasyPlayer || null;
    } catch (e) {
        console.error('Error enriching player:', e);
        return null;
    }
}

export async function enrichBiwengerPlayers(biwengerPlayers: any[]): Promise<Map<number, PlayerData>> {
    const enrichedMap = new Map<number, PlayerData>();

    // Procesar en paralelo pero con limite
    const chunkSize = 5;
    for (let i = 0; i < biwengerPlayers.length; i += chunkSize) {
        const chunk = biwengerPlayers.slice(i, i + chunkSize);
        const enrichedChunk = await Promise.all(
            chunk.map(player => enrichBiwengerPlayer(player))
        );

        enrichedChunk.forEach((enriched, idx) => {
            if (enriched) {
                enrichedMap.set(chunk[idx].id, enriched);
            }
        });
    }

    return enrichedMap;
}

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/\s+/g, ' ')
        .trim();
}

export function clearEnrichmentCache() {
    cachedTeams = {};
}

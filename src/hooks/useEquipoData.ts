import { useEffect, useState, useCallback } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { PlayerData } from '../types/fantasy';
import { scrapePlantilla } from '../lib/scraper/futbolfantasy';

const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export function useEquipoData(equipoSlug: string) {
    const { equiposCache, setEquipoData } = useFantasyStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cached = equiposCache[equipoSlug];
    const isStale = !cached || Date.now() - cached.timestamp > CACHE_TTL;

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await scrapePlantilla(equipoSlug);
            setEquipoData(equipoSlug, data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(`Error cargando datos: ${message}`);
        } finally {
            setLoading(false);
        }
    }, [equipoSlug, setEquipoData]);

    useEffect(() => {
        if (!isStale) return;
        refresh();
    }, [equipoSlug, isStale, refresh]);

    return {
        jugadores: cached?.data ?? ([] as PlayerData[]),
        loading,
        error,
        lastUpdated: cached?.timestamp,
        refresh,
    };
}

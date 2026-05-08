import { useEffect, useMemo, useState } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { EQUIPOS_LALIGA } from '../data/equipos';
import { scrapePlantilla } from '../lib/scraper/futbolfantasy';
import { PlayerData } from '../types/fantasy';

const CACHE_TTL = 60 * 60 * 1000;

export function useAllTeamsPlayers() {
    const { equiposCache, setEquipoData } = useFantasyStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadAllTeams = async () => {
            setLoading(true);
            setError(null);

            try {
                const staleSlugs = EQUIPOS_LALIGA
                    .map(e => e.slug)
                    .filter(slug => {
                        const cached = equiposCache[slug];
                        return !cached || Date.now() - cached.timestamp > CACHE_TTL;
                    });

                for (let i = 0; i < staleSlugs.length; i += 3) {
                    const batch = staleSlugs.slice(i, i + 3);
                    const results = await Promise.allSettled(batch.map(slug => scrapePlantilla(slug)));

                    results.forEach((result, idx) => {
                        if (result.status === 'fulfilled') {
                            setEquipoData(batch[idx], result.value);
                        } else {
                            console.warn(`Error cargando ${batch[idx]}:`, result.reason);
                        }
                    });
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Error desconocido';
                if (!cancelled) setError(message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadAllTeams();
        return () => {
            cancelled = true;
        };
    }, [equiposCache, setEquipoData]);

    const players = useMemo(() => {
        const slugToName = Object.fromEntries(EQUIPOS_LALIGA.map(e => [e.slug, e.nombre]));
        return EQUIPOS_LALIGA.flatMap(eq => {
            const data = equiposCache[eq.slug]?.data || [];
            return data.map((p: PlayerData) => ({
                ...p,
                equipoSlug: p.equipoSlug || eq.slug,
                equipo: p.equipo || slugToName[eq.slug] || eq.slug,
            }));
        });
    }, [equiposCache]);

    return { players, loading, error };
}

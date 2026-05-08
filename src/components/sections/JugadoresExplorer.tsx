import { useEffect, useMemo, useState } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { PlayerTable } from '../PlayerTable';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers } from '../../lib/scoring';
import { PlayerData } from '../../types/fantasy';
import { EQUIPOS_LALIGA } from '../../data/equipos';
import { scrapePlantilla } from '../../lib/scraper/futbolfantasy';

const CACHE_TTL = 60 * 60 * 1000;

export function Jugadores() {
    const { plataformaActiva, addJugador, miEquipo, equiposCache, setEquipoData } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [filtroEquipo, setFiltroEquipo] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

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

    const jugadoresBase = useMemo(() => {
        const slugToName = Object.fromEntries(EQUIPOS_LALIGA.map(e => [e.slug, e.nombre]));
        const onlyLaLiga = EQUIPOS_LALIGA.map(e => e.slug);

        return onlyLaLiga.flatMap(slug => {
            const entry = equiposCache[slug];
            const data = entry?.data || [];
            return data.map(p => ({
                ...p,
                equipoSlug: p.equipoSlug || slug,
                equipo: p.equipo || slugToName[slug] || slug,
            }));
        });
    }, [equiposCache]);

    const jugadoresFiltrados = useMemo(() => {
        if (filtroEquipo === 'todos') return jugadoresBase;
        return jugadoresBase.filter(j => j.equipoSlug === filtroEquipo);
    }, [jugadoresBase, filtroEquipo]);

    const enriched = useMemo(() =>
        enrichAllPlayers(jugadoresFiltrados, plataformaActiva, settings),
        [jugadoresFiltrados, plataformaActiva, settings]
    );

    const ownedNames = new Set(miEquipo.map(p => p.nombre));

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">👥 Base de Datos de Jugadores</h1>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Equipo:</label>
                    <select value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)}
                        className="px-3 py-1.5 border rounded text-sm font-medium">
                        <option value="todos">Todos</option>
                        {EQUIPOS_LALIGA.map(eq => <option key={eq.slug} value={eq.slug}>{eq.nombre}</option>)}
                    </select>
                </div>
            </div>

            {error && (
                <Card className="p-3 text-sm text-red-700 bg-red-50 border-red-200">
                    Error cargando equipos: {error}
                </Card>
            )}

            {loading ? (
                <Card className="p-8 text-center text-gray-500">Cargando jugadores...</Card>
            ) : (
                <PlayerTable
                    jugadores={enriched}
                    plataforma={plataformaActiva}
                    onPlayerClick={setSelectedPlayer}
                    showActions
                    onAdd={addJugador}
                    isOwned={nombre => ownedNames.has(nombre)}
                />
            )}

            {selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} plataforma={plataformaActiva}
                    onClose={() => setSelectedPlayer(null)} allPlayers={enriched} />
            )}
        </div>
    );
}

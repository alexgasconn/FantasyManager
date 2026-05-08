import { useMemo, useState } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { PlayerTable } from '../PlayerTable';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers } from '../../lib/scoring';
import { PlayerData } from '../../types/fantasy';
import { EQUIPOS_LALIGA } from '../../data/equipos';
import { useAllTeamsPlayers } from '../../hooks/useAllTeamsPlayers';

export function Jugadores() {
    const { plataformaActiva, addJugador, miEquipo } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [filtroEquipo, setFiltroEquipo] = useState('todos');
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
    const { players: jugadoresBase, loading, error } = useAllTeamsPlayers();

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

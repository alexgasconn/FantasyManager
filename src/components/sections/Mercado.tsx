import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAllTeamsPlayers } from '../../hooks/useAllTeamsPlayers';
import { Card } from '../../../components/ui/card';
import { PlayerTable } from '../PlayerTable';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers } from '../../lib/scoring';
import { PlayerData } from '../../types/fantasy';
import { EQUIPOS_LALIGA } from '../../data/equipos';

export function Mercado() {
    const { plataformaActiva, addJugador, miEquipo } = useFantasyStore();
    const { settings } = useSettingsStore();
    const { players, loading, error } = useAllTeamsPlayers();
    const [filtroEquipo, setFiltroEquipo] = useState('todos');
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    const jugadores = useMemo(() => {
        if (filtroEquipo === 'todos') return players;
        return players.filter(p => p.equipoSlug === filtroEquipo);
    }, [players, filtroEquipo]);

    const enriched = useMemo(() =>
        enrichAllPlayers(jugadores, plataformaActiva, settings),
        [jugadores, plataformaActiva, settings]
    );

    const ownedNames = new Set(miEquipo.map(p => p.nombre));
    const gangas = enriched.filter(p => p.labels?.includes('GANGA')).length;
    const inversiones = enriched.filter(p => p.labels?.includes('INVERSIÓN')).length;

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">🔄 Mercado de Fichajes</h1>
                <div className="flex items-center gap-2">
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

            {/* Quick stats */}
            <div className="flex gap-3">
                <Card className="px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <div>
                        <p className="text-[10px] text-gray-500">Gangas</p>
                        <p className="font-bold text-green-600">{gangas}</p>
                    </div>
                </Card>
                <Card className="px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">📈</span>
                    <div>
                        <p className="text-[10px] text-gray-500">Inversiones</p>
                        <p className="font-bold text-blue-600">{inversiones}</p>
                    </div>
                </Card>
                <Card className="px-4 py-2 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <div>
                        <p className="text-[10px] text-gray-500">Total</p>
                        <p className="font-bold">{enriched.length}</p>
                    </div>
                </Card>
            </div>

            {loading ? (
                <Card className="p-8 text-center text-gray-500">Cargando datos...</Card>
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

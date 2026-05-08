import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Card } from '../../../components/ui/card';
import { PlayerTable } from '../PlayerTable';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers } from '../../lib/scoring';
import { PlayerData } from '../../types/fantasy';
import { EQUIPOS_LALIGA } from '../../data/equipos';

export function Jugadores() {
    const { equipoSeleccionado, setEquipoSeleccionado, plataformaActiva, addJugador, miEquipo } = useFantasyStore();
    const { settings } = useSettingsStore();
    const { jugadores, loading } = useEquipoData(equipoSeleccionado);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    const enriched = useMemo(() =>
        enrichAllPlayers(jugadores, plataformaActiva, settings),
        [jugadores, plataformaActiva, settings]
    );

    const ownedNames = new Set(miEquipo.map(p => p.nombre));

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">👥 Base de Datos de Jugadores</h1>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Equipo:</label>
                    <select value={equipoSeleccionado} onChange={e => setEquipoSeleccionado(e.target.value)}
                        className="px-3 py-1.5 border rounded text-sm font-medium">
                        {EQUIPOS_LALIGA.map(eq => <option key={eq.slug} value={eq.slug}>{eq.nombre}</option>)}
                    </select>
                </div>
            </div>

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

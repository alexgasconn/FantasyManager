import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Card } from '../../../components/ui/card';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers, scoreColor, labelColor } from '../../lib/scoring';
import { calcOnceProbable, formaDisplay, fmtValor } from '../../lib/utils/fantasy';
import { PlayerData } from '../../types/fantasy';

export function Predicciones() {
    const { equipoSeleccionado, plataformaActiva } = useFantasyStore();
    const { settings } = useSettingsStore();
    const { jugadores } = useEquipoData(equipoSeleccionado);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    const enriched = useMemo(() =>
        enrichAllPlayers(jugadores, plataformaActiva, settings),
        [jugadores, plataformaActiva, settings]
    );

    const onceProbable = calcOnceProbable(enriched, '4-3-3');
    const dudosos = enriched.filter(j => j.probabilidadVal >= 30 && j.probabilidadVal < 60);
    const bajas = enriched.filter(j => j.probabilidadVal === 0 || j.status === 'lesionado');

    const capitanes = [...enriched]
        .filter(p => p.probabilidadVal >= 70)
        .sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0))
        .slice(0, 3);

    const gangas = enriched.filter(p => p.labels?.includes('GANGA')).slice(0, 5);
    const evitar = enriched.filter(p => p.labels?.includes('EVITAR') || p.labels?.includes('SOBREVALORADO')).slice(0, 5);

    return (
        <div className="space-y-5 p-4">
            <h1 className="text-2xl font-bold">🔮 Predicciones y Análisis</h1>

            {/* Top recommendations */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Card className="p-4 border-l-4 border-l-amber-500">
                    <h3 className="text-xs font-bold text-amber-700 uppercase mb-2">👑 Mejores Capitanes</h3>
                    {capitanes.map((p, i) => (
                        <div key={p.nombre} className="flex items-center justify-between py-1 cursor-pointer hover:bg-amber-50 rounded px-1"
                            onClick={() => setSelectedPlayer(p)}>
                            <span className="text-sm"><strong>#{i + 1}</strong> {p.nombre}</span>
                            <span className="text-xs font-bold" style={{ color: scoreColor(p.scores?.general || 0) }}>
                                {Math.round(p.scores?.general || 0)}
                            </span>
                        </div>
                    ))}
                </Card>

                <Card className="p-4 border-l-4 border-l-green-500">
                    <h3 className="text-xs font-bold text-green-700 uppercase mb-2">💎 Gangas</h3>
                    {gangas.length === 0 ? <p className="text-xs text-gray-400">Ninguna detectada</p> :
                        gangas.map(p => (
                            <div key={p.nombre} className="flex items-center justify-between py-1 cursor-pointer hover:bg-green-50 rounded px-1"
                                onClick={() => setSelectedPlayer(p)}>
                                <span className="text-sm">{p.nombre}</span>
                                <span className="text-xs text-gray-500">{fmtValor(p.fantasy[plataformaActiva].valor)}</span>
                            </div>
                        ))
                    }
                </Card>

                <Card className="p-4 border-l-4 border-l-red-500">
                    <h3 className="text-xs font-bold text-red-700 uppercase mb-2">🚫 Evitar</h3>
                    {evitar.length === 0 ? <p className="text-xs text-gray-400">Ninguno</p> :
                        evitar.map(p => (
                            <div key={p.nombre} className="flex items-center justify-between py-1 cursor-pointer hover:bg-red-50 rounded px-1"
                                onClick={() => setSelectedPlayer(p)}>
                                <span className="text-sm">{p.nombre}</span>
                                <div className="flex gap-0.5">
                                    {(p.labels || []).filter(l => l === 'EVITAR' || l === 'SOBREVALORADO').map(l => {
                                        const { bg, text } = labelColor(l);
                                        return <span key={l} className={`${bg} ${text} px-1 rounded text-[9px]`}>{l}</span>;
                                    })}
                                </div>
                            </div>
                        ))
                    }
                </Card>
            </div>

            {/* Once probable */}
            <Card className="p-4">
                <h2 className="font-bold mb-3">Once Probable (4-3-3)</h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                    {onceProbable.map(p => {
                        const { emoji } = formaDisplay(p.forma);
                        return (
                            <div key={p.nombre} className="bg-blue-50 rounded-lg p-2 cursor-pointer hover:bg-blue-100"
                                onClick={() => setSelectedPlayer(p)}>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                        style={{ backgroundColor: scoreColor(p.scores?.general || 0) }}>
                                        {Math.round(p.scores?.general || 0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-xs truncate max-w-[80px]">{p.nombre}</p>
                                        <p className="text-[10px] text-gray-500">{p.posicion.substring(0, 3)} {emoji} {p.probabilidadVal}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Dudosos + Bajas */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {dudosos.length > 0 && (
                    <Card className="p-4 border-yellow-300 border">
                        <h3 className="font-bold mb-2 text-sm text-yellow-700">⚠️ Dudosos ({dudosos.length})</h3>
                        {dudosos.slice(0, 6).map(p => (
                            <div key={p.nombre} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-0 cursor-pointer hover:bg-yellow-50"
                                onClick={() => setSelectedPlayer(p)}>
                                <div>
                                    <p className="text-sm font-medium">{p.nombre}</p>
                                    <p className="text-[10px] text-gray-500">{p.jerarquia}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{p.probabilidadVal}%</p>
                                    <p className="text-[10px] text-gray-500">{p.rival} ({p.rivalDificultad}/5)</p>
                                </div>
                            </div>
                        ))}
                    </Card>
                )}

                {bajas.length > 0 && (
                    <Card className="p-4 border-red-300 border">
                        <h3 className="font-bold mb-2 text-sm text-red-700">🏥 Bajas ({bajas.length})</h3>
                        {bajas.slice(0, 6).map(p => (
                            <div key={p.nombre} className="flex items-center justify-between py-1.5 border-b border-red-100 last:border-0">
                                <p className="text-sm font-medium">{p.nombre}</p>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{p.status}</span>
                            </div>
                        ))}
                    </Card>
                )}
            </div>

            {selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} plataforma={plataformaActiva}
                    onClose={() => setSelectedPlayer(null)} allPlayers={enriched} />
            )}
        </div>
    );
}

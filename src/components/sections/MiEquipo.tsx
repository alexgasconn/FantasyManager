import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { PlayerTable } from '../PlayerTable';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { fmtValor, calcValorTotal, calcMediaEquipo } from '../../lib/utils/fantasy';
import { enrichAllPlayers, recommendationDisplay, scoreColor } from '../../lib/scoring';
import { PlayerData } from '../../types/fantasy';

export function MiEquipo() {
    const { miEquipo, removeJugador, plataformaActiva, presupuestoTotal } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    const enriched = useMemo(() =>
        enrichAllPlayers(miEquipo, plataformaActiva, settings),
        [miEquipo, plataformaActiva, settings]
    );

    const valorEquipo = calcValorTotal(enriched, plataformaActiva);
    const mediaEquipo = calcMediaEquipo(enriched, plataformaActiva);
    const avgScore = enriched.length > 0 ? enriched.reduce((s, p) => s + (p.scores?.general || 0), 0) / enriched.length : 0;

    const recCounts = {
        alinear: enriched.filter(p => p.recommendation === 'alinear').length,
        vender: enriched.filter(p => p.recommendation === 'vender').length,
        inversion: enriched.filter(p => p.recommendation === 'inversión').length,
        banquillo: enriched.filter(p => p.recommendation === 'banquillo').length,
    };

    return (
        <div className="space-y-4 p-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Jugadores</p>
                    <p className="text-2xl font-bold">{enriched.length}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Valor Total</p>
                    <p className="text-2xl font-bold">{fmtValor(valorEquipo)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Media</p>
                    <p className="text-2xl font-bold">{mediaEquipo.toFixed(2)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Score IA</p>
                    <p className="text-2xl font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(0)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Presupuesto</p>
                    <p className="text-2xl font-bold">{fmtValor(presupuestoTotal)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase">Recomendaciones</p>
                    <div className="flex gap-1 mt-1 text-[10px] font-medium">
                        <span className="text-green-600">⚡{recCounts.alinear}</span>
                        <span className="text-red-600">📤{recCounts.vender}</span>
                        <span className="text-blue-600">📈{recCounts.inversion}</span>
                        <span className="text-yellow-600">💺{recCounts.banquillo}</span>
                    </div>
                </Card>
            </div>

            {/* Recommendations */}
            <div className="flex flex-wrap gap-2">
                {enriched.filter(p => p.recommendation && p.recommendation !== 'mantener').map(p => {
                    const rec = recommendationDisplay(p.recommendation!);
                    return (
                        <button key={p.nombre} onClick={() => setSelectedPlayer(p)}
                            className={`${rec.color} bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded text-xs font-medium transition-colors`}>
                            {rec.emoji} {p.nombre.split(' ').pop()} → {rec.label}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            {enriched.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No hay jugadores. Ve al Mercado.</Card>
            ) : (
                <PlayerTable jugadores={enriched} plataforma={plataformaActiva} onPlayerClick={setSelectedPlayer}
                    showActions onRemove={p => removeJugador(p.nombre)} isOwned={() => true} />
            )}

            {selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} plataforma={plataformaActiva}
                    onClose={() => setSelectedPlayer(null)} allPlayers={enriched} />
            )}
        </div>
    );
}

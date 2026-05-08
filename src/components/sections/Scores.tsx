import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { PlayerDetailModal } from '../PlayerDetailModal';
import { enrichAllPlayers, scoreColor } from '../../lib/scoring';
import { fmtValor } from '../../lib/utils/fantasy';
import { PlayerData } from '../../types/fantasy';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

export function Scores() {
    const { miEquipo, plataformaActiva } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    const enriched = useMemo(() =>
        enrichAllPlayers(miEquipo, plataformaActiva, settings),
        [miEquipo, plataformaActiva, settings]
    );

    const sorted = [...enriched].sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0));

    const chartData = sorted.map(p => ({
        nombre: p.nombre.substring(0, 10),
        general: p.scores?.general || 0,
        rendimiento: p.scores?.rendimiento || 0,
        mercado: p.scores?.mercado || 0,
        partido: p.scores?.partido || 0,
    }));

    // Avg scores
    const avgGen = avg(enriched.map(p => p.scores?.general || 0));
    const avgRend = avg(enriched.map(p => p.scores?.rendimiento || 0));
    const avgMerc = avg(enriched.map(p => p.scores?.mercado || 0));
    const avgPart = avg(enriched.map(p => p.scores?.partido || 0));

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold">📊 Scores IA</h1>

            {/* Avg KPIs */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <ScoreKpi label="IA General" value={avgGen} />
                <ScoreKpi label="Rendimiento" value={avgRend} />
                <ScoreKpi label="Mercado" value={avgMerc} />
                <ScoreKpi label="Partido" value={avgPart} />
            </div>

            {/* Score chart */}
            <Card className="p-4">
                <h3 className="font-bold mb-3">Scores por Jugador</h3>
                <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 28)}>
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="nombre" width={80} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rendimiento" fill="#3b82f6" name="Rendimiento" stackId="a" />
                        <Bar dataKey="mercado" fill="#10b981" name="Mercado" stackId="b" />
                        <Bar dataKey="partido" fill="#f59e0b" name="Partido" stackId="c" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Player table with scores */}
            <Card className="p-4">
                <h3 className="font-bold mb-3">Detalle de Scores</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold">Jugador</th>
                                <th className="px-3 py-2 text-center font-semibold">IA General</th>
                                <th className="px-3 py-2 text-center font-semibold">Rendimiento</th>
                                <th className="px-3 py-2 text-center font-semibold">Mercado</th>
                                <th className="px-3 py-2 text-center font-semibold">Partido</th>
                                <th className="px-3 py-2 text-center font-semibold">Media</th>
                                <th className="px-3 py-2 text-center font-semibold">Total</th>
                                <th className="px-3 py-2 text-center font-semibold">ROI</th>
                                <th className="px-3 py-2 text-center font-semibold">Consist.</th>
                                <th className="px-3 py-2 text-center font-semibold">Valor</th>
                                <th className="px-3 py-2 text-center font-semibold">Labels</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sorted.map(p => (
                                <tr key={p.nombre} className="hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedPlayer(p)}>
                                    <td className="px-3 py-2 font-medium">{p.nombre}</td>
                                    <td className="px-3 py-2 text-center"><ScoreBadge score={p.scores?.general || 0} /></td>
                                    <td className="px-3 py-2 text-center"><ScoreBadge score={p.scores?.rendimiento || 0} /></td>
                                    <td className="px-3 py-2 text-center"><ScoreBadge score={p.scores?.mercado || 0} /></td>
                                    <td className="px-3 py-2 text-center"><ScoreBadge score={p.scores?.partido || 0} /></td>
                                    <td className="px-3 py-2 text-center font-bold">{p.fantasy[plataformaActiva].media.toFixed(1)}</td>
                                    <td className="px-3 py-2 text-center">{p.fantasy[plataformaActiva].total}</td>
                                    <td className="px-3 py-2 text-center">{(p.roi || 0).toFixed(1)}</td>
                                    <td className="px-3 py-2 text-center">{p.consistencia || '-'}</td>
                                    <td className="px-3 py-2 text-center">{fmtValor(p.fantasy[plataformaActiva].valor)}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-0.5">
                                            {(p.labels || []).slice(0, 2).map(l => (
                                                <span key={l} className="bg-gray-100 text-gray-700 px-1 rounded text-[9px]">{l}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Legend */}
            <Card className="p-4">
                <h3 className="font-bold mb-3">Leyenda de Scores</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5 text-xs">
                    <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: scoreColor(90) }} /><span>80-100: Elite</span></div>
                    <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: scoreColor(70) }} /><span>65-79: Bueno</span></div>
                    <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: scoreColor(55) }} /><span>50-64: Normal</span></div>
                    <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: scoreColor(40) }} /><span>35-49: Mediocre</span></div>
                    <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: scoreColor(20) }} /><span>0-34: Malo</span></div>
                </div>
            </Card>

            {selectedPlayer && (
                <PlayerDetailModal player={selectedPlayer} plataforma={plataformaActiva}
                    onClose={() => setSelectedPlayer(null)} allPlayers={enriched} />
            )}
        </div>
    );
}

function ScoreKpi({ label, value }: { label: string; value: number }) {
    return (
        <Card className="p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase">{label}</p>
            <p className="text-3xl font-bold" style={{ color: scoreColor(value) }}>{value.toFixed(0)}</p>
        </Card>
    );
}

function ScoreBadge({ score }: { score: number }) {
    return (
        <span className="inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-bold text-white"
            style={{ backgroundColor: scoreColor(score) }}>
            {Math.round(score)}
        </span>
    );
}

function avg(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

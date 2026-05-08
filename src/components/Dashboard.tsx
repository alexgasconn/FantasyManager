import { useMemo } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { useSettingsStore } from '../store/settingsStore';
import { Card } from '../../components/ui/card';
import { enrichAllPlayers, scoreColor, labelColor } from '../lib/scoring';
import { fmtValor, calcValorTotal, calcMediaEquipo } from '../lib/utils/fantasy';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function Dashboard() {
    const { miEquipo, plataformaActiva, presupuestoTotal, biwengerAuth } = useFantasyStore();
    const { settings } = useSettingsStore();

    const enriched = useMemo(() =>
        enrichAllPlayers(miEquipo, plataformaActiva, settings),
        [miEquipo, plataformaActiva, settings]
    );

    const valorEquipo = calcValorTotal(enriched, plataformaActiva);
    const mediaEquipo = calcMediaEquipo(enriched, plataformaActiva);
    const avgScore = enriched.length > 0 ? enriched.reduce((s, p) => s + (p.scores?.general || 0), 0) / enriched.length : 0;

    const top5 = [...enriched]
        .sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0))
        .slice(0, 5)
        .map(j => ({ nombre: j.nombre.substring(0, 12), score: j.scores?.general || 0, media: j.fantasy[plataformaActiva].media }));

    const distPos = [
        { name: 'POR', value: enriched.filter(j => j.posicion === 'Portero').length },
        { name: 'DEF', value: enriched.filter(j => j.posicion === 'Defensa').length },
        { name: 'MED', value: enriched.filter(j => j.posicion === 'Mediocampista').length },
        { name: 'DEL', value: enriched.filter(j => j.posicion === 'Delantero').length },
    ].filter(x => x.value > 0);

    const lesionados = enriched.filter(j => j.status === 'lesionado');
    const enRacha = enriched.filter(j => j.labels?.includes('EN_RACHA'));
    const riesgo = enriched.filter(j => j.labels?.includes('RIESGO'));
    const alinear = enriched.filter(j => j.recommendation === 'alinear');
    const vender = enriched.filter(j => j.recommendation === 'vender');

    return (
        <div className="space-y-5 p-4">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        {biwengerAuth?.user?.name} • {biwengerAuth?.league?.name} • {biwengerAuth?.user?.points} pts
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100">
                    <p className="text-[10px] text-gray-600 uppercase">Jugadores</p>
                    <p className="text-2xl font-bold">{enriched.length}</p>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100">
                    <p className="text-[10px] text-gray-600 uppercase">Valor Total</p>
                    <p className="text-2xl font-bold">{fmtValor(valorEquipo)}</p>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100">
                    <p className="text-[10px] text-gray-600 uppercase">Media</p>
                    <p className="text-2xl font-bold">{mediaEquipo.toFixed(2)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-600 uppercase">Score IA</p>
                    <p className="text-2xl font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(0)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-600 uppercase">Presupuesto</p>
                    <p className="text-2xl font-bold">{fmtValor(presupuestoTotal)}</p>
                </Card>
                <Card className="p-3">
                    <p className="text-[10px] text-gray-600 uppercase">Puntos Liga</p>
                    <p className="text-2xl font-bold">{biwengerAuth?.user?.points || 0}</p>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Top 5 */}
                <Card className="p-4">
                    <h3 className="font-bold mb-3 text-sm">Top 5 Score IA</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={top5} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="nombre" width={80} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="score" name="Score IA" radius={[0, 4, 4, 0]}>
                                {top5.map((entry, i) => <Cell key={i} fill={scoreColor(entry.score)} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Position distribution */}
                <Card className="p-4">
                    <h3 className="font-bold mb-3 text-sm">Distribución</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={distPos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                {distPos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {enRacha.length > 0 && (
                    <Card className="p-3 border-l-4 border-l-green-500">
                        <p className="text-xs font-bold text-green-700">🔥 En racha ({enRacha.length})</p>
                        <p className="text-xs text-gray-600 mt-1">{enRacha.map(p => p.nombre.split(' ').pop()).join(', ')}</p>
                    </Card>
                )}
                {lesionados.length > 0 && (
                    <Card className="p-3 border-l-4 border-l-red-500">
                        <p className="text-xs font-bold text-red-700">🏥 Lesionados ({lesionados.length})</p>
                        <p className="text-xs text-gray-600 mt-1">{lesionados.map(p => p.nombre.split(' ').pop()).join(', ')}</p>
                    </Card>
                )}
                {riesgo.length > 0 && (
                    <Card className="p-3 border-l-4 border-l-orange-500">
                        <p className="text-xs font-bold text-orange-700">⚠️ Riesgo ({riesgo.length})</p>
                        <p className="text-xs text-gray-600 mt-1">{riesgo.map(p => p.nombre.split(' ').pop()).join(', ')}</p>
                    </Card>
                )}
                {vender.length > 0 && (
                    <Card className="p-3 border-l-4 border-l-purple-500">
                        <p className="text-xs font-bold text-purple-700">📤 Recomendación vender ({vender.length})</p>
                        <p className="text-xs text-gray-600 mt-1">{vender.map(p => p.nombre.split(' ').pop()).join(', ')}</p>
                    </Card>
                )}
            </div>

            {/* Quick recommendations */}
            {alinear.length > 0 && (
                <Card className="p-4">
                    <h3 className="font-bold mb-2 text-sm">⚡ Recomendados para alinear</h3>
                    <div className="flex flex-wrap gap-2">
                        {alinear.slice(0, 11).map(p => (
                            <div key={p.nombre} className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs">
                                <span className="font-medium">{p.nombre}</span>
                                <span className="ml-1 text-gray-500">{p.posicion.substring(0, 3)}</span>
                                <span className="ml-1 font-bold" style={{ color: scoreColor(p.scores?.general || 0) }}>
                                    {Math.round(p.scores?.general || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { enrichAllPlayers, linearRegression, scoreColor } from '../../lib/scoring';
import { fmtValor } from '../../lib/utils/fantasy';
import {
    BarChart, Bar, ScatterChart, Scatter, LineChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
    ZAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type ScatterMode = 'valor-media' | 'valor-score' | 'media-prob' | 'roi-score';

export function Graficas() {
    const { miEquipo, equiposCache, equipoSeleccionado, plataformaActiva } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [scatterMode, setScatterMode] = useState<ScatterMode>('valor-media');
    const [filtroPos, setFiltroPos] = useState('');

    const allPlayers = equiposCache[equipoSeleccionado]?.data || [];
    const enrichedAll = useMemo(() => enrichAllPlayers(allPlayers, plataformaActiva, settings), [allPlayers, plataformaActiva, settings]);
    const enrichedTeam = useMemo(() => enrichAllPlayers(miEquipo, plataformaActiva, settings), [miEquipo, plataformaActiva, settings]);

    const filteredScatter = filtroPos ? enrichedAll.filter(p => p.posicion === filtroPos) : enrichedAll;

    // Scatter data
    const scatterData = filteredScatter.map(p => {
        const isOwned = miEquipo.some(m => m.nombre === p.nombre);
        switch (scatterMode) {
            case 'valor-media': return { x: p.fantasy[plataformaActiva].valor / 1_000_000, y: p.fantasy[plataformaActiva].media, name: p.nombre, owned: isOwned, score: p.scores?.general || 0 };
            case 'valor-score': return { x: p.fantasy[plataformaActiva].valor / 1_000_000, y: p.scores?.general || 0, name: p.nombre, owned: isOwned, score: p.scores?.general || 0 };
            case 'media-prob': return { x: p.fantasy[plataformaActiva].media, y: p.probabilidadVal, name: p.nombre, owned: isOwned, score: p.scores?.general || 0 };
            case 'roi-score': return { x: p.roi || 0, y: p.scores?.general || 0, name: p.nombre, owned: isOwned, score: p.scores?.general || 0 };
        }
    }).filter(d => d.x > 0 || d.y > 0);

    const reg = linearRegression(scatterData.map(d => ({ x: d.x, y: d.y })));

    // Regression line points
    const xValues = scatterData.map(d => d.x);
    const xMin = Math.min(...xValues, 0);
    const xMax = Math.max(...xValues, 1);
    const regLine = [
        { x: xMin, y: reg.slope * xMin + reg.intercept },
        { x: xMax, y: reg.slope * xMax + reg.intercept },
    ];

    // Top 10
    const top10 = enrichedAll
        .sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0))
        .slice(0, 10)
        .map(j => ({ nombre: j.nombre.substring(0, 10), score: j.scores?.general || 0, media: j.fantasy[plataformaActiva].media }));

    // Position distribution
    const distPos = [
        { name: 'POR', value: enrichedTeam.filter(j => j.posicion === 'Portero').length },
        { name: 'DEF', value: enrichedTeam.filter(j => j.posicion === 'Defensa').length },
        { name: 'MED', value: enrichedTeam.filter(j => j.posicion === 'Mediocampista').length },
        { name: 'DEL', value: enrichedTeam.filter(j => j.posicion === 'Delantero').length },
    ].filter(x => x.value > 0);

    // Score distribution
    const scoreDist = [
        { range: '80-100', count: enrichedAll.filter(p => (p.scores?.general || 0) >= 80).length, fill: '#22c55e' },
        { range: '65-79', count: enrichedAll.filter(p => (p.scores?.general || 0) >= 65 && (p.scores?.general || 0) < 80).length, fill: '#4ade80' },
        { range: '50-64', count: enrichedAll.filter(p => (p.scores?.general || 0) >= 50 && (p.scores?.general || 0) < 65).length, fill: '#eab308' },
        { range: '35-49', count: enrichedAll.filter(p => (p.scores?.general || 0) >= 35 && (p.scores?.general || 0) < 50).length, fill: '#f97316' },
        { range: '0-34', count: enrichedAll.filter(p => (p.scores?.general || 0) < 35).length, fill: '#ef4444' },
    ];

    // Team radar
    const teamRadar = enrichedTeam.length > 0 ? [
        { stat: 'Media Rend.', value: avg(enrichedTeam.map(p => p.scores?.rendimiento || 0)) },
        { stat: 'Media Merc.', value: avg(enrichedTeam.map(p => p.scores?.mercado || 0)) },
        { stat: 'Media Part.', value: avg(enrichedTeam.map(p => p.scores?.partido || 0)) },
        { stat: 'Consistencia', value: avg(enrichedTeam.map(p => p.consistencia || 50)) },
        { stat: 'Prob. Media', value: avg(enrichedTeam.map(p => p.probabilidadVal)) },
    ] : [];

    // Gangas vs Sobrevalorados
    const gangaCount = enrichedAll.filter(p => p.labels?.includes('GANGA')).length;
    const sobreCount = enrichedAll.filter(p => p.labels?.includes('SOBREVALORADO')).length;
    const valueCount = enrichedAll.filter(p => p.labels?.includes('VALUE_PICK')).length;

    const axisLabels: Record<ScatterMode, { x: string; y: string }> = {
        'valor-media': { x: 'Valor (M€)', y: 'Media Puntos' },
        'valor-score': { x: 'Valor (M€)', y: 'Score IA' },
        'media-prob': { x: 'Media Puntos', y: 'Probabilidad (%)' },
        'roi-score': { x: 'ROI', y: 'Score IA' },
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold">📈 Estadísticas y Regresión</h1>

            {/* SCATTER + REGRESSION */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Regresión Lineal y Valor Esperado</h2>
                    <div className="flex items-center gap-2">
                        <select value={scatterMode} onChange={e => setScatterMode(e.target.value as ScatterMode)}
                            className="px-2 py-1 border rounded text-sm">
                            <option value="valor-media">Valor vs Media</option>
                            <option value="valor-score">Valor vs Score IA</option>
                            <option value="media-prob">Media vs Probabilidad</option>
                            <option value="roi-score">ROI vs Score IA</option>
                        </select>
                        <select value={filtroPos} onChange={e => setFiltroPos(e.target.value)}
                            className="px-2 py-1 border rounded text-sm">
                            <option value="">Todas</option>
                            <option value="Portero">POR</option>
                            <option value="Defensa">DEF</option>
                            <option value="Mediocampista">MED</option>
                            <option value="Delantero">DEL</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <span>R² = {reg.r2.toFixed(3)}</span>
                    <span>y = {reg.slope.toFixed(2)}x + {reg.intercept.toFixed(2)}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Tu equipo</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Otros</span>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name={axisLabels[scatterMode].x}
                            label={{ value: axisLabels[scatterMode].x, position: 'bottom', offset: 0, fontSize: 11 }} tick={{ fontSize: 10 }} />
                        <YAxis type="number" dataKey="y" name={axisLabels[scatterMode].y}
                            label={{ value: axisLabels[scatterMode].y, angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 10 }} />
                        <ZAxis dataKey="score" range={[30, 200]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }}
                            content={({ payload }) => {
                                if (!payload?.length) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white border rounded shadow-lg p-2 text-xs">
                                        <p className="font-bold">{d.name}</p>
                                        <p>{axisLabels[scatterMode].x}: {d.x.toFixed(2)}</p>
                                        <p>{axisLabels[scatterMode].y}: {d.y.toFixed(2)}</p>
                                        <p>Score IA: {d.score}</p>
                                    </div>
                                );
                            }}
                        />
                        {/* Regression line */}
                        <Scatter data={regLine} fill="none" line={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6 3' }} shape={() => null} />
                        {/* Other players */}
                        <Scatter data={scatterData.filter(d => !d.owned)} fill="#d1d5db" />
                        {/* My players */}
                        <Scatter data={scatterData.filter(d => d.owned)} fill="#3b82f6" />
                    </ScatterChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                    <div className="bg-green-50 rounded p-2">
                        <p className="text-xs text-gray-500">💎 Gangas (infravalorados)</p>
                        <p className="text-xl font-bold text-green-600">{gangaCount}</p>
                    </div>
                    <div className="bg-red-50 rounded p-2">
                        <p className="text-xs text-gray-500">📉 Sobrevalorados</p>
                        <p className="text-xl font-bold text-red-600">{sobreCount}</p>
                    </div>
                    <div className="bg-teal-50 rounded p-2">
                        <p className="text-xs text-gray-500">💰 Value Picks</p>
                        <p className="text-xl font-bold text-teal-600">{valueCount}</p>
                    </div>
                </div>
            </Card>

            {/* Top 10 + Score Distribution */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-4">
                    <h3 className="font-bold mb-3">Top 10 Score IA</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={top10} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="nombre" width={70} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="score" name="Score IA" radius={[0, 4, 4, 0]}>
                                {top10.map((entry, i) => (
                                    <Cell key={i} fill={scoreColor(entry.score)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-4">
                    <h3 className="font-bold mb-3">Distribución de Scores</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={scoreDist}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" name="Jugadores" radius={[4, 4, 0, 0]}>
                                {scoreDist.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Position distribution + Team Radar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {distPos.length > 0 && (
                    <Card className="p-4">
                        <h3 className="font-bold mb-3">Mi Equipo: Posiciones</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={distPos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {distPos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {teamRadar.length > 0 && (
                    <Card className="p-4">
                        <h3 className="font-bold mb-3">Mi Equipo: Perfil</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={teamRadar}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="stat" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>
                )}
            </div>
        </div>
    );
}

function avg(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

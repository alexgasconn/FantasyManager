import { PlayerData, Plataforma } from '../types/fantasy';
import { fmtValor, formaDisplay, getStatusBadge, probColor } from '../lib/utils/fantasy';
import { scoreColor, labelColor, recommendationDisplay } from '../lib/scoring';
import { Card } from '../../components/ui/card';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend,
} from 'recharts';

interface Props {
    player: PlayerData;
    plataforma: Plataforma;
    onClose: () => void;
    allPlayers?: PlayerData[];
}

export function PlayerDetailModal({ player: p, plataforma, onClose, allPlayers = [] }: Props) {
    const scores = p.scores || { rendimiento: 0, mercado: 0, partido: 0, general: 0 };
    const { emoji: formaEmoji, color: formaColor, label: formaLabel } = formaDisplay(p.forma);
    const { icon: statusIcon, label: statusLabel, color: statusColor } = getStatusBadge(p.status, p.diasLesion);
    const rec = p.recommendation ? recommendationDisplay(p.recommendation) : null;

    // Radar data
    const radarData = [
        { stat: 'Rendimiento', value: scores.rendimiento },
        { stat: 'Mercado', value: scores.mercado },
        { stat: 'Partido', value: scores.partido },
        { stat: 'Consistencia', value: p.consistencia || 50 },
        { stat: 'Forma', value: p.formaValue / 5 * 100 },
        { stat: 'Prob. Jugar', value: p.probabilidadVal },
    ];

    // Platform comparison
    const platComparison = [
        { plat: 'LaLiga', media: p.fantasy.laliga.media, valor: p.fantasy.laliga.valor / 1_000_000 },
        { plat: 'Biwenger', media: p.fantasy.biwenger.media, valor: p.fantasy.biwenger.valor / 1_000_000 },
        { plat: 'Comunio', media: p.fantasy.comunio.media, valor: p.fantasy.comunio.valor / 1_000_000 },
        { plat: 'Futmondo', media: p.fantasy.futmondo.media, valor: p.fantasy.futmondo.valor / 1_000_000 },
        { plat: 'Mister', media: p.fantasy.mister.media, valor: p.fantasy.mister.valor / 1_000_000 },
    ].filter(x => x.media > 0 || x.valor > 0);

    // Similar players (same position, similar value)
    const valor = p.fantasy[plataforma].valor;
    const similares = allPlayers
        .filter(x => x.posicion === p.posicion && x.nombre !== p.nombre)
        .map(x => ({
            nombre: x.nombre.substring(0, 12),
            media: x.fantasy[plataforma].media,
            valor: x.fantasy[plataforma].valor / 1_000_000,
            score: x.scores?.general || 0,
        }))
        .sort((a, b) => Math.abs(a.valor - valor / 1_000_000) - Math.abs(b.valor - valor / 1_000_000))
        .slice(0, 5);

    // Stats bars
    const statsData = [
        { stat: 'Goles', value: p.stats.goles },
        { stat: 'Asist.', value: p.stats.asistencias },
        { stat: 'Amarillas', value: p.stats.amarillas },
        { stat: 'Partidos', value: p.stats.partidos },
        { stat: 'Titularidades', value: p.stats.partidos - p.stats.partidosSuplente },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-4 px-2" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full ${probColor(p.probabilidadVal)} flex items-center justify-center text-2xl font-bold shadow-lg`}>
                                {p.nombre.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{p.nombre}</h2>
                                <div className="flex items-center gap-3 mt-1 text-blue-100 text-sm">
                                    <span>{p.posicion}</span>
                                    {p.edad > 0 && <span>• {p.edad} años</span>}
                                    {p.nacionalidad && <span>• {p.nacionalidad}</span>}
                                    {p.pie && <span>• Pie {p.pie}</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={statusColor}>{statusIcon} {statusLabel}</span>
                                    <span style={{ color: formaColor }}>{formaEmoji} {formaLabel}</span>
                                    <span>📊 {p.jerarquia}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold">✕</button>
                    </div>

                    {/* Score badges */}
                    <div className="flex items-center gap-3 mt-4">
                        <ScorePill label="IA General" score={scores.general} />
                        <ScorePill label="Rendimiento" score={scores.rendimiento} />
                        <ScorePill label="Mercado" score={scores.mercado} />
                        <ScorePill label="Partido" score={scores.partido} />
                        {rec && (
                            <span className={`${rec.color} bg-white/20 px-3 py-1 rounded-full text-sm font-medium`}>
                                {rec.emoji} {rec.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Labels */}
                    {p.labels && p.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {p.labels.map(l => {
                                const { bg, text } = labelColor(l);
                                return <span key={l} className={`${bg} ${text} px-2.5 py-1 rounded-full text-xs font-semibold`}>{l}</span>;
                            })}
                        </div>
                    )}

                    {/* KPIs Row */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <KpiCard label="Valor" value={fmtValor(p.fantasy[plataforma].valor)} />
                        <KpiCard label="Media" value={p.fantasy[plataforma].media.toFixed(2)} />
                        <KpiCard label="Total Pts" value={String(p.fantasy[plataforma].total)} />
                        <KpiCard label="ROI" value={(p.roi || 0).toFixed(2)} />
                        <KpiCard label="Prob. Jugar" value={`${p.probabilidadVal}%`} />
                        <KpiCard label="Minutos" value={String(p.stats.minutos)} />
                        <KpiCard label="G / A" value={`${p.stats.goles} / ${p.stats.asistencias}`} />
                        <KpiCard label="Consistencia" value={`${p.consistencia || '-'}`} />
                        <KpiCard label="Volatilidad" value={`${p.volatilidad || '-'}`} />
                        <KpiCard
                            label="Valor Esperado"
                            value={p.valorEsperado ? fmtValor(p.valorEsperado) : '-'}
                            sub={p.diffVsEsperado ? `${p.diffVsEsperado > 0 ? '+' : ''}${p.diffVsEsperado}%` : undefined}
                            subColor={p.diffVsEsperado && p.diffVsEsperado > 0 ? 'text-green-600' : 'text-red-600'}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Radar */}
                        <Card className="p-4">
                            <h3 className="font-bold mb-3 text-sm">Perfil del Jugador</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                    <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Stats bars */}
                        <Card className="p-4">
                            <h3 className="font-bold mb-3 text-sm">Estadísticas</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={statsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="stat" width={70} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    {/* Platform comparison + Similar players */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {platComparison.length > 1 && (
                            <Card className="p-4">
                                <h3 className="font-bold mb-3 text-sm">Comparación por Plataforma</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={platComparison}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="plat" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="media" fill="#3b82f6" name="Media" />
                                        <Bar dataKey="valor" fill="#10b981" name="Valor (M)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        )}

                        {similares.length > 0 && (
                            <Card className="p-4">
                                <h3 className="font-bold mb-3 text-sm">Jugadores Similares ({p.posicion})</h3>
                                <div className="space-y-2">
                                    {similares.map(s => (
                                        <div key={s.nombre} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 text-xs">
                                            <span className="font-medium">{s.nombre}</span>
                                            <div className="flex items-center gap-3">
                                                <span>Media: <strong>{s.media.toFixed(1)}</strong></span>
                                                <span>Valor: <strong>{s.valor.toFixed(1)}M</strong></span>
                                                <div className="w-6 h-5 rounded text-[9px] font-bold text-white flex items-center justify-center"
                                                    style={{ backgroundColor: scoreColor(s.score) }}>
                                                    {Math.round(s.score)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Rival info */}
                    {p.rival && (
                        <Card className="p-4">
                            <h3 className="font-bold mb-2 text-sm">Próximo Partido</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <span>{p.localVisitante === 'local' ? '🏠 Local' : '✈️ Visitante'}</span>
                                <span>vs <strong>{p.rival}</strong></span>
                                <span>Dificultad: <strong>{p.rivalDificultad}/5</strong></span>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <div key={i} className={`w-4 h-4 rounded ${i < p.rivalDificultad ? 'bg-red-500' : 'bg-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function ScorePill({ label, score }: { label: string; score: number }) {
    return (
        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: scoreColor(score) }}>
                {Math.round(score)}
            </div>
            <span className="text-xs text-blue-100">{label}</span>
        </div>
    );
}

function KpiCard({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
            {sub && <p className={`text-xs mt-0.5 font-medium ${subColor || ''}`}>{sub}</p>}
        </div>
    );
}

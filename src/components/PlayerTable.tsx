import { useState, useMemo } from 'react';
import { PlayerData, Plataforma, SmartLabel } from '../types/fantasy';
import { fmtValor, formaDisplay, getStatusBadge, probColor } from '../lib/utils/fantasy';
import { scoreColor, labelColor, scoreBgClass, recommendationDisplay } from '../lib/scoring';
import { Input } from '../../components/ui/input';

type SortKey = 'nombre' | 'posicion' | 'prob' | 'media' | 'total' | 'valor' | 'diff' | 'goles' | 'asist' | 'minutos'
    | 'scoreGeneral' | 'scoreRendimiento' | 'scoreMercado' | 'scorePartido' | 'roi' | 'consistencia' | 'forma';
type SortDir = 'asc' | 'desc';
type QuickFilter = '' | 'ganga' | 'sobrevalorado' | 'lesionado' | 'titular' | 'capitan' | 'ariete' | 'inversion' | 'vender' | 'evitar';

interface Props {
    jugadores: PlayerData[];
    plataforma: Plataforma;
    onPlayerClick: (p: PlayerData) => void;
    showActions?: boolean;
    onAdd?: (p: PlayerData) => void;
    onRemove?: (p: PlayerData) => void;
    isOwned?: (nombre: string) => boolean;
}

export function PlayerTable({ jugadores, plataforma, onPlayerClick, showActions, onAdd, onRemove, isOwned }: Props) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('scoreGeneral');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [filtroPos, setFiltroPos] = useState('');
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const filtered = useMemo(() => {
        let list = jugadores;

        // Search
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(j => j.nombre.toLowerCase().includes(s));
        }

        // Position filter
        if (filtroPos) list = list.filter(j => j.posicion === filtroPos);

        // Quick filters
        if (quickFilter) {
            list = list.filter(j => {
                const labels = j.labels || [];
                switch (quickFilter) {
                    case 'ganga': return labels.includes('GANGA');
                    case 'sobrevalorado': return labels.includes('SOBREVALORADO');
                    case 'lesionado': return j.status === 'lesionado';
                    case 'titular': return labels.includes('TITULAR_FIJO');
                    case 'capitan': return labels.includes('CAPITÁN');
                    case 'ariete': return labels.includes('ARIETE');
                    case 'inversion': return labels.includes('INVERSIÓN');
                    case 'vender': return j.recommendation === 'vender';
                    case 'evitar': return labels.includes('EVITAR');
                    default: return true;
                }
            });
        }

        // Sort
        const mul = sortDir === 'asc' ? 1 : -1;
        list = [...list].sort((a, b) => {
            const val = (p: PlayerData): number => {
                switch (sortKey) {
                    case 'nombre': return 0;
                    case 'posicion': return 0;
                    case 'prob': return p.probabilidadVal;
                    case 'media': return p.fantasy[plataforma].media;
                    case 'total': return p.fantasy[plataforma].total;
                    case 'valor': return p.fantasy[plataforma].valor;
                    case 'diff': return p.fantasy[plataforma].diff;
                    case 'goles': return p.stats.goles;
                    case 'asist': return p.stats.asistencias;
                    case 'minutos': return p.stats.minutos;
                    case 'scoreGeneral': return p.scores?.general || 0;
                    case 'scoreRendimiento': return p.scores?.rendimiento || 0;
                    case 'scoreMercado': return p.scores?.mercado || 0;
                    case 'scorePartido': return p.scores?.partido || 0;
                    case 'roi': return p.roi || 0;
                    case 'consistencia': return p.consistencia || 0;
                    case 'forma': return p.formaValue;
                    default: return 0;
                }
            };
            if (sortKey === 'nombre') return mul * a.nombre.localeCompare(b.nombre);
            if (sortKey === 'posicion') return mul * a.posicion.localeCompare(b.posicion);
            return mul * (val(a) - val(b));
        });

        return list;
    }, [jugadores, search, filtroPos, quickFilter, sortKey, sortDir, plataforma]);

    const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
        <th
            className="px-2 py-2 text-xs font-semibold cursor-pointer hover:bg-gray-200 whitespace-nowrap select-none"
            onClick={() => handleSort(k)}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                {sortKey === k && <span className="text-blue-600">{sortDir === 'asc' ? '▲' : '▼'}</span>}
            </span>
        </th>
    );

    const quickFilters: { id: QuickFilter; label: string; emoji: string }[] = [
        { id: 'ganga', label: 'Ganga', emoji: '💎' },
        { id: 'sobrevalorado', label: 'Sobrevalorado', emoji: '📉' },
        { id: 'lesionado', label: 'Lesionado', emoji: '🏥' },
        { id: 'titular', label: 'Titular', emoji: '⭐' },
        { id: 'capitan', label: 'Capitán', emoji: '👑' },
        { id: 'ariete', label: 'Ariete', emoji: '🎯' },
        { id: 'inversion', label: 'Inversión', emoji: '📈' },
        { id: 'vender', label: 'Vender', emoji: '📤' },
        { id: 'evitar', label: 'Evitar', emoji: '🚫' },
    ];

    return (
        <div className="space-y-3">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Buscar jugador..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-48 h-8 text-sm"
                />
                <select
                    value={filtroPos}
                    onChange={e => setFiltroPos(e.target.value)}
                    className="h-8 px-2 text-sm border rounded"
                >
                    <option value="">Todas pos.</option>
                    <option value="Portero">POR</option>
                    <option value="Defensa">DEF</option>
                    <option value="Mediocampista">MED</option>
                    <option value="Delantero">DEL</option>
                </select>

                <div className="flex flex-wrap gap-1">
                    {quickFilters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setQuickFilter(quickFilter === f.id ? '' : f.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${quickFilter === f.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f.emoji} {f.label}
                        </button>
                    ))}
                </div>

                <span className="ml-auto text-xs text-gray-500">{filtered.length} jugadores</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <SortHeader k="nombre">Jugador</SortHeader>
                            <SortHeader k="posicion">Pos</SortHeader>
                            <SortHeader k="scoreGeneral">IA</SortHeader>
                            <SortHeader k="scoreRendimiento">Rend</SortHeader>
                            <SortHeader k="scoreMercado">Merc</SortHeader>
                            <SortHeader k="scorePartido">Part</SortHeader>
                            <SortHeader k="prob">Prob%</SortHeader>
                            <SortHeader k="media">Media</SortHeader>
                            <SortHeader k="total">Total</SortHeader>
                            <SortHeader k="valor">Valor</SortHeader>
                            <SortHeader k="diff">Var</SortHeader>
                            <SortHeader k="roi">ROI</SortHeader>
                            <SortHeader k="goles">G</SortHeader>
                            <SortHeader k="asist">A</SortHeader>
                            <SortHeader k="minutos">Min</SortHeader>
                            <SortHeader k="forma">Forma</SortHeader>
                            <SortHeader k="consistencia">Cons</SortHeader>
                            <th className="px-2 py-2 text-xs font-semibold">Labels</th>
                            {showActions && <th className="px-2 py-2 text-xs font-semibold">Acción</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(p => {
                            const { emoji: formaEmoji, color: formaColor } = formaDisplay(p.forma);
                            const { icon: statusIcon } = getStatusBadge(p.status, p.diasLesion);
                            const diffVal = p.fantasy[plataforma].diff;
                            const owned = isOwned?.(p.nombre);

                            return (
                                <tr
                                    key={p.nombre}
                                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${owned ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => onPlayerClick(p)}
                                >
                                    <td className="px-2 py-1.5 font-medium max-w-[140px] truncate">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm">{statusIcon}</span>
                                            <span>{p.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${p.posicion === 'Portero' ? 'bg-yellow-500' : p.posicion === 'Defensa' ? 'bg-blue-500' : p.posicion === 'Mediocampista' ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {p.posicion.substring(0, 3).toUpperCase()}
                                        </span>
                                    </td>
                                    {/* Score IA General */}
                                    <td className="px-2 py-1.5">
                                        <ScoreCell score={p.scores?.general || 0} />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <ScoreCell score={p.scores?.rendimiento || 0} small />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <ScoreCell score={p.scores?.mercado || 0} small />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <ScoreCell score={p.scores?.partido || 0} small />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <div className={`inline-block px-1.5 py-0.5 rounded text-white text-[10px] font-bold ${probColor(p.probabilidadVal)}`}>
                                            {p.probabilidadVal}%
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 font-bold text-right">{p.fantasy[plataforma].media.toFixed(1)}</td>
                                    <td className="px-2 py-1.5 text-right">{p.fantasy[plataforma].total}</td>
                                    <td className="px-2 py-1.5 text-right font-medium">{fmtValor(p.fantasy[plataforma].valor)}</td>
                                    <td className={`px-2 py-1.5 text-right font-bold ${diffVal > 0 ? 'text-green-600' : diffVal < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                        {diffVal > 0 ? '+' : ''}{fmtValor(diffVal)}
                                    </td>
                                    <td className="px-2 py-1.5 text-right">{(p.roi || 0).toFixed(1)}</td>
                                    <td className="px-2 py-1.5 text-center">{p.stats.goles}</td>
                                    <td className="px-2 py-1.5 text-center">{p.stats.asistencias}</td>
                                    <td className="px-2 py-1.5 text-right">{p.stats.minutos}</td>
                                    <td className="px-2 py-1.5">
                                        <span style={{ color: formaColor }}>{formaEmoji}</span>
                                    </td>
                                    <td className="px-2 py-1.5 text-center">{p.consistencia || '-'}</td>
                                    <td className="px-2 py-1.5">
                                        <div className="flex flex-wrap gap-0.5 max-w-[160px]">
                                            {(p.labels || []).slice(0, 3).map(l => {
                                                const { bg, text } = labelColor(l);
                                                return (
                                                    <span key={l} className={`${bg} ${text} px-1 py-0 rounded text-[9px] font-medium`}>
                                                        {l}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    {showActions && (
                                        <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                                            {owned ? (
                                                <button
                                                    onClick={() => onRemove?.(p)}
                                                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-medium hover:bg-red-200"
                                                >
                                                    ✕
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onAdd?.(p)}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-medium hover:bg-blue-200"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ScoreCell({ score, small }: { score: number; small?: boolean }) {
    const color = scoreColor(score);
    return (
        <div className={`inline-flex items-center justify-center rounded font-bold text-white ${small ? 'w-6 h-5 text-[9px]' : 'w-8 h-6 text-[11px]'}`}
            style={{ backgroundColor: color }}
        >
            {Math.round(score)}
        </div>
    );
}

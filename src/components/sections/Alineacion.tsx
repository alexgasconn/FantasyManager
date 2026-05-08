import { useState, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { calcBestLineup, enrichAllPlayers, scoreColor } from '../../lib/scoring';
import { fmtValor, probColor, formaDisplay } from '../../lib/utils/fantasy';
import { PlayerData, Plataforma, Posicion } from '../../types/fantasy';

const FORMACIONES = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '3-4-3', '4-2-3-1', '3-3-4'];

function posCode(pos: Posicion): 'POR' | 'DEF' | 'CEN' | 'DEL' {
    if (pos === 'Portero') return 'POR';
    if (pos === 'Defensa') return 'DEF';
    if (pos === 'Mediocampista') return 'CEN';
    return 'DEL';
}

function roleCodeForPlayer(p: PlayerData, lineup: { lineas: { por: PlayerData[]; def: PlayerData[]; cen: PlayerData[]; del: PlayerData[] } }): 'POR' | 'DEF' | 'CEN' | 'DEL' {
    if (lineup.lineas.por.some(x => x.nombre === p.nombre)) return 'POR';
    if (lineup.lineas.def.some(x => x.nombre === p.nombre)) return 'DEF';
    if (lineup.lineas.cen.some(x => x.nombre === p.nombre)) return 'CEN';
    if (lineup.lineas.del.some(x => x.nombre === p.nombre)) return 'DEL';
    return posCode(p.posicion);
}

export function Alineacion() {
    const { miEquipo, plataformaActiva } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [formacion, setFormacion] = useState(settings.formacion);

    const enriched = useMemo(() =>
        enrichAllPlayers(miEquipo, plataformaActiva, settings),
        [miEquipo, plataformaActiva, settings]
    );

    const lineup = useMemo(() =>
        calcBestLineup(enriched, plataformaActiva, formacion, settings),
        [enriched, plataformaActiva, formacion, settings]
    );

    const totalScore = lineup.titulares.reduce((s, p) => s + (p.scores?.general || 0), 0);
    const avgScore = lineup.titulares.length > 0 ? totalScore / lineup.titulares.length : 0;

    // Field positions for visual display
    const getPositions = (form: string): Record<string, { x: number; y: number }[]> => {
        const parts = form.split('-').map(Number);
        const positions: Record<string, { x: number; y: number }[]> = {
            portero: [{ x: 50, y: 90 }],
            defensas: [],
            medios: [],
            delanteros: [],
        };

        const spread = (count: number, y: number) => {
            const step = 80 / (count + 1);
            return Array.from({ length: count }, (_, i) => ({ x: 10 + step * (i + 1), y }));
        };

        if (parts.length === 3) {
            positions.defensas = spread(parts[0], 72);
            positions.medios = spread(parts[1], 48);
            positions.delanteros = spread(parts[2], 22);
        } else if (parts.length === 4) {
            positions.defensas = spread(parts[0], 75);
            positions.medios = spread(parts[1], 55);
            const extra = spread(parts[2], 38);
            positions.delanteros = [...extra, ...spread(parts[3], 20)];
        }

        return positions;
    };

    const fieldPositions = getPositions(formacion);

    const portero = lineup.lineas.por[0];
    const defensas = lineup.lineas.def;
    const medios = lineup.lineas.cen;
    const delanteros = lineup.lineas.del;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">⚡ Alineación Automática</h1>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Formación:</label>
                    <select
                        value={formacion}
                        onChange={e => setFormacion(e.target.value)}
                        className="px-3 py-2 border rounded font-bold text-lg"
                    >
                        {FORMACIONES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            {miEquipo.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">No hay jugadores en tu equipo.</Card>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card className="p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase">Score Total</p>
                            <p className="text-3xl font-bold" style={{ color: scoreColor(avgScore) }}>{Math.round(totalScore)}</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase">Score Medio</p>
                            <p className="text-3xl font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore.toFixed(1)}</p>
                        </Card>
                        <Card className="p-4 text-center bg-amber-50">
                            <p className="text-xs text-gray-500 uppercase">👑 Capitán (x2)</p>
                            <p className="text-xl font-bold">{lineup.capitan?.nombre || '-'}</p>
                            {lineup.capitan && <p className="text-xs text-gray-500">Score: {lineup.capitan.scores?.general || 0}</p>}
                        </Card>
                        <Card className="p-4 text-center bg-purple-50">
                            <p className="text-xs text-gray-500 uppercase">🎯 Ariete (+3)</p>
                            <p className="text-xl font-bold">{lineup.ariete?.nombre || '-'}</p>
                            {lineup.ariete && <p className="text-xs text-gray-500">Score: {lineup.ariete.scores?.general || 0}</p>}
                        </Card>
                    </div>

                    {/* Football field */}
                    <Card className="p-2">
                        <div className="relative bg-gradient-to-b from-green-600 via-green-500 to-green-700 rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                                <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.3" opacity="0.3" />
                                <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.2" opacity="0.3" />
                                <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
                            </svg>

                            {/* Portero */}
                            {portero && (
                                <PlayerOnField key={portero.nombre} player={portero} pos={fieldPositions.portero[0]}
                                    isCapitan={portero.nombre === lineup.capitan?.nombre}
                                    isAriete={portero.nombre === lineup.ariete?.nombre}
                                    plataforma={plataformaActiva}
                                    roleCode="POR" />
                            )}

                            {/* Defensas */}
                            {defensas.map((p, i) => (
                                <PlayerOnField key={p.nombre} player={p} pos={fieldPositions.defensas[i] || { x: 50, y: 72 }}
                                    isCapitan={p.nombre === lineup.capitan?.nombre}
                                    isAriete={p.nombre === lineup.ariete?.nombre}
                                    plataforma={plataformaActiva}
                                    roleCode="DEF" />
                            ))}

                            {/* Medios */}
                            {medios.map((p, i) => (
                                <PlayerOnField key={p.nombre} player={p} pos={fieldPositions.medios[i] || { x: 50, y: 48 }}
                                    isCapitan={p.nombre === lineup.capitan?.nombre}
                                    isAriete={p.nombre === lineup.ariete?.nombre}
                                    plataforma={plataformaActiva}
                                    roleCode="CEN" />
                            ))}

                            {/* Delanteros */}
                            {delanteros.map((p, i) => (
                                <PlayerOnField key={p.nombre} player={p} pos={fieldPositions.delanteros[i] || { x: 50, y: 22 }}
                                    isCapitan={p.nombre === lineup.capitan?.nombre}
                                    isAriete={p.nombre === lineup.ariete?.nombre}
                                    plataforma={plataformaActiva}
                                    roleCode="DEL" />
                            ))}
                        </div>
                    </Card>

                    {/* Titulares table */}
                    <Card className="p-4">
                        <h3 className="font-bold mb-3">Titulares ({lineup.titulares.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Jugador</th>
                                        <th className="px-3 py-2 text-left">Pos</th>
                                        <th className="px-3 py-2 text-center">Score IA</th>
                                        <th className="px-3 py-2 text-center">Prob%</th>
                                        <th className="px-3 py-2 text-center">Media</th>
                                        <th className="px-3 py-2 text-center">Valor</th>
                                        <th className="px-3 py-2 text-center">Rol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {lineup.titulares.map(p => {
                                        const isC = p.nombre === lineup.capitan?.nombre;
                                        const isA = p.nombre === lineup.ariete?.nombre;
                                        return (
                                            <tr key={p.nombre} className={`${isC ? 'bg-amber-50' : isA ? 'bg-purple-50' : ''}`}>
                                                <td className="px-3 py-2 font-medium">
                                                    {isC && '👑 '}{isA && '🎯 '}{p.nombre}
                                                </td>
                                                <td className="px-3 py-2">{roleCodeForPlayer(p, lineup)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="inline-block w-8 h-6 rounded text-xs font-bold text-white flex items-center justify-center"
                                                        style={{ backgroundColor: scoreColor(p.scores?.general || 0) }}>
                                                        {Math.round(p.scores?.general || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">{p.probabilidadVal}%</td>
                                                <td className="px-3 py-2 text-center font-bold">{p.fantasy[plataformaActiva].media.toFixed(1)}</td>
                                                <td className="px-3 py-2 text-center">{fmtValor(p.fantasy[plataformaActiva].valor)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    {isC ? '👑 Capitán' : isA ? '🎯 Ariete' : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Banquillo */}
                    <Card className="p-4">
                        <h3 className="font-bold mb-3">💺 Banquillo ({lineup.banquillo.length})</h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {lineup.banquillo.map(p => {
                                const { emoji } = formaDisplay(p.forma);
                                return (
                                    <div key={p.nombre} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full ${probColor(p.probabilidadVal)} flex items-center justify-center text-white text-xs font-bold`}>
                                                {p.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{p.nombre}</p>
                                                <p className="text-xs text-gray-500">{p.posicion} {emoji}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {lineup.banquillo.length === 0 && (
                                <p className="text-gray-400 text-sm col-span-4">No hay suplentes disponibles</p>
                            )}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

function PlayerOnField({ player, pos, isCapitan, isAriete, plataforma, roleCode }: {
    player: PlayerData;
    pos: { x: number; y: number };
    isCapitan: boolean;
    isAriete: boolean;
    plataforma: Plataforma;
    roleCode: 'POR' | 'DEF' | 'CEN' | 'DEL';
}) {
    const score = player.scores?.general || 0;
    const code = roleCode;
    return (
        <div className="absolute text-center" style={{
            left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)',
        }}>
            <div className="flex flex-col items-center gap-0.5">
                <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                        style={{ backgroundColor: scoreColor(score) }}>
                        {Math.round(score)}
                    </div>
                    {isCapitan && <span className="absolute -top-1 -right-1 text-sm">👑</span>}
                    {isAriete && <span className="absolute -top-1 -right-1 text-sm">🎯</span>}
                </div>
                <div className="bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap max-w-[70px] truncate">
                    {player.nombre.split(' ').pop()}
                </div>
                <div className="text-white text-[9px] font-semibold bg-black/50 rounded px-1">
                    {code} · {player.fantasy[plataforma].media.toFixed(1)} pts
                </div>
            </div>
        </div>
    );
}

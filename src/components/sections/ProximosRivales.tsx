import { useState, useEffect, useMemo } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { enrichAllPlayers, scoreColor } from '../../lib/scoring';
import { fetchClubElo, getEloDificultad, eloDificultadColor, EloEntry } from '../../lib/clubelo';

export function ProximosRivales() {
    const { miEquipo, plataformaActiva } = useFantasyStore();
    const { settings } = useSettingsStore();
    const [eloData, setEloData] = useState<EloEntry[]>([]);

    useEffect(() => { fetchClubElo().then(setEloData); }, []);

    const enriched = useMemo(() =>
        enrichAllPlayers(miEquipo, plataformaActiva, settings),
        [miEquipo, plataformaActiva, settings]
    );

    // Group players by their rival
    const rivalGroups = useMemo(() => {
        const byRival: Record<string, typeof enriched> = {};
        for (const p of enriched) {
            const rival = p.rival || 'Desconocido';
            if (!byRival[rival]) byRival[rival] = [];
            byRival[rival].push(p);
        }

        return Object.entries(byRival)
            .filter(([rival]) => rival !== 'Desconocido' && rival !== '')
            .map(([rival, players]) => {
                const sample = players[0];
                const dificultad = sample.rivalDificultad || 3;
                return {
                    rival,
                    dificultad,
                    players,
                    avgScore: players.reduce((s, p) => s + (p.scores?.general || 0), 0) / players.length,
                };
            })
            .sort((a, b) => a.dificultad - b.dificultad);
    }, [enriched]);

    // Player ranking by combined score + fixture ease
    const rankingPorFixture = useMemo(() =>
        [...enriched]
            .filter(p => p.rival)
            .map(p => {
                const dif = p.rivalDificultad || 3;
                const fixtureBonus = (5 - dif) * 10;
                const combinedScore = (p.scores?.general || 0) + fixtureBonus;
                return { ...p, dificultad: dif, combinedScore };
            })
            .sort((a, b) => b.combinedScore - a.combinedScore),
        [enriched]
    );

    return (
        <div className="space-y-5 p-4">
            <h1 className="text-2xl font-bold">📅 Próximos Rivales</h1>

            {/* ELO Ranking LaLiga */}
            {eloData.length > 0 && (
                <Card className="p-4">
                    <h2 className="font-bold mb-3 text-sm">ELO Rating LaLiga (ClubElo.com)</h2>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5">
                        {eloData.sort((a, b) => b.elo - a.elo).map((team, i) => (
                            <div key={team.slug} className="flex items-center gap-2 text-xs bg-gray-50 rounded p-2">
                                <span className="text-gray-400 font-bold w-5">#{i + 1}</span>
                                <span className="font-medium flex-1 truncate">{team.name}</span>
                                <span className="font-bold text-blue-600">{Math.round(team.elo)}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Rival matchups */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {rivalGroups.map(rg => (
                    <Card key={rg.rival} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-bold text-sm">vs {rg.rival}</p>
                                <p className="text-xs text-gray-500">{rg.players.length} jugadores</p>
                            </div>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < rg.dificultad ? eloDificultadColor(rg.dificultad) : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1">
                            {rg.players.slice(0, 4).map(p => (
                                <div key={p.nombre} className="flex items-center justify-between text-xs">
                                    <span className="truncate max-w-[120px]">{p.nombre}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">{p.probabilidad}%</span>
                                        <span className="font-bold" style={{ color: scoreColor(p.scores?.general || 0) }}>
                                            {Math.round(p.scores?.general || 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {rg.players.length > 4 && (
                                <p className="text-[10px] text-gray-400">+{rg.players.length - 4} más</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Best picks for this fixture */}
            <Card className="p-4">
                <h2 className="font-bold mb-3 text-sm">🎯 Mejores Picks (Score IA + Fixture)</h2>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {rankingPorFixture.slice(0, 10).map((p, i) => (
                        <div key={p.nombre} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <span className="text-gray-400 font-bold w-5 text-sm">#{i + 1}</span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: scoreColor(p.scores?.general || 0) }}>
                                {Math.round(p.scores?.general || 0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{p.nombre}</p>
                                <p className="text-[10px] text-gray-500">vs {p.rival}</p>
                            </div>
                            <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className={`w-2 h-2 rounded-full ${j < p.dificultad ? eloDificultadColor(p.dificultad) : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Legend */}
            <Card className="p-3 bg-gradient-to-r from-green-50 via-yellow-50 to-red-50">
                <div className="flex items-center gap-4 text-xs">
                    <span className="font-bold">Dificultad:</span>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> 1 Fácil</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-lime-500" /> 2</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /> 3 Normal</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /> 4</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /> 5 Difícil</div>
                </div>
            </Card>
        </div>
    );
}

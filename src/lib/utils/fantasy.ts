import { PlayerData, Plataforma, Forma } from '../../types/fantasy';

export function fmtValor(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return `${v}`;
}

export function fmtDiff(diff: number): { text: string; color: string } {
    if (diff > 0) return { text: `+${fmtValor(diff)}`, color: 'green' };
    if (diff < 0) return { text: fmtValor(diff), color: 'red' };
    return { text: '=', color: 'gray' };
}

export function probColor(val: number): string {
    if (val >= 80) return 'bg-green-600';
    if (val >= 60) return 'bg-lime-500';
    if (val >= 40) return 'bg-yellow-500';
    if (val >= 20) return 'bg-orange-500';
    if (val > 0) return 'bg-red-600';
    return 'bg-gray-400';
}

export function probColorValue(val: number): string {
    if (val >= 80) return '#22c55e';
    if (val >= 60) return '#84cc16';
    if (val >= 40) return '#eab308';
    if (val >= 20) return '#f97316';
    if (val > 0) return '#dc2626';
    return '#9ca3af';
}

export function calcRiskScore(player: PlayerData, plataforma: Plataforma): number {
    const media = player.fantasy[plataforma].media;
    const prob = player.probabilidadVal / 100;
    return media * prob;
}

export function calcOnceProbable(jugadores: PlayerData[], formacion = '4-3-3'): PlayerData[] {
    const [def, med, del] = formacion.split('-').map(Number);
    const disponibles = jugadores.filter(j => j.probabilidadVal > 0);

    const sort = (pos: string, n: number) =>
        disponibles
            .filter(j => j.posicion === pos)
            .sort((a, b) => b.probabilidadVal - a.probabilidadVal)
            .slice(0, n);

    return [
        ...sort('Portero', 1),
        ...sort('Defensa', def),
        ...sort('Mediocampista', med),
        ...sort('Delantero', del),
    ];
}

export function fixtureScore(rivalDificultad: number, localVisitante: 'local' | 'visitante'): number {
    const base = rivalDificultad * 2;
    const bonus = localVisitante === 'local' ? -1 : 1;
    return Math.max(1, Math.min(10, base + bonus));
}

export function formaDisplay(forma: Forma): { emoji: string; color: string; label: string } {
    const map: Record<Forma, { emoji: string; color: string; label: string }> = {
        'muy_bajando': { emoji: '↓↓', color: '#E24B4A', label: 'Muy mal' },
        'bajando': { emoji: '↓', color: '#D85A30', label: 'Bajando' },
        'estable': { emoji: '→', color: '#888780', label: 'Estable' },
        'subiendo': { emoji: '↑', color: '#639922', label: 'Subiendo' },
        'muy_subiendo': { emoji: '↑↑', color: '#1D9E75', label: 'En forma' },
    };
    return map[forma] || map['estable'];
}

export function getStatusBadge(status: string, diasLesion: number): { icon: string; label: string; color: string } {
    if (status === 'lesionado')
        return { icon: '🏥', label: `Lesionado (${diasLesion}d)`, color: 'text-red-600' };
    if (status === 'sancionado') return { icon: '🚫', label: 'Sancionado', color: 'text-red-600' };
    if (status === 'apercibido') return { icon: '⚠️', label: 'Apercibido', color: 'text-yellow-600' };
    return { icon: '✅', label: 'Disponible', color: 'text-green-600' };
}

export function calcValorTotal(jugadores: PlayerData[], plataforma: Plataforma): number {
    return jugadores.reduce((acc, j) => acc + j.fantasy[plataforma].valor, 0);
}

export function calcMediaEquipo(jugadores: PlayerData[], plataforma: Plataforma): number {
    if (jugadores.length === 0) return 0;
    const total = jugadores.reduce((acc, j) => acc + j.fantasy[plataforma].media, 0);
    return total / jugadores.length;
}

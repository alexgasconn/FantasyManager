import { PlayerData, Plataforma, IAScores, SmartLabel, Recommendation, AppSettings, DEFAULT_SETTINGS } from '../types/fantasy';

// ============================================================
// SCORE DE RENDIMIENTO (0-100)
// ============================================================
export function calcRendimiento(p: PlayerData, plat: Plataforma): number {
    const media = p.fantasy[plat].media;
    const partidos = p.stats.partidos;
    const minutos = p.stats.minutos;
    const prob = p.probabilidadVal;
    const formaVal = p.formaValue;

    // Weighted factors
    const mediaScore = clamp(media / 10 * 100, 0, 100); // 10pts = 100
    const minutosScore = clamp(minutos / (partidos * 90 || 1) * 100, 0, 100);
    const titularidadScore = partidos > 0
        ? clamp(((partidos - p.stats.partidosSuplente) / partidos) * 100, 0, 100)
        : 0;
    const probScore = prob;
    const formaScore = clamp(formaVal / 5 * 100, 0, 100);

    // Consistency: low variance approximation from available data
    const consistencia = partidos > 3 ? clamp((1 - Math.abs(media - 5) / 5) * 100, 0, 100) : 50;

    // Penalize injuries
    const lesionPenalty = p.status === 'lesionado' ? 30 : p.status === 'sancionado' ? 20 : 0;

    const raw = (
        mediaScore * 0.30 +
        minutosScore * 0.10 +
        titularidadScore * 0.15 +
        probScore * 0.15 +
        formaScore * 0.15 +
        consistencia * 0.15
    ) - lesionPenalty;

    return clamp(Math.round(raw), 0, 100);
}

// ============================================================
// SCORE DE MERCADO (0-100)
// ============================================================
export function calcMercado(p: PlayerData, plat: Plataforma, allPlayers: PlayerData[]): number {
    const valor = p.fantasy[plat].valor;
    const media = p.fantasy[plat].media;
    const diff = p.fantasy[plat].diff;

    if (valor <= 0) return 50;

    // ROI = media / (valor per million)
    const valorM = valor / 1_000_000 || 0.1;
    const roi = media / valorM;

    // Percentile ROI among all players
    const allROIs = allPlayers
        .map(pl => pl.fantasy[plat].media / (pl.fantasy[plat].valor / 1_000_000 || 0.1))
        .sort((a, b) => a - b);
    const roiPercentile = percentileOf(allROIs, roi);

    // Price trend
    const trendScore = diff > 0 ? clamp(diff / 500000 * 20 + 50, 50, 80)
        : diff < 0 ? clamp(50 + diff / 500000 * 20, 20, 50)
            : 50;

    // Expected value from regression
    const expectedVal = calcExpectedValue(media, allPlayers, plat);
    const diffVsExpected = valor > 0 ? (expectedVal - valor) / valor : 0;
    const valueGapScore = clamp(50 + diffVsExpected * 100, 0, 100);

    const raw = (
        roiPercentile * 0.40 +
        trendScore * 0.20 +
        valueGapScore * 0.40
    );

    return clamp(Math.round(raw), 0, 100);
}

// ============================================================
// SCORE PRÓXIMO PARTIDO (0-100)
// ============================================================
export function calcPartido(p: PlayerData): number {
    const rivalDif = p.rivalDificultad; // 1-5
    const isLocal = p.localVisitante === 'local';
    const prob = p.probabilidadVal;

    // Lower rival difficulty = easier = higher score
    const rivalScore = clamp((6 - rivalDif) / 5 * 100, 0, 100);
    const localBonus = isLocal ? 15 : 0;
    const probScore = prob;
    const formaScore = clamp(p.formaValue / 5 * 100, 0, 100);

    const raw = (
        rivalScore * 0.35 +
        probScore * 0.30 +
        formaScore * 0.20 +
        localBonus * 0.15
    ) + (isLocal ? 5 : 0);

    return clamp(Math.round(raw), 0, 100);
}

// ============================================================
// SCORE IA GENERAL (weighted combination)
// ============================================================
export function calcScoresIA(
    p: PlayerData,
    plat: Plataforma,
    allPlayers: PlayerData[],
    settings: AppSettings = DEFAULT_SETTINGS
): IAScores {
    const rendimiento = calcRendimiento(p, plat);
    const mercado = calcMercado(p, plat, allPlayers);
    const partido = calcPartido(p);

    const w = settings.pesosScores;
    const general = clamp(Math.round(
        rendimiento * w.rendimiento +
        mercado * w.mercado +
        partido * w.partido
    ), 0, 100);

    return { rendimiento, mercado, partido, general };
}

// ============================================================
// SMART LABELS
// ============================================================
export function calcLabels(p: PlayerData, plat: Plataforma, allPlayers: PlayerData[], settings: AppSettings = DEFAULT_SETTINGS): SmartLabel[] {
    const labels: SmartLabel[] = [];
    const scores = p.scores || calcScoresIA(p, plat, allPlayers, settings);
    const valor = p.fantasy[plat].valor;
    const media = p.fantasy[plat].media;
    const roi = valor > 0 ? media / (valor / 1_000_000) : 0;

    // Calculate percentiles
    const allROIs = allPlayers.map(pl => pl.fantasy[plat].media / (pl.fantasy[plat].valor / 1_000_000 || 0.1));
    const allMedias = allPlayers.map(pl => pl.fantasy[plat].media);
    const allValores = allPlayers.map(pl => pl.fantasy[plat].valor);

    const roiPct = percentileOf(allROIs.sort((a, b) => a - b), roi);
    const mediaPct = percentileOf(allMedias.sort((a, b) => a - b), media);
    const valorPct = percentileOf(allValores.sort((a, b) => a - b), valor);

    // GANGA: high ROI, low price, good performance
    if (roiPct > 75 && valorPct < 40) labels.push('GANGA');

    // SOBREVALORADO: high price, low performance
    if (valorPct > 70 && mediaPct < 40) labels.push('SOBREVALORADO');

    // VALUE_PICK: good ROI
    if (roiPct > 65 && !labels.includes('GANGA')) labels.push('VALUE_PICK');

    // EVITAR: bad scores overall
    if (scores.general < 25 && p.status !== 'lesionado') labels.push('EVITAR');

    // INVERSIÓN: trending up, undervalued
    if (p.fantasy[plat].diff > 0 && roiPct > 50 && scores.mercado > 60) labels.push('INVERSIÓN');

    // TITULAR_FIJO
    if (p.jerarquia === 'Indiscutible' || (p.probabilidadVal >= 90 && p.stats.partidos > 10)) labels.push('TITULAR_FIJO');

    // ROTACIÓN
    if (p.jerarquia === 'Rotación alta' || (p.probabilidadVal >= 40 && p.probabilidadVal < 70)) labels.push('ROTACIÓN');

    // LESIONADO
    if (p.status === 'lesionado') labels.push('LESIONADO');

    // RIESGO
    if (p.status === 'apercibido' || (p.probabilidadVal < 50 && p.probabilidadVal > 0)) labels.push('RIESGO');

    // EN_RACHA
    if (p.forma === 'muy_subiendo' || (p.forma === 'subiendo' && scores.rendimiento > 70)) labels.push('EN_RACHA');

    // CAPITÁN: top scorer with high probability
    if (mediaPct > 85 && p.probabilidadVal >= 80) labels.push('CAPITÁN');

    // ARIETE: good scorer, affordable
    if (mediaPct > 60 && valorPct < 50 && p.probabilidadVal >= 70) labels.push('ARIETE');

    // DIFERENCIAL: low ownership potential, good score
    if (scores.general > 65 && valorPct < 30) labels.push('DIFERENCIAL');

    // APUESTA: high upside, uncertain
    if (scores.mercado > 60 && p.probabilidadVal < 70 && p.probabilidadVal > 30) labels.push('APUESTA');

    // HIGH_RISK
    if (p.status === 'apercibido' && p.jerarquia.includes('Titular')) labels.push('HIGH_RISK');

    // SAFE_PICK
    if (p.probabilidadVal >= 90 && scores.rendimiento > 50 && p.status === 'disponible') labels.push('SAFE_PICK');

    return labels;
}

// ============================================================
// RECOMMENDATION for owned players
// ============================================================
export function calcRecommendation(p: PlayerData, plat: Plataforma, allPlayers: PlayerData[]): Recommendation {
    const scores = p.scores || calcScoresIA(p, plat, allPlayers);
    const valor = p.fantasy[plat].valor;
    const media = p.fantasy[plat].media;
    const roi = valor > 0 ? media / (valor / 1_000_000) : 0;

    if (p.status === 'lesionado' && p.diasLesion > 14) return 'vender';
    if (scores.general < 20) return 'vender';
    if (scores.mercado > 75 && scores.rendimiento < 40) return 'vender';

    if (scores.general > 70 && p.probabilidadVal >= 70) return 'alinear';
    if (scores.general > 50 && p.probabilidadVal >= 50) return 'mantener';

    if (p.fantasy[plat].diff > 0 && scores.mercado > 60) return 'inversión';
    if (p.probabilidadVal < 40) return 'banquillo';

    if (scores.mercado > 80) return 'clausular';

    return 'mantener';
}

// ============================================================
// EXPECTED VALUE (linear regression approximation)
// ============================================================
export function calcExpectedValue(media: number, allPlayers: PlayerData[], plat: Plataforma): number {
    // Simple linear regression: valor = a * media + b
    const points = allPlayers
        .filter(p => p.fantasy[plat].valor > 0 && p.fantasy[plat].media > 0)
        .map(p => ({ x: p.fantasy[plat].media, y: p.fantasy[plat].valor }));

    if (points.length < 3) return 0;

    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return sumY / n;

    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - a * sumX) / n;

    return Math.max(0, a * media + b);
}

// ============================================================
// VOLATILITY / CONSISTENCY
// ============================================================
export function calcVolatilidad(p: PlayerData, plat: Plataforma): number {
    // Approximate from available stats
    const media = p.fantasy[plat].media;
    const partidos = p.stats.partidos;
    if (partidos < 3) return 50;

    // Use coefficient of variation proxy
    const golesPer90 = partidos > 0 ? p.stats.goles / partidos : 0;
    const asstPer90 = partidos > 0 ? p.stats.asistencias / partidos : 0;

    // Higher media variation = higher volatility
    const irregularity = Math.abs(media - (golesPer90 * 8 + asstPer90 * 5 + 2));
    return clamp(Math.round(irregularity / media * 100), 0, 100);
}

export function calcConsistencia(p: PlayerData, plat: Plataforma): number {
    return 100 - calcVolatilidad(p, plat);
}

// ============================================================
// FULL ENRICHMENT: add scores, labels, etc. to all players
// ============================================================
export function enrichAllPlayers(
    players: PlayerData[],
    plat: Plataforma,
    settings: AppSettings = DEFAULT_SETTINGS
): PlayerData[] {
    return players.map(p => {
        const scores = calcScoresIA(p, plat, players, settings);
        const labels = calcLabels(p, plat, players, settings);
        const recommendation = calcRecommendation(p, plat, players);
        const valor = p.fantasy[plat].valor;
        const media = p.fantasy[plat].media;
        const roi = valor > 0 ? media / (valor / 1_000_000) : 0;
        const valorEsperado = calcExpectedValue(media, players, plat);
        const diffVsEsperado = valor > 0 ? ((valorEsperado - valor) / valor) * 100 : 0;
        const volatilidad = calcVolatilidad(p, plat);
        const consistencia = 100 - volatilidad;

        return {
            ...p,
            scores,
            labels,
            recommendation,
            roi: Math.round(roi * 100) / 100,
            valorEsperado: Math.round(valorEsperado),
            diffVsEsperado: Math.round(diffVsEsperado),
            volatilidad,
            consistencia,
        };
    });
}

// ============================================================
// LINEAR REGRESSION for scatter charts
// ============================================================
export function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const meanY = sumY / n;
    const ssTotal = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
    const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
    const r2 = ssTotal > 0 ? 1 - ssRes / ssTotal : 0;

    return { slope, intercept, r2 };
}

// ============================================================
// AUTO LINEUP
// ============================================================
export function calcBestLineup(
    players: PlayerData[],
    plat: Plataforma,
    formacion: string,
    settings: AppSettings = DEFAULT_SETTINGS
): { titulares: PlayerData[]; capitan: PlayerData | null; ariete: PlayerData | null; banquillo: PlayerData[] } {
    const [nDef, nMed, nDel] = formacion.split('-').map(Number);
    const disponibles = players.filter(p => p.probabilidadVal > 0 && p.status === 'disponible');

    const sortByScore = (arr: PlayerData[]) =>
        arr.slice().sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0));

    const porteros = sortByScore(disponibles.filter(p => p.posicion === 'Portero'));
    const defensas = sortByScore(disponibles.filter(p => p.posicion === 'Defensa'));
    const medios = sortByScore(disponibles.filter(p => p.posicion === 'Mediocampista'));
    const delanteros = sortByScore(disponibles.filter(p => p.posicion === 'Delantero'));

    const titulares = [
        ...porteros.slice(0, 1),
        ...defensas.slice(0, nDef),
        ...medios.slice(0, nMed),
        ...delanteros.slice(0, nDel),
    ];

    const titularNames = new Set(titulares.map(p => p.nombre));

    // Captain: highest score, under price limit
    const capitan = titulares
        .filter(p => p.fantasy[plat].valor <= settings.precioMaxCapitan)
        .sort((a, b) => (b.scores?.general || 0) - (a.scores?.general || 0))[0] || null;

    // Ariete: best goal potential, under price limit
    const ariete = titulares
        .filter(p => p.fantasy[plat].valor <= settings.precioMaxAriete && p.nombre !== capitan?.nombre)
        .sort((a, b) => {
            const aGoalScore = a.stats.goles / Math.max(a.stats.partidos, 1) + (a.scores?.partido || 0) / 100;
            const bGoalScore = b.stats.goles / Math.max(b.stats.partidos, 1) + (b.scores?.partido || 0) / 100;
            return bGoalScore - aGoalScore;
        })[0] || null;

    // Bench: 1 per position from non-starters
    const banquillo = [
        porteros.find(p => !titularNames.has(p.nombre)),
        defensas.find(p => !titularNames.has(p.nombre)),
        medios.find(p => !titularNames.has(p.nombre)),
        delanteros.find(p => !titularNames.has(p.nombre)),
    ].filter(Boolean) as PlayerData[];

    return { titulares, capitan, ariete, banquillo };
}

// ============================================================
// UTILITIES
// ============================================================
function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

function percentileOf(sorted: number[], value: number): number {
    if (sorted.length === 0) return 50;
    let count = 0;
    for (const v of sorted) {
        if (v < value) count++;
    }
    return (count / sorted.length) * 100;
}

export function scoreColor(score: number): string {
    if (score >= 80) return '#22c55e'; // green bright
    if (score >= 65) return '#4ade80'; // green
    if (score >= 50) return '#eab308'; // yellow
    if (score >= 35) return '#f97316'; // orange
    return '#ef4444'; // red
}

export function scoreBgClass(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    if (score >= 35) return 'bg-orange-400';
    return 'bg-red-500';
}

export function labelColor(label: SmartLabel): { bg: string; text: string } {
    const map: Record<SmartLabel, { bg: string; text: string }> = {
        'GANGA': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
        'SOBREVALORADO': { bg: 'bg-red-100', text: 'text-red-800' },
        'EVITAR': { bg: 'bg-red-200', text: 'text-red-900' },
        'INVERSIÓN': { bg: 'bg-blue-100', text: 'text-blue-800' },
        'TITULAR_FIJO': { bg: 'bg-green-100', text: 'text-green-800' },
        'ROTACIÓN': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        'LESIONADO': { bg: 'bg-red-100', text: 'text-red-700' },
        'RIESGO': { bg: 'bg-orange-100', text: 'text-orange-800' },
        'EN_RACHA': { bg: 'bg-lime-100', text: 'text-lime-800' },
        'CAPITÁN': { bg: 'bg-amber-100', text: 'text-amber-800' },
        'ARIETE': { bg: 'bg-purple-100', text: 'text-purple-800' },
        'DIFERENCIAL': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        'APUESTA': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
        'HIGH_RISK': { bg: 'bg-red-200', text: 'text-red-900' },
        'SAFE_PICK': { bg: 'bg-green-200', text: 'text-green-900' },
        'VALUE_PICK': { bg: 'bg-teal-100', text: 'text-teal-800' },
    };
    return map[label] || { bg: 'bg-gray-100', text: 'text-gray-800' };
}

export function recommendationDisplay(rec: Recommendation): { emoji: string; label: string; color: string } {
    const map: Record<Recommendation, { emoji: string; label: string; color: string }> = {
        'vender': { emoji: '📤', label: 'Vender', color: 'text-red-600' },
        'mantener': { emoji: '✋', label: 'Mantener', color: 'text-gray-600' },
        'alinear': { emoji: '⚡', label: 'Alinear', color: 'text-green-600' },
        'banquillo': { emoji: '💺', label: 'Banquillo', color: 'text-yellow-600' },
        'inversión': { emoji: '📈', label: 'Inversión', color: 'text-blue-600' },
        'clausular': { emoji: '🔒', label: 'Clausular', color: 'text-purple-600' },
        'transferible': { emoji: '🔄', label: 'Transferible', color: 'text-orange-600' },
    };
    return map[rec] || map['mantener'];
}

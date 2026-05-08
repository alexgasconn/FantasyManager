import { useEffect, useState, useCallback, useRef } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { PlayerData, Posicion } from '../types/fantasy';
import { scrapePlantilla } from '../lib/scraper/futbolfantasy';
import { apiUrl, readJsonOrThrow } from '../lib/api';

const POS_MAP: Record<number, Posicion> = { 1: 'Portero', 2: 'Defensa', 3: 'Mediocampista', 4: 'Delantero' };

export function useBiwengerData() {
    const { biwengerAuth, miEquipo, addJugador, clearEquipo, setPresupuesto, setEquipoData } = useFantasyStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedForTokenRef = useRef<string | null>(null);

    const loadBiwengerTeam = useCallback(async () => {
        if (!biwengerAuth?.token || !biwengerAuth.league?.id) return;

        setLoading(true);
        setError(null);

        try {
            const headers = {
                'Authorization': `Bearer ${biwengerAuth.token}`,
                'X-League': String(biwengerAuth.league.id),
                'X-User': String(biwengerAuth.user.id),
            };

            // 1. Load user's players (IDs + ownership info)
            const [userRes, catalogRes] = await Promise.all([
                fetch(apiUrl('/api/biwenger/user'), { headers }),
                fetch(apiUrl('/api/biwenger/catalog')),
            ]);

            if (!userRes.ok) throw new Error(`Error cargando jugadores: ${userRes.status}`);
            if (!catalogRes.ok) throw new Error(`Error cargando catálogo: ${catalogRes.status}`);

            const userData = await readJsonOrThrow<any>(userRes, 'Biwenger user');
            const catalogData = await readJsonOrThrow<any>(catalogRes, 'Biwenger catalog');

            const myPlayerEntries = userData.data?.players || [];
            const catalogPlayers = catalogData.data?.players || {};
            const catalogTeams = catalogData.data?.teams || {};

            // Build team slug lookup
            const teamSlugById: Record<number, string> = {};
            for (const [tid, team] of Object.entries(catalogTeams) as [string, any][]) {
                teamSlugById[Number(tid)] = team.slug;
            }

            // 2. Collect FutbolFantasy team slugs (Biwenger and FF use the same slugs)
            const teamSlugsNeeded = new Set<string>();
            for (const entry of myPlayerEntries) {
                const catPlayer = catalogPlayers[String(entry.id)];
                if (catPlayer?.teamID) {
                    const slug = teamSlugById[catPlayer.teamID];
                    if (slug) teamSlugsNeeded.add(slug);
                }
            }

            // 3. Scrape all needed teams in parallel (with limit)
            const ffCache: Record<string, PlayerData[]> = {};
            const slugArr = Array.from(teamSlugsNeeded);
            for (let i = 0; i < slugArr.length; i += 3) {
                const batch = slugArr.slice(i, i + 3);
                const results = await Promise.allSettled(
                    batch.map(async slug => {
                        const data = await scrapePlantilla(slug);
                        ffCache[slug] = data;
                    })
                );
                results.forEach((r, idx) => {
                    if (r.status === 'rejected') console.warn(`Failed to scrape ${batch[idx]}:`, r.reason);
                });
            }

            // 4. Build enriched player list
            clearEquipo();
            const allPlayers: PlayerData[] = [];

            for (const entry of myPlayerEntries) {
                const catPlayer = catalogPlayers[String(entry.id)];
                if (!catPlayer) continue;

                const bSlug = teamSlugById[catPlayer.teamID] || '';
                const ffTeam = ffCache[bSlug] || [];

                // Try to match with FutbolFantasy data
                const normalized = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                const ffMatch = ffTeam.find(p =>
                    normalized(p.nombre).includes(normalized(catPlayer.name)) ||
                    normalized(catPlayer.name).includes(normalized(p.nombre))
                );

                const posicion = POS_MAP[catPlayer.position] || 'Delantero';

                // If we found FutbolFantasy enrichment, use it; otherwise build from Biwenger data
                const player: PlayerData = ffMatch ? {
                    ...ffMatch,
                    equipoSlug: ffMatch.equipoSlug || bSlug,
                    equipo: ffMatch.equipo || catalogTeams[String(catPlayer.teamID)]?.name || bSlug,
                    // Override with Biwenger-specific data
                    fantasy: {
                        ...ffMatch.fantasy,
                        biwenger: {
                            media: catPlayer.points / Math.max(catPlayer.playedHome + catPlayer.playedAway, 1),
                            total: catPlayer.points,
                            valor: entry.owner?.price || catPlayer.price,
                            diff: catPlayer.priceIncrement || 0,
                        },
                    },
                } : {
                    nombre: catPlayer.name,
                    url: `/player/${catPlayer.slug}`,
                    equipoSlug: bSlug,
                    equipo: catalogTeams[String(catPlayer.teamID)]?.name || bSlug,
                    posicion,
                    edad: 0,
                    nacionalidad: '',
                    pie: '',
                    probabilidad: '100',
                    probabilidadVal: 100,
                    status: catPlayer.status === 'ok' ? 'disponible' : catPlayer.status === 'injured' ? 'lesionado' : 'disponible',
                    diasLesion: 0,
                    jerarquia: 'Titular habitual',
                    forma: 'estable',
                    formaValue: 3,
                    rival: '',
                    rivalDificultad: 3,
                    localVisitante: 'local',
                    stats: {
                        partidos: catPlayer.playedHome + catPlayer.playedAway,
                        partidosSuplente: 0, vecessustituido: 0,
                        minutos: (catPlayer.playedHome + catPlayer.playedAway) * 80,
                        goles: 0, asistencias: 0, amarillas: 0, rojas: 0,
                        picas: 0, picasPartido: 0, estrellas: 0, estrellasPartido: 0,
                    },
                    fantasy: {
                        laliga: { media: 0, total: 0, valor: catPlayer.fantasyPrice || 0, diff: 0 },
                        comunio: { media: 0, total: 0, valor: 0, diff: 0 },
                        biwenger: {
                            media: catPlayer.points / Math.max(catPlayer.playedHome + catPlayer.playedAway, 1),
                            total: catPlayer.points,
                            valor: entry.owner?.price || catPlayer.price,
                            diff: catPlayer.priceIncrement || 0,
                        },
                        futmondo: { media: 0, total: 0, valor: 0, diff: 0 },
                        mister: { media: 0, total: 0, valor: 0, diff: 0 },
                        picas: { media: 0, total: 0 },
                        rpg: { media: 0, total: 0 },
                    },
                };

                addJugador(player);
                allPlayers.push(player);
            }

            // Also store in equiposCache for sections that read from there
            setEquipoData('biwenger', allPlayers);
            setPresupuesto(biwengerAuth.user.balance || 100_000_000);

            console.log(`Loaded ${allPlayers.length} players (${Object.keys(ffCache).length} teams scraped from FutbolFantasy)`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            console.error('Error loading Biwenger team:', err);
        } finally {
            setLoading(false);
        }
    }, [biwengerAuth, addJugador, clearEquipo, setPresupuesto, setEquipoData]);

    useEffect(() => {
        if (biwengerAuth?.token && biwengerAuth.league?.id && loadedForTokenRef.current !== biwengerAuth.token) {
            loadedForTokenRef.current = biwengerAuth.token;
            loadBiwengerTeam();
        }
    }, [biwengerAuth, loadBiwengerTeam]);

    return { loading, error, refresh: loadBiwengerTeam };
}

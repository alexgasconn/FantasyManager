import * as cheerio from 'cheerio';
import { PlayerData, Posicion, Status, Forma } from '../../types/fantasy';

const formaMap: Record<string, Forma> = {
    'arrow-1': 'muy_bajando',
    'arrow-2': 'bajando',
    'arrow-3': 'estable',
    'arrow-4': 'subiendo',
    'arrow-5': 'muy_subiendo',
};

const jerarquiaMap: Record<string, string> = {
    '10': 'Indiscutible',
    '20': 'Titular habitual',
    '30': 'Rotación alta',
    '40': 'Importante',
    '50': 'Suplente',
    '60': 'Marginal',
    '70': 'Reserva',
};

export async function scrapePlantilla(equipo: string): Promise<PlayerData[]> {
    // Use server proxy to avoid CORS issues
    const url = `/api/scrape/equipo/${equipo}`;

    try {
        const res = await fetch(url);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);
        const players: PlayerData[] = [];
        const seen = new Set<string>();

        $('a[data-probabilidad]').each((_, el) => {
            const a = $(el);
            const href = a.attr('href') || '';
            if (!href.includes('/jugadores/')) return;

            const img = a.find('img[alt]').first();
            const nombre = img.attr('alt') || '';
            if (!nombre || seen.has(nombre)) return;
            seen.add(nombre);

            const parentDiv = a.closest('div[class*="jugador_"]');
            const posicionStr = parentDiv.attr('data-posicion') || 'Delantero';
            const posicion = posicionStr as Posicion;

            const get = (attr: string) => a.attr(attr) || '';

            const probStr = get('data-probabilidad');
            const probVal = parseInt(probStr) || 0;

            const lesion = get('data-lesion');
            const sancionado = get('data-sancionado');
            const apercibido = get('data-apercibido');

            let status: Status = 'disponible';
            if (lesion !== '-1' && lesion !== '' && parseInt(lesion) > 0) status = 'lesionado';
            else if (sancionado !== '0' && sancionado !== '') status = 'sancionado';
            else if (apercibido !== '0' && apercibido !== '') status = 'apercibido';

            players.push({
                nombre,
                url: href,
                posicion,
                edad: parseInt(get('data-edad')) || 0,
                nacionalidad: get('data-nacionalidad'),
                pie: get('data-pie'),
                probabilidad: probStr,
                probabilidadVal: probVal,
                status,
                diasLesion: lesion !== '-1' ? parseInt(lesion) || 0 : 0,
                jerarquia: jerarquiaMap[get('data-jerarquia')] || 'Reserva',
                forma: formaMap[get('data-forma')] || 'estable',
                formaValue: parseFloat(get('data-forma_value')) || 1,
                rival: get('data-rival'),
                rivalDificultad: parseInt(get('data-rival_dif_index')) || 3,
                localVisitante: get('data-locvis') === '🏠' ? 'local' : 'visitante',
                stats: {
                    partidos: parseInt(get('data-totalpartidosjugados')) || 0,
                    partidosSuplente: parseInt(get('data-totalpartidosjugadossuplente')) || 0,
                    vecessustituido: parseInt(get('data-totalpartidossustituido')) || 0,
                    minutos: parseInt(get('data-totalminutosjugados')) || 0,
                    goles: parseInt(get('data-totalgoles')) || 0,
                    asistencias: parseInt(get('data-totalasistencias')) || 0,
                    amarillas: parseInt(get('data-totalamarillas')) || 0,
                    rojas: parseInt(get('data-totalrojas')) || 0,
                    picas: parseInt(get('data-totalpicas')) || 0,
                    picasPartido: parseFloat(get('data-totalpicaspartido')) || 0,
                    estrellas: parseInt(get('data-totalestrellas')) || 0,
                    estrellasPartido: parseFloat(get('data-totalestrellaspartido')) || 0,
                },
                fantasy: {
                    laliga: {
                        media: parseFloat(get('data-puntos-media-laliga-fantasy')) || 0,
                        total: parseInt(get('data-puntos-totales-laliga-fantasy')) || 0,
                        valor: parseInt(get('data-valor-laliga-fantasy')) || 0,
                        diff: parseInt(get('data-valor-diff-laliga-fantasy')) || 0,
                    },
                    comunio: {
                        media: parseFloat(get('data-puntos-media-comunio')) || 0,
                        total: parseInt(get('data-puntos-totales-comunio')) || 0,
                        valor: parseInt(get('data-valor-comunio')) || 0,
                        diff: parseInt(get('data-valor-diff-comunio')) || 0,
                    },
                    biwenger: {
                        media: parseFloat(get('data-puntos-media-biwenger-sofascore')) || 0,
                        total: parseInt(get('data-puntos-totales-biwenger-sofascore')) || 0,
                        valor: parseInt(get('data-valor-biwenger')) || 0,
                        diff: parseInt(get('data-valor-diff-biwenger')) || 0,
                    },
                    futmondo: {
                        media: parseFloat(get('data-puntos-media-futmondo-mixto')) || 0,
                        total: parseFloat(get('data-puntos-totales-futmondo-mixto')) || 0,
                        valor: parseInt(get('data-valor-futmondo')) || 0,
                        diff: parseInt(get('data-valor-diff-futmondo')) || 0,
                    },
                    mister: {
                        media: parseFloat(get('data-puntos-media-mister-mixto')) || 0,
                        total: parseInt(get('data-puntos-totales-mister-mixto')) || 0,
                        valor: parseInt(get('data-valor-mister')) || 0,
                        diff: parseInt(get('data-valor-diff-mister')) || 0,
                    },
                    picas: {
                        media: parseFloat(get('data-puntos-media-modo-picas')) || 0,
                        total: parseInt(get('data-puntos-totales-modo-picas')) || 0,
                    },
                    rpg: {
                        media: parseFloat(get('data-puntos-media-futbolfantasy-rpg')) || 0,
                        total: parseInt(get('data-puntos-totales-futbolfantasy-rpg')) || 0,
                    },
                },
            });
        });

        return players;
    } catch (error) {
        console.error('Error scraping:', error);
        throw error;
    }
}

import { handleOptions, setCors } from '../../_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const slug = typeof req.query.slug === 'string' ? req.query.slug : Array.isArray(req.query.slug) ? req.query.slug[0] : '';
    if (!slug) {
        return res.status(400).json({ error: 'Missing team slug' });
    }

    try {
        const url = `https://www.futbolfantasy.com/laliga/equipos/${slug}`;
        const upstream = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
        });

        if (!upstream.ok) {
            const details = await upstream.text();
            return res.status(upstream.status).json({ error: `FutbolFantasy returned ${upstream.status}`, details: details.slice(0, 200) });
        }

        const html = await upstream.text();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        return res.status(500).json({ error: 'Scraping failed', details: error instanceof Error ? error.message : String(error) });
    }
}

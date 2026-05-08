import { handleOptions, setCors } from './_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const dateStr = date.toISOString().split('T')[0];

        const upstream = await fetch(`http://api.clubelo.com/${dateStr}`);
        const csv = await upstream.text();

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(upstream.status).send(csv);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Error', details: error instanceof Error ? error.message : String(error) });
    }
}

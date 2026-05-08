import { forwardJson, handleOptions, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const upstream = await fetch('https://biwenger.as.com/api/v2/account', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
        });

        return await forwardJson(res, upstream, 'Biwenger account');
    } catch (error) {
        return res.status(500).json({ error: 'Internal Error', details: error instanceof Error ? error.message : String(error) });
    }
}

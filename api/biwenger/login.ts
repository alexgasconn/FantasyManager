import { forwardJson, handleOptions, readBody, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = await readBody(req);
        const upstream = await fetch('https://biwenger.as.com/api/v2/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        return await forwardJson(res, upstream, 'Biwenger login');
    } catch (error) {
        return res.status(500).json({ error: 'Internal Error', details: error instanceof Error ? error.message : String(error) });
    }
}

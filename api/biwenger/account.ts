import { handleOptions, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    // Set headers first
    setCors(res);
    res.setHeader('Content-Type', 'application/json');
    
    // Handle OPTIONS
    if (handleOptions(req, res)) return;

    // Only GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                userMessage: 'Se requiere autenticación'
            });
        }

        const upstream = await fetch('https://biwenger.as.com/api/v2/account', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
        });

        const text = await upstream.text();
        
        if (!text) {
            return res.status(upstream.status).json({
                error: 'Empty response from Biwenger',
                status: upstream.status,
            });
        }

        try {
            const data = JSON.parse(text);
            return res.status(upstream.status).json(data);
        } catch {
            return res.status(upstream.status || 502).json({
                error: 'Invalid JSON response from Biwenger',
                status: upstream.status,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

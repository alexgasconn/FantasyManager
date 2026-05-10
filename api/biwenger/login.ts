import { handleOptions, readBody, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    // Set headers first
    setCors(res);
    res.setHeader('Content-Type', 'application/json');
    
    // Handle OPTIONS
    if (handleOptions(req, res)) return;

    // Only POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = await readBody(req);
        const { email, password } = body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing credentials',
                userMessage: 'Email y contraseña son requeridos'
            });
        }

        const upstream = await fetch('https://biwenger.as.com/api/v2/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
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
                details: text.slice(0, 200),
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

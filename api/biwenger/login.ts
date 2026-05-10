import { forwardJson, handleOptions, readBody, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);
    
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = await readBody(req);
        
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

        return await forwardJson(res, upstream, 'Biwenger login');
    } catch (error) {
        console.error('[Login Error]', error);
        return res.status(500).json({ 
            error: 'Internal Error', 
            userMessage: 'Error al conectar con el servidor',
            details: error instanceof Error ? error.message : String(error) 
        });
    }
}

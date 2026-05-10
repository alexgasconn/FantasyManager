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

        console.log('[Login] Attempting auth with email:', email);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const upstream = await fetch('https://biwenger.as.com/api/v2/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'FantasyManager/1.0',
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal,
            });

            clearTimeout(timeout);
            console.log('[Login] Upstream response status:', upstream.status);
            
            return await forwardJson(res, upstream, 'Biwenger login');
        } catch (fetchError) {
            clearTimeout(timeout);
            console.error('[Login] Fetch error:', fetchError);
            
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                return res.status(504).json({
                    error: 'Gateway Timeout',
                    userMessage: 'El servidor tardó demasiado en responder',
                });
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('[Login Error]', error);
        return res.status(500).json({ 
            error: 'Internal Error', 
            userMessage: 'Error al conectar con el servidor',
            details: error instanceof Error ? error.message : String(error) 
        });
    }
}

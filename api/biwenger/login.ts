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
        // Read body
        let email = '';
        let password = '';
        
        try {
            const body = await readBody(req);
            email = body?.email || '';
            password = body?.password || '';
        } catch (bodyError) {
            console.error('[Login] Body read error:', bodyError);
            return res.status(400).json({ 
                error: 'Invalid request body',
                userMessage: 'Request inválido'
            });
        }
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Missing credentials',
                userMessage: 'Email y contraseña son requeridos'
            });
        }

        console.log('[Login] Attempting auth for:', email);

        // Fetch from Biwenger
        let upstream: Response;
        try {
            upstream = await fetch('https://biwenger.as.com/api/v2/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'FantasyManager/1.0',
                },
                body: JSON.stringify({ email, password }),
            });
        } catch (fetchError) {
            console.error('[Login] Fetch error:', fetchError);
            return res.status(503).json({
                error: 'Service unavailable',
                userMessage: 'No se pudo conectar con Biwenger',
                details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
            });
        }

        console.log('[Login] Response status:', upstream.status);

        // Get response text
        let responseText = '';
        try {
            responseText = await upstream.text();
        } catch (textError) {
            console.error('[Login] Text read error:', textError);
            return res.status(502).json({
                error: 'Bad Gateway',
                userMessage: 'Error leyendo respuesta del servidor',
                details: textError instanceof Error ? textError.message : 'Unknown text error'
            });
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('[Login] JSON parse error:', parseError);
            console.error('[Login] Response preview:', responseText.substring(0, 300));
            return res.status(upstream.status || 502).json({
                error: 'Invalid response format',
                userMessage: 'Respuesta inválida del servidor',
                details: responseText.substring(0, 200)
            });
        }

        // Return the response with original status
        return res.status(upstream.status).json(data);

    } catch (error) {
        console.error('[Login] Unhandled error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            userMessage: 'Error interno del servidor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

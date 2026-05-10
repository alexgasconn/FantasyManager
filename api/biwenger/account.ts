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

        // Fetch from Biwenger
        let upstream: Response;
        try {
            upstream = await fetch('https://biwenger.as.com/api/v2/account', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': authHeader,
                    'User-Agent': 'FantasyManager/1.0',
                },
            });
        } catch (fetchError) {
            console.error('[Account] Fetch error:', fetchError);
            return res.status(503).json({
                error: 'Service unavailable',
                userMessage: 'No se pudo conectar con Biwenger',
                details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
            });
        }

        console.log('[Account] Response status:', upstream.status);

        // Get response text
        let responseText = '';
        try {
            responseText = await upstream.text();
        } catch (textError) {
            console.error('[Account] Text read error:', textError);
            return res.status(502).json({
                error: 'Bad Gateway',
                userMessage: 'Error leyendo respuesta del servidor'
            });
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('[Account] JSON parse error:', parseError);
            console.error('[Account] Response preview:', responseText.substring(0, 300));
            return res.status(upstream.status || 502).json({
                error: 'Invalid response format',
                userMessage: 'Respuesta inválida del servidor'
            });
        }

        // Return the response with original status
        return res.status(upstream.status).json(data);

    } catch (error) {
        console.error('[Account] Unhandled error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            userMessage: 'Error interno del servidor',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

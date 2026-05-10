import { forwardJson, handleOptions, setCors } from '../_shared';

export default async function handler(req: any, res: any) {
    if (handleOptions(req, res)) return;
    setCors(res);
    
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');

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

        return await forwardJson(res, upstream, 'Biwenger account');
    } catch (error) {
        console.error('[Account Error]', error);
        return res.status(500).json({ 
            error: 'Internal Error',
            userMessage: 'Error al conectar con el servidor', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
}

export function setCors(res: any) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-League, X-User');
}

export function handleOptions(req: any, res: any): boolean {
    if (req.method === 'OPTIONS') {
        setCors(res);
        res.setHeader('Content-Type', 'application/json');
        res.status(204).end();
        return true;
    }
    return false;
}

export async function readBody(req: any): Promise<any> {
    if (req.body) return req.body;
    let raw = '';
    await new Promise<void>((resolve, reject) => {
        req.on('data', (chunk: Buffer) => {
            raw += chunk.toString();
        });
        req.on('end', () => resolve());
        req.on('error', reject);
    });

    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

// Simple utility to forward responses
export async function forwardJson(res: any, upstream: Response, context: string) {
    try {
        setCors(res);
        res.setHeader('Content-Type', 'application/json');
        
        const text = await upstream.text();
        
        if (!text) {
            return res.status(upstream.status).json({
                error: 'Empty response from upstream',
                status: upstream.status,
            });
        }

        try {
            const data = JSON.parse(text);
            return res.status(upstream.status).json(data);
        } catch (parseError) {
            console.error(`[${context}] Non-JSON response (${upstream.status}):`, text.slice(0, 200));
            return res.status(upstream.status).json({
                error: `${context}: Non-JSON response`,
                userMessage: 'Error de conexión con el servidor',
                status: upstream.status,
                details: text.slice(0, 200),
            });
        }
    } catch (error) {
        console.error(`[${context}] Error forwarding response:`, error);
        return res.status(502).json({
            error: 'Bad Gateway',
            userMessage: 'Error procesando respuesta del servidor',
        });
    }
}

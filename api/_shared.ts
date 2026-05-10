export function setCors(res: any) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-League, X-User');
}

export function handleOptions(req: any, res: any): boolean {
    if (req.method === 'OPTIONS') {
        setCors(res);
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

export async function forwardJson(res: any, upstream: Response, context: string) {
    setCors(res);
    res.setHeader('Content-Type', 'application/json');
    
    const contentType = upstream.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        try {
            const data = await upstream.json();
            return res.status(upstream.status).json(data);
        } catch (error) {
            console.error(`[${context}] Failed to parse upstream JSON`, error);
            return res.status(502).json({
                error: 'Bad Gateway',
                userMessage: 'Error procesando respuesta del servidor',
                details: `${context}: Invalid JSON response`,
            });
        }
    }

    const text = await upstream.text();
    console.error(`[${context}] Non-JSON response (${upstream.status}):`, text.slice(0, 200));
    
    return res.status(upstream.status).json({
        error: `${context}: upstream non-JSON response`,
        userMessage: 'Error de conexión con el servidor',
        status: upstream.status,
        details: text.slice(0, 200),
    });
}

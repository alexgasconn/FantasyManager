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
    try {
        setCors(res);
        res.setHeader('Content-Type', 'application/json');
        
        const contentType = upstream.headers.get('content-type') || '';
        const status = upstream.status;

        console.log(`[${context}] Status: ${status}, Content-Type: ${contentType}`);

        // Try to parse as JSON
        if (contentType.includes('application/json')) {
            try {
                const text = await upstream.text();
                if (!text) {
                    return res.status(status).json({
                        error: 'Empty response from upstream',
                        status: status,
                    });
                }
                const data = JSON.parse(text);
                return res.status(status).json(data);
            } catch (parseError) {
                console.error(`[${context}] JSON parse error:`, parseError);
                return res.status(502).json({
                    error: 'Bad Gateway',
                    userMessage: 'Error procesando respuesta del servidor',
                    details: `${context}: Invalid JSON response`,
                });
            }
        }

        // If not JSON content-type, try to parse as JSON anyway
        try {
            const text = await upstream.text();
            if (!text) {
                return res.status(status).json({
                    error: 'Empty response from upstream',
                    status: status,
                });
            }
            const data = JSON.parse(text);
            return res.status(status).json(data);
        } catch (parseError) {
            // Failed to parse, return error response
            const text = await upstream.text();
            console.error(`[${context}] Non-JSON response (${status}):`, text.slice(0, 200));
            
            return res.status(status).json({
                error: `${context}: upstream non-JSON response`,
                userMessage: 'Error de conexión con el servidor',
                status: status,
                details: text.slice(0, 200),
            });
        }
    } catch (error) {
        console.error(`[${context}] forwardJson error:`, error);
        return res.status(502).json({
            error: 'Bad Gateway',
            userMessage: 'Error procesando respuesta del servidor',
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

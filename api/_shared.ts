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

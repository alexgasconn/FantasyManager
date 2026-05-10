export function apiUrl(path: string): string {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (!base) return path;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readJsonOrThrow<T>(res: Response, context: string): Promise<T> {
    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    try {
        // Try to read as text first to avoid stream issues
        const text = await res.text();
        
        if (!text) {
            throw new Error('Empty response from server');
        }

        // Try to parse as JSON
        try {
            return JSON.parse(text) as T;
        } catch (parseError) {
            // If it's not valid JSON, throw with preview
            const preview = text.slice(0, 200).replace(/\s+/g, ' ').trim();
            throw new Error(`${context}: respuesta no JSON del backend (${status}). ${preview}`);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('respuesta no JSON')) {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`${context}: Error reading response (${status}). ${message}`);
    }
}

export function apiUrl(path: string): string {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (!base) return path;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readJsonOrThrow<T>(res: Response, context: string): Promise<T> {
    try {
        // Always read as text first
        const text = await res.text();
        
        if (!text) {
            throw new Error('Empty response from server');
        }

        // Try to parse as JSON
        try {
            return JSON.parse(text) as T;
        } catch (parseError) {
            // Show what we got instead
            const preview = text.slice(0, 200).replace(/\s+/g, ' ').trim();
            throw new Error(`${context}: respuesta no JSON del backend (${res.status}). ${preview}`);
        }
    } catch (error) {
        // Re-throw if it's already our formatted error
        if (error instanceof Error && error.message.includes('respuesta no JSON')) {
            throw error;
        }
        // Otherwise wrap it
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`${context}: Error reading response (${res.status}). ${message}`);
    }
}

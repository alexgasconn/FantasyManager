export function apiUrl(path: string): string {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (!base) return path;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readJsonOrThrow<T>(res: Response, context: string): Promise<T> {
    const contentType = res.headers.get('content-type') || '';

    // Try to parse as JSON first, regardless of content-type
    if (contentType.includes('application/json') || res.status !== 204) {
        try {
            return (await res.clone().json()) as Promise<T>;
        } catch {
            // If JSON parsing fails, continue to text handling
        }
    }

    // If not JSON or parsing failed, try to handle as text
    const text = await res.text();
    
    // Try to parse the text as JSON as a fallback
    try {
        return JSON.parse(text) as T;
    } catch {
        // If all parsing fails, throw error with preview
        const preview = text.slice(0, 160).replace(/\s+/g, ' ').trim();
        throw new Error(`${context}: respuesta no JSON del backend (${res.status}). ${preview}`);
    }
}

export function apiUrl(path: string): string {
    const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
    if (!base) return path;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readJsonOrThrow<T>(res: Response, context: string): Promise<T> {
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return res.json() as Promise<T>;
    }

    const text = await res.text();
    const preview = text.slice(0, 160).replace(/\s+/g, ' ').trim();
    throw new Error(`${context}: respuesta no JSON del backend (${res.status}). ${preview}`);
}

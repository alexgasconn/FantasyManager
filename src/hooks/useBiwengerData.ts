import { useEffect, useState, useCallback } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { PlayerData } from '../types/fantasy';
import { enrichBiwengerPlayers } from '../lib/scraper/enrichment';

export function useBiwengerData() {
    const { biwengerAuth, miEquipo, setEquipoData, setPresupuesto } = useFantasyStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBiwengerTeam = useCallback(async () => {
        if (!biwengerAuth?.token) {
            setError('No hay sesión activa');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Obtener datos de la cuenta
            const accountRes = await fetch('/api/biwenger/account', {
                headers: { 'Authorization': biwengerAuth.token },
            });

            if (!accountRes.ok) throw new Error('Error cargando cuenta');
            const accountData = await accountRes.json();

            // Obtener catálogo de jugadores
            const catalogRes = await fetch('/api/biwenger/catalog');
            if (!catalogRes.ok) throw new Error('Error cargando catálogo');
            const catalogData = await catalogRes.json();

            // Enriquecer jugadores con datos de FutbolFantasy
            const playerMap = new Map<number, PlayerData>();

            if (accountData.players && Array.isArray(accountData.players)) {
                const enrichedMap = await enrichBiwengerPlayers(accountData.players);
                enrichedMap.forEach((value, key) => playerMap.set(key, value));
            }

            // Convertir a array y actualizar store
            const enrichedPlayers = Array.from(playerMap.values());
            setEquipoData('biwenger', enrichedPlayers);

            // Calcular presupuesto
            if (accountData.budget !== undefined) {
                setPresupuesto(accountData.budget);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            console.error('Error loading Biwenger team:', err);
        } finally {
            setLoading(false);
        }
    }, [biwengerAuth, setEquipoData, setPresupuesto]);

    useEffect(() => {
        if (biwengerAuth?.token && miEquipo.length === 0) {
            loadBiwengerTeam();
        }
    }, [biwengerAuth, miEquipo.length, loadBiwengerTeam]);

    return { loading, error, refresh: loadBiwengerTeam };
}

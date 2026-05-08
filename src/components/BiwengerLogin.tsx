import React, { useState } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';

export function BiwengerLogin() {
    const { setBiwengerAuth, setPlataforma } = useFantasyStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Login to get token
            const loginRes = await fetch('/api/biwenger/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) {
                throw new Error(loginData.userMessage || loginData.message || 'Email o contraseña incorrectos');
            }
            const token = loginData.token;
            if (!token) throw new Error('No se recibió token');

            // 2. Get account data to find league + user IDs
            const acctRes = await fetch('/api/biwenger/account', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const acctData = await acctRes.json();
            if (!acctRes.ok || !acctData.data?.leagues?.length) {
                throw new Error('No se encontraron ligas en tu cuenta');
            }

            const league = acctData.data.leagues[0];
            const leagueUser = league.user;

            setBiwengerAuth({
                token,
                user: {
                    id: leagueUser.id,
                    name: leagueUser.name,
                    balance: leagueUser.balance,
                    points: leagueUser.points,
                },
                league: {
                    id: league.id,
                    name: league.name,
                },
            });
            setPlataforma('biwenger');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">⚽ Fantasy Manager</h1>
                    <p className="text-gray-600">Powered by Biwenger</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-gray-600 mb-3">
                        Conecta con tu cuenta de Biwenger para acceder a tu equipo real
                    </p>
                    <p className="text-xs text-gray-500">
                        Tu información es segura. Solo se usa para cargar tus datos.
                    </p>
                </div>
            </Card>
        </div>
    );
}

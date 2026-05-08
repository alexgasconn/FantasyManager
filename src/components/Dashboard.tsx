import { useEquipoData } from '../hooks/useEquipoData';
import { useFantasyStore } from '../store/fantasyStore';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Dashboard() {
    const { miEquipo, plataformaActiva, presupuestoTotal } = useFantasyStore();
    const { jugadores, loading } = useEquipoData('barcelona');

    const valorEquipo = miEquipo.reduce((acc, j) => acc + j.fantasy[plataformaActiva].valor, 0);
    const mediaEquipo = miEquipo.length > 0 ? miEquipo.reduce((acc, j) => acc + j.fantasy[plataformaActiva].media, 0) / miEquipo.length : 0;
    const presupuestoRestante = presupuestoTotal - valorEquipo;

    const topPlayers = jugadores
        .slice()
        .sort((a, b) => b.fantasy[plataformaActiva].media - a.fantasy[plataformaActiva].media)
        .slice(0, 5)
        .map(j => ({
            nombre: j.nombre.substring(0, 10),
            media: j.fantasy[plataformaActiva].media,
        }));

    const estadisticas = [
        { label: 'Mi Equipo', value: miEquipo.length, max: 15 },
        { label: 'Valor Total', value: Math.round(valorEquipo / 1_000_000), max: Math.round(presupuestoTotal / 1_000_000) },
        { label: 'Media Equipo', value: Number(mediaEquipo.toFixed(2)), max: 10 },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Dashboard Principal</h1>
                <p className="text-gray-600">Bienvenido a Fantasy Manager - Gestiona tu equipo de Fantasy Fútbol</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Jugadores</h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold">{miEquipo.length}</p>
                        <p className="text-sm text-gray-600">/15</p>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(miEquipo.length / 15) * 100}%` }}
                        ></div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Valor Equipo</h3>
                    <p className="text-3xl font-bold">{(valorEquipo / 1_000_000).toFixed(1)}M</p>
                    <p className="text-xs text-gray-600 mt-2">
                        Presupuesto: {(presupuestoRestante / 1_000_000).toFixed(1)}M restantes
                    </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Media Equipo</h3>
                    <p className="text-3xl font-bold">{mediaEquipo.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">Puntos promedio por jugador</p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Próxima Jornada</h3>
                    <p className="text-3xl font-bold">J35</p>
                    <p className="text-xs text-gray-600 mt-2">Estado del campeonato</p>
                </Card>
            </div>

            {/* Top Players */}
            {!loading && (
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Top 5 Mejores Medias</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topPlayers}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="media" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Quick Links */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Button className="justify-start h-auto py-3" variant="outline">
                        <span className="text-2xl mr-3">📊</span>
                        <div className="text-left">
                            <p className="font-semibold">Ver Mi Equipo</p>
                            <p className="text-xs text-gray-500">Gestiona tu plantilla</p>
                        </div>
                    </Button>

                    <Button className="justify-start h-auto py-3" variant="outline">
                        <span className="text-2xl mr-3">🔄</span>
                        <div className="text-left">
                            <p className="font-semibold">Explorar Mercado</p>
                            <p className="text-xs text-gray-500">Busca nuevos jugadores</p>
                        </div>
                    </Button>

                    <Button className="justify-start h-auto py-3" variant="outline">
                        <span className="text-2xl mr-3">📈</span>
                        <div className="text-left">
                            <p className="font-semibold">Ver Estadísticas</p>
                            <p className="text-xs text-gray-500">Analiza tu rendimiento</p>
                        </div>
                    </Button>
                </div>
            </Card>

            {/* Alertas */}
            {miEquipo.some(j => j.probabilidadVal < 50) && (
                <Card className="p-4 border-yellow-300 border-2 bg-yellow-50">
                    <p className="font-semibold text-yellow-800">
                        ⚠️ {miEquipo.filter(j => j.probabilidadVal < 50).length} jugadores con baja probabilidad de jugar
                    </p>
                </Card>
            )}

            {miEquipo.some(j => j.status !== 'disponible') && (
                <Card className="p-4 border-red-300 border-2 bg-red-50">
                    <p className="font-semibold text-red-800">
                        🏥 {miEquipo.filter(j => j.status !== 'disponible').length} jugadores con problemas físicos
                    </p>
                </Card>
            )}
        </div>
    );
}

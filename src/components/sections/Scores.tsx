import { useFantasyStore } from '../../store/fantasyStore';
import { Card } from '../../../components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Scores() {
    const { miEquipo, plataformaActiva } = useFantasyStore();

    // Datos simulados de jornadas
    const jornadas = Array.from({ length: 10 }, (_, i) => ({
        jornada: `J${i + 1}`,
        miteam: Math.floor(Math.random() * 50) + 30,
        media: Math.floor(Math.random() * 40) + 35,
    }));

    const totalPorJugador = miEquipo.map(player => ({
        nombre: player.nombre.substring(0, 10),
        total: player.fantasy[plataformaActiva].total,
        media: player.fantasy[plataformaActiva].media,
        partidos: player.stats.partidos,
    }));

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Scores y Puntuaciones</h1>

            {/* Tabla de jugadores */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Resumen por Jugador</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">Jugador</th>
                                <th className="px-4 py-2 text-center font-semibold">Partidos</th>
                                <th className="px-4 py-2 text-center font-semibold">Total</th>
                                <th className="px-4 py-2 text-center font-semibold">Media</th>
                                <th className="px-4 py-2 text-center font-semibold">Mejor J.</th>
                                <th className="px-4 py-2 text-center font-semibold">Peor J.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {totalPorJugador.map(j => (
                                <tr key={j.nombre} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{j.nombre}</td>
                                    <td className="px-4 py-2 text-center">{j.partidos}</td>
                                    <td className="px-4 py-2 text-center font-bold">{j.total}</td>
                                    <td className="px-4 py-2 text-center font-bold text-blue-600">{j.media.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center text-green-600">15</td>
                                    <td className="px-4 py-2 text-center text-red-600">2</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Gráficos */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Puntos por Jornada</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={jornadas}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="jornada" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="miteam" fill="#3b82f6" name="Mi Equipo" />
                            <Bar dataKey="media" fill="#9ca3af" name="Media Liga" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Evolución Histórica</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={jornadas}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="jornada" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="miteam" stroke="#3b82f6" name="Mi Equipo" />
                            <Line type="monotone" dataKey="media" stroke="#9ca3af" name="Media Liga" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Leyenda */}
            <Card className="p-6 bg-gradient-to-r from-red-50 to-green-50">
                <h3 className="font-bold mb-3">Código de Colores por Puntuación</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">&lt; 4 pts (Mala)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm">4-6 pts (Normal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">&gt; 6 pts (Buena)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm">&gt; 10 pts (Premium)</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

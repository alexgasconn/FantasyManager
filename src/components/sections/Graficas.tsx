import { useFantasyStore } from '../../store/fantasyStore';
import { Card } from '../../../components/ui/card';
import {
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function Graficas() {
    const { miEquipo, equiposCache, equipoSeleccionado, plataformaActiva } = useFantasyStore();

    const jugadores = equiposCache[equipoSeleccionado]?.data || [];

    // Top 10 performers
    const top10 = jugadores
        .slice()
        .sort((a, b) => b.fantasy[plataformaActiva].media - a.fantasy[plataformaActiva].media)
        .slice(0, 10)
        .map(j => ({
            nombre: j.nombre.substring(0, 8),
            media: j.fantasy[plataformaActiva].media,
            color: j.forma === 'muy_subiendo' ? '#10b981' : j.forma === 'muy_bajando' ? '#ef4444' : '#8b5cf6',
        }));

    // Distribución por posición
    const distPosicion = [
        { name: 'Portero', value: miEquipo.filter(j => j.posicion === 'Portero').length },
        { name: 'Defensa', value: miEquipo.filter(j => j.posicion === 'Defensa').length },
        { name: 'Mediocampista', value: miEquipo.filter(j => j.posicion === 'Mediocampista').length },
        { name: 'Delantero', value: miEquipo.filter(j => j.posicion === 'Delantero').length },
    ].filter(x => x.value > 0);

    // Distribución por jerarquía
    const distJerarquia = [
        { name: 'Indiscutibles', value: miEquipo.filter(j => j.jerarquia === 'Indiscutible').length },
        { name: 'Titulares', value: miEquipo.filter(j => j.jerarquia === 'Titular habitual').length },
        { name: 'Rotación', value: miEquipo.filter(j => j.jerarquia === 'Rotación alta').length },
        { name: 'Suplentes', value: miEquipo.filter(j => j.jerarquia === 'Suplente').length },
    ].filter(x => x.value > 0);

    // Distribución por probabilidad
    const distProb = [
        { name: '>80%', value: miEquipo.filter(j => j.probabilidadVal > 80).length },
        { name: '60-80%', value: miEquipo.filter(j => j.probabilidadVal >= 60 && j.probabilidadVal <= 80).length },
        { name: '<60%', value: miEquipo.filter(j => j.probabilidadVal < 60).length },
    ].filter(x => x.value > 0);

    // Comparativa de 2 jugadores (simulado)
    const comp2 = miEquipo.slice(0, 2).map(j => ({
        stat: j.nombre.substring(0, 6),
        goles: j.stats.goles,
        asistencias: j.stats.asistencias,
        minutos: j.stats.minutos / 100,
        media: j.fantasy[plataformaActiva].media * 10,
    }));

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Estadísticas y Análisis</h1>

            {/* Top performers */}
            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Top 10 Mejores Medias</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={top10}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="media" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Distribuciones */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-center">Distribución por Posición</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={distPosicion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {distPosicion.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-center">Distribución por Jerarquía</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={distJerarquia} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {distJerarquia.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 text-center">Distribución por Probabilidad</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={distProb} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {distProb.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Radar comparativa */}
            {comp2.length >= 2 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Comparativa de Jugadores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={comp2}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="stat" />
                            <PolarRadiusAxis />
                            <Radar name="Jugador 1" dataKey="goles" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Radar name="Jugador 2" dataKey="asistencias" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                            <Legend />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
            )}
        </div>
    );
}

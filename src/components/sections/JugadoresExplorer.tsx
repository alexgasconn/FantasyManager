import { useState } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { fmtValor, probColor, getStatusBadge, formaDisplay } from '../../lib/utils/fantasy';
import { EQUIPOS_LALIGA } from '../../data/equipos';

export function Jugadores() {
    const { equipoSeleccionado, setEquipoSeleccionado, plataformaActiva, addJugador, isFavorito, toggleFavorito } = useFantasyStore();
    const { jugadores, loading } = useEquipoData(equipoSeleccionado);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroPos, setFiltroPos] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const filtered = jugadores
        .filter(j => j.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(j => !filtroPos || j.posicion === filtroPos);

    if (loading) {
        return (
            <div className="p-6">
                <p>Cargando jugadores...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Plantilla - {equipoSeleccionado}</h1>

            {/* Filtros */}
            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <label className="text-sm font-medium">Equipo</label>
                        <select
                            value={equipoSeleccionado}
                            onChange={e => setEquipoSeleccionado(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        >
                            {EQUIPOS_LALIGA.map(eq => (
                                <option key={eq.slug} value={eq.slug}>
                                    {eq.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Buscar</label>
                        <Input placeholder="Nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-1" />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Posición</label>
                        <select value={filtroPos} onChange={e => setFiltroPos(e.target.value)} className="w-full mt-1 p-2 border rounded">
                            <option value="">Todas</option>
                            <option value="Portero">Portero</option>
                            <option value="Defensa">Defensa</option>
                            <option value="Mediocampista">Mediocampista</option>
                            <option value="Delantero">Delantero</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')} variant="outline" className="flex-1">
                            {viewMode === 'grid' ? '📊 Tabla' : '🔲 Grid'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Vista Grid */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {filtered.map(player => {
                        const { icon } = getStatusBadge(player.status, player.diasLesion);
                        const { emoji } = formaDisplay(player.forma);
                        const esFavorito = isFavorito(player.nombre);

                        return (
                            <Card key={player.nombre} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                                {/* Avatar */}
                                <div className={`aspect-square rounded-lg mb-3 flex items-center justify-center text-white text-3xl font-bold ${probColor(player.probabilidadVal)}`}>
                                    {player.nombre.charAt(0)}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-1">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm truncate">{player.nombre}</h3>
                                            <p className="text-xs text-gray-500">{player.posicion}</p>
                                        </div>
                                        <Button
                                            onClick={() => toggleFavorito(player.nombre)}
                                            variant="ghost"
                                            size="sm"
                                            className="p-0"
                                        >
                                            {esFavorito ? '❤️' : '🤍'}
                                        </Button>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex gap-1 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {player.probabilidad}
                                        </Badge>
                                        {player.status !== 'disponible' && <Badge variant="destructive" className="text-xs">{icon}</Badge>}
                                    </div>

                                    {/* Stats */}
                                    <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                                        <div className="flex justify-between">
                                            <span>Media:</span>
                                            <strong>{player.fantasy[plataformaActiva].media.toFixed(2)}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Valor:</span>
                                            <strong>{fmtValor(player.fantasy[plataformaActiva].valor)}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>G/A:</span>
                                            <strong>{player.stats.goles}/{player.stats.asistencias}</strong>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="space-y-2 pt-2">
                                        <div className="text-xs text-center">
                                            {emoji} Forma: {player.forma}
                                        </div>
                                        <Button onClick={() => addJugador(player)} size="sm" className="w-full">
                                            Añadir
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Vista Tabla */}
            {viewMode === 'table' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Jugador</th>
                                <th className="px-4 py-2 text-left">Pos</th>
                                <th className="px-4 py-2 text-center">Prob%</th>
                                <th className="px-4 py-2 text-center">Jer.</th>
                                <th className="px-4 py-2 text-center">Media</th>
                                <th className="px-4 py-2 text-center">Valor</th>
                                <th className="px-4 py-2 text-center">G/A/M</th>
                                <th className="px-4 py-2 text-center">Forma</th>
                                <th className="px-4 py-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map(player => {
                                const { icon } = getStatusBadge(player.status, player.diasLesion);
                                const { emoji } = formaDisplay(player.forma);

                                return (
                                    <tr key={player.nombre} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium">{player.nombre}</td>
                                        <td className="px-4 py-2 text-sm">{player.posicion.substring(0, 3)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${probColor(player.probabilidadVal)}`}>
                                                {player.probabilidad}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-xs">{player.jerarquia.substring(0, 10)}</td>
                                        <td className="px-4 py-2 text-center font-bold">{player.fantasy[plataformaActiva].media.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-center">{fmtValor(player.fantasy[plataformaActiva].valor)}</td>
                                        <td className="px-4 py-2 text-center text-sm">
                                            {player.stats.goles}/{player.stats.asistencias}/{Math.round(player.stats.minutos / 90)}
                                        </td>
                                        <td className="px-4 py-2 text-center">{emoji}</td>
                                        <td className="px-4 py-2 text-center">
                                            <Button onClick={() => addJugador(player)} size="sm" variant="outline">
                                                +
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useFantasyStore } from '../../store/fantasyStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { fmtValor, fmtDiff, probColor, formaDisplay } from '../../lib/utils/fantasy';
import { PlayerData } from '../../types/fantasy';

export function Mercado() {
    const { equipoSeleccionado, setEquipoSeleccionado, plataformaActiva, addJugador } = useFantasyStore();
    const { jugadores, loading } = useEquipoData(equipoSeleccionado);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroPos, setFiltroPos] = useState<string>('');
    const [filtroProb, setFiltroProb] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>('nombre');

    const filtered = jugadores
        .filter(j => j.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(j => !filtroPos || j.posicion === filtroPos)
        .filter(j => j.probabilidadVal >= filtroProb)
        .sort((a, b) => {
            switch (sortBy) {
                case 'probabilidad':
                    return b.probabilidadVal - a.probabilidadVal;
                case 'media':
                    return b.fantasy[plataformaActiva].media - a.fantasy[plataformaActiva].media;
                case 'valor':
                    return b.fantasy[plataformaActiva].valor - a.fantasy[plataformaActiva].valor;
                default:
                    return a.nombre.localeCompare(b.nombre);
            }
        });

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Mercado de Fichajes</h1>

            <Card className="p-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Equipo</label>
                        <select
                            value={equipoSeleccionado}
                            onChange={e => setEquipoSeleccionado(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        >
                            <option value="barcelona">Barcelona</option>
                            <option value="real-madrid">Real Madrid</option>
                            <option value="atletico">Atlético Madrid</option>
                            <option value="sevilla">Sevilla</option>
                            <option value="betis">Betis</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium">Buscar</label>
                            <Input
                                placeholder="Nombre del jugador"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
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

                        <div>
                            <label className="text-sm font-medium">Prob. Mín: {filtroProb}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={filtroProb}
                                onChange={e => setFiltroProb(Number(e.target.value))}
                                className="w-full mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Ordenar</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full mt-1 p-2 border rounded">
                                <option value="nombre">Nombre</option>
                                <option value="probabilidad">Probabilidad</option>
                                <option value="media">Media Puntos</option>
                                <option value="valor">Valor Mercado</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {loading ? (
                <Card className="p-8 text-center">
                    <p>Cargando datos...</p>
                </Card>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">Jugador</th>
                                <th className="px-4 py-2 text-left font-semibold">Pos</th>
                                <th className="px-4 py-2 text-left font-semibold">Prob%</th>
                                <th className="px-4 py-2 text-left font-semibold">Jerarquía</th>
                                <th className="px-4 py-2 text-left font-semibold">Media</th>
                                <th className="px-4 py-2 text-left font-semibold">Valor</th>
                                <th className="px-4 py-2 text-left font-semibold">Var.</th>
                                <th className="px-4 py-2 text-left font-semibold">Forma</th>
                                <th className="px-4 py-2 text-left font-semibold">G/A</th>
                                <th className="px-4 py-2 text-left font-semibold">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map(player => {
                                const { text: diffText, color: diffColor } = fmtDiff(player.fantasy[plataformaActiva].diff);
                                const { emoji: formaEmoji } = formaDisplay(player.forma);

                                return (
                                    <tr key={player.nombre} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{player.nombre}</td>
                                        <td className="px-4 py-3">{player.posicion}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full ${probColor(player.probabilidadVal)} flex items-center justify-center text-white text-xs font-bold`}>
                                                    {player.probabilidad}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{player.jerarquia}</td>
                                        <td className="px-4 py-3 font-semibold">{player.fantasy[plataformaActiva].media.toFixed(2)}</td>
                                        <td className="px-4 py-3">{fmtValor(player.fantasy[plataformaActiva].valor)}</td>
                                        <td className={`px-4 py-3 font-bold ${diffColor === 'green' ? 'text-green-600' : diffColor === 'red' ? 'text-red-600' : 'text-gray-600'}`}>
                                            {diffText}
                                        </td>
                                        <td className="px-4 py-3">{formaEmoji}</td>
                                        <td className="px-4 py-3">
                                            {player.stats.goles}/{player.stats.asistencias}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button size="sm" onClick={() => addJugador(player)} variant="outline">
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

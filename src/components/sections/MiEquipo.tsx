import { useFantasyStore } from '../../store/fantasyStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { fmtValor, calcMediaEquipo, calcValorTotal, getStatusBadge } from '../../lib/utils/fantasy';

export function MiEquipo() {
    const { miEquipo, removeJugador, plataformaActiva, setEquipoSeleccionado, presupuestoTotal } = useFantasyStore();
    const { refresh, loading } = useEquipoData('barcelona');

    const valorEquipo = calcValorTotal(miEquipo, plataformaActiva);
    const mediaEquipo = calcMediaEquipo(miEquipo, plataformaActiva);
    const presupuestoRestante = presupuestoTotal - valorEquipo;

    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
                    <p className="text-2xl font-bold">{fmtValor(valorEquipo)}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Media Equipo</h3>
                    <p className="text-2xl font-bold">{mediaEquipo.toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Presupuesto Restante</h3>
                    <p className={`text-2xl font-bold ${presupuestoRestante > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmtValor(Math.abs(presupuestoRestante))}
                    </p>
                </Card>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mi Equipo ({miEquipo.length}/15)</h2>
                <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
                    {loading ? 'Actualizando...' : 'Actualizar datos'}
                </Button>
            </div>

            {miEquipo.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">No hay jugadores en tu equipo. Ve al Mercado para añadir jugadores.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {miEquipo.map(player => {
                        const { icon, color } = getStatusBadge(player.status, player.diasLesion);
                        return (
                            <Card key={player.nombre} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="aspect-square bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg mb-3 flex items-center justify-center text-white text-4xl font-bold">
                                    {player.nombre.charAt(0)}
                                </div>
                                <h3 className="font-semibold text-sm truncate">{player.nombre}</h3>
                                <p className="text-xs text-gray-500">{player.posicion}</p>

                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Prob.</span>
                                        <Badge variant="outline">{player.probabilidad}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Media</span>
                                        <span className="font-bold">{player.fantasy[plataformaActiva].media.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Valor</span>
                                        <span className="font-bold text-sm">{fmtValor(player.fantasy[plataformaActiva].valor)}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t space-y-2">
                                    <div className={`text-xs ${color}`}>{icon} {player.status}</div>
                                    <Button
                                        onClick={() => removeJugador(player.nombre)}
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

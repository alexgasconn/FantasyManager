import { useFantasyStore } from '../../store/fantasyStore';
import { useEquipoData } from '../../hooks/useEquipoData';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { calcOnceProbable, formaDisplay } from '../../lib/utils/fantasy';

export function Predicciones() {
    const { equipoSeleccionado, plataformaActiva } = useFantasyStore();
    const { jugadores } = useEquipoData(equipoSeleccionado);

    const onceProbable = calcOnceProbable(jugadores, '4-3-3');
    const dudosos = jugadores.filter(j => j.probabilidadVal >= 30 && j.probabilidadVal < 60);
    const bajas = jugadores.filter(j => j.probabilidadVal === 0);

    const mejorCapitan = jugadores.reduce((best, player) => {
        const riskScore = player.fantasy[plataformaActiva].media * (player.probabilidadVal / 100);
        const bestScore = best.fantasy[plataformaActiva].media * (best.probabilidadVal / 100);
        return riskScore > bestScore ? player : best;
    });

    const mejorFichaje = jugadores.reduce((best, player) => {
        const ratio = player.fantasy[plataformaActiva].media / (player.fantasy[plataformaActiva].valor || 1);
        const bestRatio = best.fantasy[plataformaActiva].media / (best.fantasy[plataformaActiva].valor || 1);
        return ratio > bestRatio ? player : best;
    });

    const evitar = jugadores.filter(j => j.status === 'apercibido' && j.jerarquia.includes('Titular'));

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Predicciones y Análisis</h1>

            {/* Consejos */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-6 border-l-4 border-l-yellow-500">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">👑</span>
                        <div>
                            <h3 className="font-bold mb-1">Mejor Capitán</h3>
                            <p className="text-sm text-gray-600">{mejorCapitan.nombre}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Media: {mejorCapitan.fantasy[plataformaActiva].media.toFixed(2)} | Prob: {mejorCapitan.probabilidad}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">💎</span>
                        <div>
                            <h3 className="font-bold mb-1">Mejor Fichaje</h3>
                            <p className="text-sm text-gray-600">{mejorFichaje.nombre}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Ratio Media/Valor óptimo
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-500">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">🚫</span>
                        <div>
                            <h3 className="font-bold mb-1">Evitar</h3>
                            <p className="text-sm text-gray-600">{evitar.length} jugadores apercibidos titulares</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Riesgo de sanción
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Once probable */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Once Probable (4-3-3)</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {onceProbable.map(player => {
                        const { emoji } = formaDisplay(player.forma);
                        return (
                            <Card key={player.nombre} className="p-3 bg-gradient-to-br from-blue-50 to-blue-100">
                                <p className="font-semibold text-sm">{player.nombre}</p>
                                <p className="text-xs text-gray-600">{player.posicion}</p>
                                <div className="mt-2 space-y-1 text-xs">
                                    <div>Prob: <strong>{player.probabilidad}</strong></div>
                                    <div>Media: <strong>{player.fantasy[plataformaActiva].media.toFixed(1)}</strong></div>
                                    <div>Forma: {emoji}</div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>

            {/* Dudosos */}
            {dudosos.length > 0 && (
                <Card className="p-6 border-yellow-300 border-2">
                    <h3 className="text-xl font-bold mb-4 text-yellow-700">⚠️ Jugadores Dudosos (30-60% prob.)</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {dudosos.slice(0, 5).map(player => (
                            <div key={player.nombre} className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div>
                                    <p className="font-semibold">{player.nombre}</p>
                                    <p className="text-sm text-gray-600">{player.status} - {player.jerarquia}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">{player.probabilidad}</p>
                                    <p className="text-xs text-gray-500">Rival: {player.rival} ({player.rivalDificultad}/5)</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Bajas confirmadas */}
            {bajas.length > 0 && (
                <Card className="p-6 border-red-300 border-2">
                    <h3 className="text-xl font-bold mb-4 text-red-700">🏥 Bajas Confirmadas (0% prob.)</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {bajas.slice(0, 5).map(player => (
                            <div key={player.nombre} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                                <div>
                                    <p className="font-semibold">{player.nombre}</p>
                                    <p className="text-sm text-gray-600">{player.status}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="destructive">{player.status.toUpperCase()}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

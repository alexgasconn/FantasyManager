import { useFantasyStore } from '../../store/fantasyStore';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { calcOnceProbable, formaDisplay, probColor } from '../../lib/utils/fantasy';

export function Formacion() {
    const { equiposCache, equipoSeleccionado, plataformaActiva } = useFantasyStore();

    const equipoData = equiposCache[equipoSeleccionado];
    const jugadores = equipoData?.data || [];

    const once = calcOnceProbable(jugadores, '4-3-3');

    const posicionesEnCampo: Record<string, { x: number; y: number }[]> = {
        portero: [{ x: 50, y: 88 }],
        defensas: [
            { x: 15, y: 70 },
            { x: 35, y: 70 },
            { x: 65, y: 70 },
            { x: 85, y: 70 },
        ],
        medios: [
            { x: 25, y: 50 },
            { x: 50, y: 50 },
            { x: 75, y: 50 },
        ],
        delanteros: [
            { x: 20, y: 25 },
            { x: 50, y: 20 },
            { x: 80, y: 25 },
        ],
    };

    const porteroDatos = once.find(j => j.posicion === 'Portero');
    const defensorDatos = once.filter(j => j.posicion === 'Defensa');
    const medioDatos = once.filter(j => j.posicion === 'Mediocampista');
    const delanteroDatos = once.filter(j => j.posicion === 'Delantero');

    return (
        <div className="space-y-6 p-6">
            <div className="relative bg-gradient-to-b from-green-600 via-green-500 to-green-700 rounded-lg overflow-hidden aspect-video">
                {/* Campo de futbol */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.3" opacity="0.3" />
                    <rect x="5" y="15" width="90" height="70" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
                    <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.2" opacity="0.3" />
                    <circle cx="50" cy="50" r="0.8" fill="white" opacity="0.5" />
                </svg>

                {/* Portero */}
                {porteroDatos && (
                    <div
                        className="absolute text-center"
                        style={{
                            left: `${posicionesEnCampo.portero[0].x}%`,
                            top: `${posicionesEnCampo.portero[0].y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <JugadorEnCampo player={porteroDatos} plataforma={plataformaActiva} />
                    </div>
                )}

                {/* Defensas */}
                {defensorDatos.map((player, i) => (
                    <div
                        key={player.nombre}
                        className="absolute text-center"
                        style={{
                            left: `${posicionesEnCampo.defensas[i].x}%`,
                            top: `${posicionesEnCampo.defensas[i].y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <JugadorEnCampo player={player} plataforma={plataformaActiva} />
                    </div>
                ))}

                {/* Medios */}
                {medioDatos.map((player, i) => (
                    <div
                        key={player.nombre}
                        className="absolute text-center"
                        style={{
                            left: `${posicionesEnCampo.medios[i].x}%`,
                            top: `${posicionesEnCampo.medios[i].y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <JugadorEnCampo player={player} plataforma={plataformaActiva} />
                    </div>
                ))}

                {/* Delanteros */}
                {delanteroDatos.map((player, i) => (
                    <div
                        key={player.nombre}
                        className="absolute text-center"
                        style={{
                            left: `${posicionesEnCampo.delanteros[i].x}%`,
                            top: `${posicionesEnCampo.delanteros[i].y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <JugadorEnCampo player={player} plataforma={plataformaActiva} />
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold">Formación Probable: 4-3-3</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Información de la Formación</h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-600">Porteros:</span> {porteroDatos ? 1 : 0}/1
                        </div>
                        <div>
                            <span className="text-gray-600">Defensas:</span> {defensorDatos.length}/4
                        </div>
                        <div>
                            <span className="text-gray-600">Medios:</span> {medioDatos.length}/3
                        </div>
                        <div>
                            <span className="text-gray-600">Delanteros:</span> {delanteroDatos.length}/3
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Estadísticas del Once</h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="text-gray-600">Total Jugadores:</span> {once.length}/11
                        </div>
                        <div>
                            <span className="text-gray-600">Media Prob:</span>{' '}
                            {(once.reduce((a, p) => a + p.probabilidadVal, 0) / once.length || 0).toFixed(1)}%
                        </div>
                        <div>
                            <span className="text-gray-600">Media Puntos:</span>{' '}
                            {(
                                once.reduce((a, p) => a + p.fantasy[plataformaActiva].media, 0) / once.length || 0
                            ).toFixed(2)}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function JugadorEnCampo({ player, plataforma }: any) {
    const { emoji } = formaDisplay(player.forma);
    const bg = probColor(player.probabilidadVal);

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {player.nombre.charAt(0)}
            </div>
            <div className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                {player.nombre.substring(0, 8)}
            </div>
            <div className="text-white text-xs">
                {emoji} {player.probabilidad}
            </div>
            <div className="text-white text-xs font-semibold">{player.fantasy[plataforma].media.toFixed(1)}pts</div>
        </div>
    );
}

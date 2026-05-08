import { useFantasyStore } from '../../store/fantasyStore';
import { Card } from '../../../components/ui/card';
import { fixtureScore } from '../../lib/utils/fantasy';

export function ProximosRivales() {
    const { miEquipo } = useFantasyStore();

    const getFixtureScore = (dificultad: number, localVis: 'local' | 'visitante') => {
        return fixtureScore(dificultad, localVis);
    };

    const calcularFixtureFuturo = (jugador: any) => {
        // Simular próximas 5 jornadas
        return Array.from({ length: 5 }, (_, i) => ({
            jornada: i + 1,
            rival: `Rival ${i + 1}`,
            dificultad: Math.floor(Math.random() * 5) + 1,
            local: Math.random() > 0.5 ? 'local' : 'visitante',
        }));
    };

    const rankingPorFixture = miEquipo.map(player => {
        const proximasJornadas = calcularFixtureFuturo(player);
        const mediaFixture = proximasJornadas.reduce((a, j) => a + getFixtureScore(j.dificultad, j.local), 0) / proximasJornadas.length;
        return {
            nombre: player.nombre,
            mediaFixture,
            proximasJornadas,
        };
    }).sort((a, b) => a.mediaFixture - b.mediaFixture);

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Próximos Rivales y Fixture</h1>

            {/* Ranking por Fixture */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Ranking por Calidad de Fixture</h2>
                <div className="space-y-3">
                    {rankingPorFixture.slice(0, 10).map((item, idx) => (
                        <div key={item.nombre} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded border">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-gray-400">#{idx + 1}</span>
                                <div>
                                    <p className="font-semibold">{item.nombre}</p>
                                    <p className="text-xs text-gray-500">Score: {item.mediaFixture.toFixed(1)}/10</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {item.proximasJornadas.slice(0, 3).map((j, i) => (
                                    <div
                                        key={i}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${j.dificultad <= 2 ? 'bg-green-500' : j.dificultad === 3 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                    >
                                        {j.dificultad}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Próximas jornadas detalladas */}
            <div className="grid grid-cols-1 gap-4">
                {miEquipo.slice(0, 5).map(player => {
                    const fixture = calcularFixtureFuturo(player);
                    return (
                        <Card key={player.nombre} className="p-4">
                            <h3 className="font-bold mb-3">{player.nombre}</h3>
                            <div className="flex gap-2 overflow-x-auto">
                                {fixture.map((j, i) => (
                                    <div
                                        key={i}
                                        className={`flex-shrink-0 w-20 p-3 rounded text-center text-white font-bold ${j.dificultad <= 2 ? 'bg-green-500' : j.dificultad === 3 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                    >
                                        <div className="text-xs">J{j.jornada}</div>
                                        <div className="text-lg">{j.dificultad}</div>
                                        <div className="text-xs">{j.local === 'local' ? '🏠' : '✈'}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Leyenda */}
            <Card className="p-4 bg-gradient-to-r from-green-50 via-yellow-50 to-red-50">
                <h3 className="font-bold mb-2">Dificultad de Rivales</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">1-2: Fácil (Verde)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm">3: Normal (Amarillo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">4-5: Difícil (Rojo)</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

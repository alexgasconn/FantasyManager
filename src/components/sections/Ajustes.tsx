import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fmtValor } from '../../lib/utils/fantasy';

const FORMACIONES = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '3-4-3', '4-2-3-1', '4-1-4-1', '3-3-4'];

export function Ajustes() {
    const { settings, updateSettings, resetSettings } = useSettingsStore();

    return (
        <div className="space-y-6 p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">⚙️ Ajustes</h1>
                <Button variant="outline" onClick={resetSettings}>Restaurar Defaults</Button>
            </div>

            {/* Alineación */}
            <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Alineación</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">Formación por defecto</label>
                        <select
                            value={settings.formacion}
                            onChange={e => updateSettings({ formacion: e.target.value })}
                            className="w-full mt-1 p-2 border rounded"
                        >
                            {FORMACIONES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Máx. jugadores mismo equipo</label>
                        <Input
                            type="number" min={1} max={11}
                            value={settings.maxJugadoresMismoEquipo}
                            onChange={e => updateSettings({ maxJugadoresMismoEquipo: Number(e.target.value) })}
                            className="mt-1"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.useMultiPosicion}
                                onChange={e => updateSettings({ useMultiPosicion: e.target.checked })}
                                className="w-4 h-4"
                            />
                            Usar multiposición en alineación automática
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            Si está desactivado, se usa solo la posición principal de Biwenger.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Capitán y Ariete */}
            <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Capitán y Ariete</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium">
                            Precio máximo Capitán: <strong>{fmtValor(settings.precioMaxCapitan)}</strong>
                        </label>
                        <input
                            type="range" min={1_000_000} max={100_000_000} step={1_000_000}
                            value={settings.precioMaxCapitan}
                            onChange={e => updateSettings({ precioMaxCapitan: Number(e.target.value) })}
                            className="w-full mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Precio máximo Ariete: <strong>{fmtValor(settings.precioMaxAriete)}</strong>
                        </label>
                        <input
                            type="range" min={1_000_000} max={50_000_000} step={1_000_000}
                            value={settings.precioMaxAriete}
                            onChange={e => updateSettings({ precioMaxAriete: Number(e.target.value) })}
                            className="w-full mt-2"
                        />
                    </div>
                </div>
            </Card>

            {/* Pesos de Scores */}
            <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Pesos de Score IA</h2>
                <p className="text-xs text-gray-500 mb-4">Los pesos deben sumar 1.0</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="text-sm font-medium">
                            Rendimiento: <strong>{(settings.pesosScores.rendimiento * 100).toFixed(0)}%</strong>
                        </label>
                        <input
                            type="range" min={0} max={100} step={5}
                            value={settings.pesosScores.rendimiento * 100}
                            onChange={e => {
                                const v = Number(e.target.value) / 100;
                                const rest = 1 - v;
                                const ratio = settings.pesosScores.mercado + settings.pesosScores.partido;
                                const m = ratio > 0 ? settings.pesosScores.mercado / ratio * rest : rest / 2;
                                const p = rest - m;
                                updateSettings({ pesosScores: { rendimiento: v, mercado: m, partido: p } });
                            }}
                            className="w-full mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Mercado: <strong>{(settings.pesosScores.mercado * 100).toFixed(0)}%</strong>
                        </label>
                        <input
                            type="range" min={0} max={100} step={5}
                            value={settings.pesosScores.mercado * 100}
                            onChange={e => {
                                const v = Number(e.target.value) / 100;
                                const rest = 1 - v;
                                const ratio = settings.pesosScores.rendimiento + settings.pesosScores.partido;
                                const r = ratio > 0 ? settings.pesosScores.rendimiento / ratio * rest : rest / 2;
                                const p = rest - r;
                                updateSettings({ pesosScores: { rendimiento: r, mercado: v, partido: p } });
                            }}
                            className="w-full mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Partido: <strong>{(settings.pesosScores.partido * 100).toFixed(0)}%</strong>
                        </label>
                        <input
                            type="range" min={0} max={100} step={5}
                            value={settings.pesosScores.partido * 100}
                            onChange={e => {
                                const v = Number(e.target.value) / 100;
                                const rest = 1 - v;
                                const ratio = settings.pesosScores.rendimiento + settings.pesosScores.mercado;
                                const r = ratio > 0 ? settings.pesosScores.rendimiento / ratio * rest : rest / 2;
                                const m = rest - r;
                                updateSettings({ pesosScores: { rendimiento: r, mercado: m, partido: v } });
                            }}
                            className="w-full mt-2"
                        />
                    </div>
                </div>
                {/* Visual bar */}
                <div className="flex h-4 rounded overflow-hidden mt-3">
                    <div className="bg-blue-500" style={{ width: `${settings.pesosScores.rendimiento * 100}%` }} />
                    <div className="bg-green-500" style={{ width: `${settings.pesosScores.mercado * 100}%` }} />
                    <div className="bg-orange-500" style={{ width: `${settings.pesosScores.partido * 100}%` }} />
                </div>
                <div className="flex text-[10px] text-gray-500 mt-1">
                    <span style={{ width: `${settings.pesosScores.rendimiento * 100}%` }}>Rend</span>
                    <span style={{ width: `${settings.pesosScores.mercado * 100}%` }}>Merc</span>
                    <span style={{ width: `${settings.pesosScores.partido * 100}%` }}>Part</span>
                </div>
            </Card>

            {/* Mercado */}
            <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Mercado</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label className="text-sm font-medium">
                            Agresividad: <strong>{settings.agresividadMercado}/5</strong>
                        </label>
                        <input
                            type="range" min={1} max={5} step={1}
                            value={settings.agresividadMercado}
                            onChange={e => updateSettings({ agresividadMercado: Number(e.target.value) })}
                            className="w-full mt-2"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Conservador</span>
                            <span>Agresivo</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Threshold Ganga: <strong>Top {settings.thresholdGanga}%</strong>
                        </label>
                        <input
                            type="range" min={5} max={50} step={5}
                            value={settings.thresholdGanga}
                            onChange={e => updateSettings({ thresholdGanga: Number(e.target.value) })}
                            className="w-full mt-2"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">
                            Threshold Riesgo: <strong>Top {settings.thresholdRiesgo}%</strong>
                        </label>
                        <input
                            type="range" min={50} max={95} step={5}
                            value={settings.thresholdRiesgo}
                            onChange={e => updateSettings({ thresholdRiesgo: Number(e.target.value) })}
                            className="w-full mt-2"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}

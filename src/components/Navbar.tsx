import { useState } from 'react';
import { useFantasyStore } from '../store/fantasyStore';
import { Button } from '../../components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';

type Seccion = 'inicio' | 'miequipo' | 'alineacion' | 'mercado' | 'predicciones' | 'scores' | 'rivales' | 'graficas' | 'jugadores' | 'ajustes';

export function Navbar({ seccionActiva, setSeccioActiva }: { seccionActiva: Seccion; setSeccioActiva: (s: Seccion) => void }) {
    const { plataformaActiva, setPlataforma, miEquipo, setBiwengerAuth, biwengerAuth } = useFantasyStore();
    const [menuAbierto, setMenuAbierto] = useState(false);

    const handleLogout = () => {
        setBiwengerAuth(null);
        localStorage.removeItem('biwenger_token');
    };

    const secciones: { id: Seccion; label: string; icon: string }[] = [
        { id: 'inicio', label: 'Dashboard', icon: '🏠' },
        { id: 'miequipo', label: 'Mi Equipo', icon: '⚽' },
        { id: 'alineacion', label: 'Alineación', icon: '⚡' },
        { id: 'mercado', label: 'Mercado', icon: '🔄' },
        { id: 'jugadores', label: 'Jugadores', icon: '👥' },
        { id: 'predicciones', label: 'Predicciones', icon: '🔮' },
        { id: 'scores', label: 'Scores IA', icon: '📊' },
        { id: 'graficas', label: 'Gráficas', icon: '📈' },
        { id: 'rivales', label: 'Rivales', icon: '📅' },
        { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
    ];

    const plataformas = ['laliga', 'comunio', 'biwenger', 'futmondo', 'mister'] as const;

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="max-w-full px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">⚽ Fantasy Manager</h1>
                        <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">{miEquipo.length}/15</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-2">
                        {secciones.map(sec => (
                            <Button
                                key={sec.id}
                                onClick={() => setSeccioActiva(sec.id)}
                                variant={seccionActiva === sec.id ? 'default' : 'ghost'}
                                className={`${seccionActiva === sec.id ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700'}`}
                            >
                                {sec.icon} {sec.label}
                            </Button>
                        ))}
                    </div>

                    {/* Plataforma selector */}
                    <div className="hidden md:flex items-center gap-2">
                        <label className="text-sm font-medium">Plataforma:</label>
                        <select
                            value={plataformaActiva}
                            onChange={e => setPlataforma(e.target.value as any)}
                            className="px-3 py-1 rounded text-blue-600 font-semibold text-sm"
                        >
                            <option value="laliga">LaLiga Fantasy</option>
                            <option value="comunio">Comunio</option>
                            <option value="biwenger">Biwenger</option>
                            <option value="futmondo">Futmondo</option>
                            <option value="mister">Mister</option>
                        </select>
                    </div>

                    {/* Logout Button */}
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="hidden md:flex items-center gap-2 text-white hover:bg-red-600"
                    >
                        <LogOut size={18} />
                        Salir
                    </Button>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMenuAbierto(!menuAbierto)} className="lg:hidden">
                        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuAbierto && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-blue-500 space-y-2">
                        {secciones.map(sec => (
                            <Button
                                key={sec.id}
                                onClick={() => {
                                    setSeccioActiva(sec.id);
                                    setMenuAbierto(false);
                                }}
                                variant={seccionActiva === sec.id ? 'default' : 'ghost'}
                                className={`w-full justify-start ${seccionActiva === sec.id ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700'}`}
                            >
                                {sec.icon} {sec.label}
                            </Button>
                        ))}

                        <div className="pt-2">
                            <label className="text-sm font-medium block mb-2">Plataforma:</label>
                            <select
                                value={plataformaActiva}
                                onChange={e => setPlataforma(e.target.value as any)}
                                className="w-full px-3 py-2 rounded text-blue-600 font-semibold"
                            >
                                <option value="laliga">LaLiga Fantasy</option>
                                <option value="comunio">Comunio</option>
                                <option value="biwenger">Biwenger</option>
                                <option value="futmondo">Futmondo</option>
                                <option value="mister">Mister</option>
                            </select>
                        </div>

                        <div className="pt-2 border-t border-blue-500">
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="w-full justify-start text-white hover:bg-red-600"
                            >
                                <LogOut size={18} />
                                Salir
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

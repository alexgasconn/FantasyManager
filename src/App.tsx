/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useFantasyStore } from './store/fantasyStore';
import { BiwengerLogin } from './components/BiwengerLogin';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MiEquipo } from './components/sections/MiEquipo';
import { Alineacion } from './components/sections/Alineacion';
import { Mercado } from './components/sections/Mercado';
import { Predicciones } from './components/sections/Predicciones';
import { Scores } from './components/sections/Scores';
import { ProximosRivales } from './components/sections/ProximosRivales';
import { Graficas } from './components/sections/Graficas';
import { Jugadores } from './components/sections/JugadoresExplorer';
import { Ajustes } from './components/sections/Ajustes';
import { useBiwengerData } from './hooks/useBiwengerData';

type Seccion = 'inicio' | 'miequipo' | 'alineacion' | 'mercado' | 'predicciones' | 'scores' | 'rivales' | 'graficas' | 'jugadores' | 'ajustes';

function App() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('inicio');
  const { isBiwengerLoggedIn } = useFantasyStore();
  const { loading } = useBiwengerData();

  if (!isBiwengerLoggedIn()) {
    return <BiwengerLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar seccionActiva={seccionActiva} setSeccioActiva={setSeccionActiva} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de Biwenger + FutbolFantasy...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-full mx-auto">
          {seccionActiva === 'inicio' && <Dashboard />}
          {seccionActiva === 'miequipo' && <MiEquipo />}
          {seccionActiva === 'alineacion' && <Alineacion />}
          {seccionActiva === 'mercado' && <Mercado />}
          {seccionActiva === 'predicciones' && <Predicciones />}
          {seccionActiva === 'scores' && <Scores />}
          {seccionActiva === 'rivales' && <ProximosRivales />}
          {seccionActiva === 'graficas' && <Graficas />}
          {seccionActiva === 'jugadores' && <Jugadores />}
          {seccionActiva === 'ajustes' && <Ajustes />}
        </main>
      )}
    </div>
  );
}

export default App;

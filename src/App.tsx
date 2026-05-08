/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MiEquipo } from './components/sections/MiEquipo';
import { Formacion } from './components/sections/Formacion';
import { Mercado } from './components/sections/Mercado';
import { Predicciones } from './components/sections/Predicciones';
import { Scores } from './components/sections/Scores';
import { ProximosRivales } from './components/sections/ProximosRivales';
import { Graficas } from './components/sections/Graficas';
import { Jugadores } from './components/sections/JugadoresExplorer';

type Seccion = 'inicio' | 'miequipo' | 'formacion' | 'mercado' | 'predicciones' | 'scores' | 'rivales' | 'graficas' | 'jugadores';

function App() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('inicio');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar seccionActiva={seccionActiva} setSeccioActiva={setSeccionActiva} />

      <main className="max-w-7xl mx-auto">
        {seccionActiva === 'inicio' && <Dashboard />}
        {seccionActiva === 'miequipo' && <MiEquipo />}
        {seccionActiva === 'formacion' && <Formacion />}
        {seccionActiva === 'mercado' && <Mercado />}
        {seccionActiva === 'predicciones' && <Predicciones />}
        {seccionActiva === 'scores' && <Scores />}
        {seccionActiva === 'rivales' && <ProximosRivales />}
        {seccionActiva === 'graficas' && <Graficas />}
        {seccionActiva === 'jugadores' && <Jugadores />}
      </main>
    </div>
  );
}

export default App;

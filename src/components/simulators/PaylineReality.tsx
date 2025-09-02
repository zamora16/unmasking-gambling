import React, { useState } from 'react';

const PaylineReality: React.FC = () => {
  const [activeLines, setActiveLines] = useState(1);
  const [betPerLine, setBetPerLine] = useState(0.10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState({ wins: 0, totalSpent: 0, totalWon: 0, spins: 0 });
  
  // Simulación automática para demostrar el punto
  const runSimulation = () => {
    setIsSimulating(true);
    setResults({ wins: 0, totalSpent: 0, totalWon: 0, spins: 0 });
    
    let wins = 0;
    let totalSpent = 0;
    let totalWon = 0;
    
    // Simular 100 tiradas
    for (let i = 0; i < 100; i++) {
      const spinCost = activeLines * betPerLine;
      totalSpent += spinCost;
      
      // Simulación realista: ~25% hit frequency, RTP 95%
      if (Math.random() < 0.25) {
        wins++;
        // La ganancia se ajusta por el número de líneas pero mantiene el RTP
        const baseWin = spinCost * (0.95 / 0.25); // Ganancia que mantiene RTP 95%
        totalWon += baseWin;
      }
    }
    
    // Actualizar resultados gradualmente para efecto visual
    let currentWins = 0;
    let currentSpent = 0;
    let currentWon = 0;
    let currentSpins = 0;
    
    const interval = setInterval(() => {
      currentSpins += 2;
      currentWins = Math.floor((wins * currentSpins) / 100);
      currentSpent = (totalSpent * currentSpins) / 100;
      currentWon = (totalWon * currentSpins) / 100;
      
      setResults({
        wins: currentWins,
        totalSpent: currentSpent,
        totalWon: currentWon,
        spins: currentSpins
      });
      
      if (currentSpins >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 50);
  };

  const totalCostPerSpin = activeLines * betPerLine;
  const lossPercentage = results.spins > 0 ? ((results.totalSpent - results.totalWon) / results.totalSpent * 100) : 0;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎯 Calculadora de Impacto Real
        </h3>
        <p className="text-gray-600">
          Descubre cómo las líneas de pago afectan realmente tu presupuesto
        </p>
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Líneas Activas: <span className="font-bold text-blue-600">{activeLines}</span>
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={activeLines}
            onChange={(e) => setActiveLines(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>25</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apuesta por Línea: <span className="font-bold text-green-600">€{betPerLine.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.50"
            step="0.01"
            value={betPerLine}
            onChange={(e) => setBetPerLine(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>€0.01</span>
            <span>€0.50</span>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded border border-orange-200">
          <div className="text-orange-800">
            <p className="text-sm font-medium">Coste Real por Tirada:</p>
            <p className="text-2xl font-bold">€{totalCostPerSpin.toFixed(2)}</p>
            <p className="text-xs text-orange-600">= {activeLines} × €{betPerLine.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* El contraste clave */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-lg font-bold text-blue-800 mb-3">💡 La Diferencia Clave</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded border">
            <h5 className="font-semibold text-gray-700 mb-2">🎭 Lo que parece:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "Solo €{betPerLine.toFixed(2)} por línea - muy barato"</li>
              <li>• "Más líneas = más oportunidades"</li>
              <li>• "Activar todas para no perderse premios"</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border">
            <h5 className="font-semibold text-gray-700 mb-2">📊 Lo que realmente pasa:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pagas <strong>€{totalCostPerSpin.toFixed(2)} por cada tirada</strong></li>
              <li>• El RTP permanece <strong>exactamente igual</strong></li>
              <li>• Las ganancias se dividen entre más líneas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simulador */}
      <div className="mb-6 text-center">
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className={`px-8 py-3 font-bold rounded-lg transition-colors ${
            isSimulating 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSimulating ? '⏳ Simulando 100 tiradas...' : '🧪 Simular 100 Tiradas'}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Verás los resultados reales con tu configuración actual
        </p>
      </div>

      {/* Resultados de la simulación */}
      {results.spins > 0 && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
            📊 Resultados de {results.spins} tiradas
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded text-center border border-blue-200">
              <p className="text-blue-700 text-sm font-medium">Ganancias</p>
              <p className="text-2xl font-bold text-blue-800">{results.wins}</p>
              <p className="text-xs text-blue-600">veces</p>
            </div>
            <div className="bg-orange-50 p-3 rounded text-center border border-orange-200">
              <p className="text-orange-700 text-sm font-medium">Invertido</p>
              <p className="text-2xl font-bold text-orange-800">€{results.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded text-center border border-green-200">
              <p className="text-green-700 text-sm font-medium">Recuperado</p>
              <p className="text-2xl font-bold text-green-800">€{results.totalWon.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-3 rounded text-center border border-red-200">
              <p className="text-red-700 text-sm font-medium">Pérdida</p>
              <p className="text-2xl font-bold text-red-800">€{(results.totalSpent - results.totalWon).toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
            <p className="font-bold">
              Con {activeLines} líneas perdiste el {lossPercentage.toFixed(1)}% de tu dinero
            </p>
            <p className="text-gray-300 text-sm mt-1">
              RTP mantenido en ~95% - La matemática no cambia, solo tu coste total
            </p>
          </div>
        </div>
      )}

      {/* Comparación de costes */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">⚖️ Comparación de Costes Reales</h4>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Configuración</th>
                <th className="border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700">Por tirada</th>
                <th className="border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700">100 tiradas</th>
                <th className="border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700">1 hora*</th>
                <th className="border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-700">Pérdida esperada</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="bg-green-50">
                <td className="border-b border-gray-100 p-3 font-semibold">1 línea × €0.10</td>
                <td className="border-b border-gray-100 p-3 text-center">€0.10</td>
                <td className="border-b border-gray-100 p-3 text-center">€10</td>
                <td className="border-b border-gray-100 p-3 text-center">€60</td>
                <td className="border-b border-gray-100 p-3 text-center text-red-600 font-semibold">€3.00</td>
              </tr>
              <tr>
                <td className="border-b border-gray-100 p-3 font-semibold">10 líneas × €0.10</td>
                <td className="border-b border-gray-100 p-3 text-center">€1.00</td>
                <td className="border-b border-gray-100 p-3 text-center">€100</td>
                <td className="border-b border-gray-100 p-3 text-center">€600</td>
                <td className="border-b border-gray-100 p-3 text-center text-red-600 font-semibold">€30.00</td>
              </tr>
              <tr className="bg-orange-50">
                <td className="border-b border-gray-100 p-3 font-semibold">25 líneas × €0.10</td>
                <td className="border-b border-gray-100 p-3 text-center">€2.50</td>
                <td className="border-b border-gray-100 p-3 text-center">€250</td>
                <td className="border-b border-gray-100 p-3 text-center">€1,500</td>
                <td className="border-b border-gray-100 p-3 text-center text-red-600 font-semibold">€75.00</td>
              </tr>
              <tr className="bg-blue-50 border-2 border-blue-400">
                <td className="border-b border-gray-100 p-3 font-bold">Tu configuración: {activeLines} líneas × €{betPerLine.toFixed(2)}</td>
                <td className="border-b border-gray-100 p-3 text-center font-bold">€{totalCostPerSpin.toFixed(2)}</td>
                <td className="border-b border-gray-100 p-3 text-center font-bold">€{(totalCostPerSpin * 100).toFixed(2)}</td>
                <td className="border-b border-gray-100 p-3 text-center font-bold">€{(totalCostPerSpin * 600).toFixed(2)}</td>
                <td className="border-b border-gray-100 p-3 text-center text-red-600 font-bold">€{(totalCostPerSpin * 100 * 0.05).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">
            *600 tiradas por hora es una velocidad típica. Pérdida calculada con RTP 95%.
          </p>
        </div>
      </div>

      {/* Conclusión */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h4 className="text-lg font-bold text-indigo-800 mb-3 text-center">🎯 La Conclusión</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded border">
            <p className="font-semibold text-gray-700 text-sm">MISMO RTP</p>
            <p className="text-xs text-gray-600 mt-1">95% con 1 línea o 25 líneas</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="font-semibold text-gray-700 text-sm">DIFERENTE COSTE</p>
            <p className="text-xs text-gray-600 mt-1">Tu dinero se va {activeLines}x más rápido</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="font-semibold text-gray-700 text-sm">MISMA PÉRDIDA %</p>
            <p className="text-xs text-gray-600 mt-1">Solo cambia la cantidad total</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-indigo-100 rounded text-center">
          <p className="font-semibold text-indigo-800">
            💡 Con {activeLines} líneas, cada hora te costará €{(totalCostPerSpin * 600).toFixed(2)} 
            en lugar de €60 con 1 línea
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaylineReality;
import React, { useState, useMemo } from 'react';
import PaylineReality from './PaylineReality';

interface PaylineData {
  lines: number;
  betPerLine: number;
  totalBet: number;
  hitFrequency: number;
  averageWin: number;
  rtp: number;
  costPer100Spins: number;
  expectedWins: number;
  expectedLoss: number;
  returnPer100Spins: number;
}

const PaylineCalculator: React.FC = () => {
  const [selectedLines, setSelectedLines] = useState(20);
  const [betPerLine, setBetPerLine] = useState(0.05);
  const [baseRTP, setBaseRTP] = useState(95);

  // Configuraciones predefinidas de máquinas típicas
  const configurations = [
    { name: "Clásica 3x3", maxLines: 5, description: "Máquina tradicional simple" },
    { name: "Video Slot 5x3", maxLines: 25, description: "Slot moderna estándar" },
    { name: "Megaways", maxLines: 50, description: "Slot con muchas líneas" }
  ];

  const calculatePaylineData = useMemo((): PaylineData => {
    const totalBet = selectedLines * betPerLine;
    const rtp = baseRTP; // RTP se mantiene CONSTANTE independientemente de líneas
    
    // Hit frequency más realista - en slots reales es bastante estable
    // independientemente del número de líneas activas
    const baseHitFreq = 25; // 25% hit frequency típica
    // Pequeña variación basada en que con más líneas hay más combinaciones posibles
    const hitFrequency = Math.min(35, Math.max(20, baseHitFreq + (selectedLines * 0.05)));
    
    // Ganancia promedio cuando se gana (matemáticamente precisa)
    // Basada en: TotalReturn = HitFreq * AvgWin * TotalBet = RTP * TotalBet
    // Por tanto: AvgWin = (RTP * TotalBet) / (HitFreq * TotalBet) = RTP / HitFreq
    const averageWin = (totalBet * (rtp / 100)) / (hitFrequency / 100);
    
    const costPer100Spins = totalBet * 100;
    const expectedWins = hitFrequency; // wins per 100 spins
    const returnPer100Spins = costPer100Spins * (rtp / 100);
    const expectedLoss = costPer100Spins - returnPer100Spins;
    
    return {
      lines: selectedLines,
      betPerLine,
      totalBet,
      hitFrequency,
      averageWin,
      rtp,
      costPer100Spins,
      expectedWins,
      expectedLoss,
      returnPer100Spins
    };
  }, [selectedLines, betPerLine, baseRTP]);

  const getLineRecommendation = (lines: number) => {
    if (lines <= 5) return { color: "text-green-600", text: "Menor coste, ganancias menos frecuentes pero más grandes", risk: "Bajo riesgo financiero" };
    if (lines <= 15) return { color: "text-yellow-600", text: "Equilibrio entre coste y frecuencia", risk: "Riesgo moderado" };
    if (lines <= 25) return { color: "text-orange-600", text: "Mayor coste, ganancias más frecuentes pero pequeñas", risk: "Riesgo alto" };
    return { color: "text-red-600", text: "Coste muy alto, muchas ganancias pequeñas", risk: "Riesgo muy alto" };
  };

  const recommendation = getLineRecommendation(selectedLines);

  // Calcular ejemplos comparativos realistas
  const calculateComparison = (lines: number, rtp: number) => {
    const totalBet = lines * betPerLine;
    const hitFreq = Math.min(35, Math.max(20, 25 + (lines * 0.05)));
    const avgWin = (totalBet * (rtp / 100)) / (hitFreq / 100);
    const cost100 = totalBet * 100;
    const return100 = cost100 * (rtp / 100);
    const loss100 = cost100 - return100;
    
    return {
      lines,
      totalBet,
      hitFreq,
      avgWin,
      cost100,
      loss100
    };
  };

  const comparison1Line = calculateComparison(1, baseRTP);
  const comparison10Lines = calculateComparison(10, baseRTP);
  const comparison25Lines = calculateComparison(25, baseRTP);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          🔢 Calculadora de Líneas de Pago
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Descubre cómo el número de líneas de pago afecta tu apuesta total y tus probabilidades. 
          <strong>Spoiler: más líneas no significa mejor RTP, solo diferente experiencia de juego</strong>.
        </p>
      </div>

      {/* Controles principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            📊 Líneas activas: <span className="font-bold text-green-600">{selectedLines}</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={selectedLines}
            onChange={(e) => setSelectedLines(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 línea</span>
            <span>50 líneas</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            💰 Apuesta por línea: <span className="font-bold text-green-600">€{betPerLine.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={betPerLine}
            onChange={(e) => setBetPerLine(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>€0.01</span>
            <span>€1.00</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            📈 RTP: <span className="font-bold text-green-600">{baseRTP}%</span>
          </label>
          <input
            type="range"
            min="85"
            max="98"
            step="1"
            value={baseRTP}
            onChange={(e) => setBaseRTP(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>85%</span>
            <span>98%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">🎯 Concepto Clave</h4>
            <p className="text-xs text-blue-700">
              <strong>El RTP es SIEMPRE {baseRTP}%</strong> sin importar cuántas líneas actives. 
              Solo cambia la <em>experiencia</em> de juego.
            </p>
          </div>
        </div>
      </div>

      {/* Configuraciones rápidas */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎰 Configuraciones Típicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {configurations.map((config, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedLines(Math.min(config.maxLines, 50))}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 transition-colors text-left"
            >
              <h4 className="font-bold text-gray-800">{config.name}</h4>
              <p className="text-sm text-gray-600">{config.description}</p>
              <p className="text-xs text-green-600 mt-2">Máx. {config.maxLines} líneas</p>
            </button>
          ))}
        </div>
      </div>

      {/* Resultados principales */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Análisis de tu Configuración</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-600 mb-2">💳 Apuesta total</h4>
            <p className="text-2xl font-bold text-blue-800">€{calculatePaylineData.totalBet.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-1">por tirada</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-600 mb-2">🎯 Hit frequency</h4>
            <p className="text-2xl font-bold text-green-800">{calculatePaylineData.hitFrequency.toFixed(1)}%</p>
            <p className="text-xs text-green-600 mt-1">tiradas ganadoras</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-600 mb-2">💰 Ganancia promedio</h4>
            <p className="text-2xl font-bold text-yellow-800">€{calculatePaylineData.averageWin.toFixed(2)}</p>
            <p className="text-xs text-yellow-600 mt-1">cuando ganas</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-600 mb-2">📉 Coste (100 tiradas)</h4>
            <p className="text-2xl font-bold text-red-800">€{calculatePaylineData.costPer100Spins.toFixed(2)}</p>
            <p className="text-xs text-red-600 mt-1">inversión total</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-sm font-medium text-purple-600 mb-2">💸 Pérdida esperada</h4>
            <p className="text-2xl font-bold text-purple-800">€{calculatePaylineData.expectedLoss.toFixed(2)}</p>
            <p className="text-xs text-purple-600 mt-1">en 100 tiradas</p>
          </div>
        </div>
      </div>

      {/* Recomendación */}
      <div className={`mb-8 p-4 rounded-lg border-l-4 ${
        recommendation.color.includes('green') ? 'bg-green-50 border-green-400' :
        recommendation.color.includes('yellow') ? 'bg-yellow-50 border-yellow-400' :
        recommendation.color.includes('orange') ? 'bg-orange-50 border-orange-400' :
        'bg-red-50 border-red-400'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`${recommendation.color} font-semibold`}>
              💡 Con {selectedLines} líneas: {recommendation.text}
            </p>
          </div>
          <div>
            <p className={`${recommendation.color} text-sm`}>
              <strong>{recommendation.risk}</strong> - Pérdida esperada: €{calculatePaylineData.expectedLoss.toFixed(2)} por cada €{calculatePaylineData.costPer100Spins.toFixed(2)} apostados
            </p>
          </div>
        </div>
      </div>

      {/* Visualización de líneas */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">👀 Visualización de Líneas de Pago</h3>
        <PaylineReality />
      </div>

      {/* Comparación matemática precisa */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">⚖️ Comparación Matemática Precisa</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left">Líneas</th>
                <th className="border border-gray-200 p-3 text-center">Apuesta total</th>
                <th className="border border-gray-200 p-3 text-center">Hit frequency</th>
                <th className="border border-gray-200 p-3 text-center">Ganancia promedio</th>
                <th className="border border-gray-200 p-3 text-center">Coste (100 tiradas)</th>
                <th className="border border-gray-200 p-3 text-center">Pérdida esperada</th>
                <th className="border border-gray-200 p-3 text-center">RTP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-3 font-semibold">1 línea</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison1Line.totalBet.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">{comparison1Line.hitFreq.toFixed(1)}%</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison1Line.avgWin.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison1Line.cost100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center text-red-600">€{comparison1Line.loss100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center font-bold">{baseRTP}%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 p-3 font-semibold">10 líneas</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison10Lines.totalBet.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">{comparison10Lines.hitFreq.toFixed(1)}%</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison10Lines.avgWin.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison10Lines.cost100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center text-red-600">€{comparison10Lines.loss100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center font-bold">{baseRTP}%</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3 font-semibold">25 líneas</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison25Lines.totalBet.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">{comparison25Lines.hitFreq.toFixed(1)}%</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison25Lines.avgWin.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center">€{comparison25Lines.cost100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center text-red-600">€{comparison25Lines.loss100.toFixed(2)}</td>
                <td className="border border-gray-200 p-3 text-center font-bold">{baseRTP}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-center text-gray-600 mt-4 text-sm">
          💡 <strong>Observa:</strong> El RTP es idéntico en todos los casos. Solo cambia cuánto arriesgas y cómo experimentas las ganancias.
        </p>
      </div>

      {/* Matemáticas detrás del cálculo */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
        <h3 className="text-xl font-bold text-blue-800 mb-4">🧮 Las Matemáticas Detrás del Cálculo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Fórmulas utilizadas:</h4>
            <ul className="text-blue-600 text-sm space-y-1">
              <li>• <strong>Apuesta total</strong> = Líneas × Apuesta por línea</li>
              <li>• <strong>Retorno esperado</strong> = Apuesta total × RTP</li>
              <li>• <strong>Pérdida esperada</strong> = Apuesta total × (1 - RTP)</li>
              <li>• <strong>Ganancia promedio</strong> = (Apuesta total × RTP) ÷ Hit frequency</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Para tu configuración actual:</h4>
            <ul className="text-blue-600 text-sm space-y-1">
              <li>• {selectedLines} líneas × €{betPerLine.toFixed(2)} = <strong>€{calculatePaylineData.totalBet.toFixed(2)}</strong> por tirada</li>
              <li>• €{calculatePaylineData.totalBet.toFixed(2)} × {baseRTP}% = <strong>€{calculatePaylineData.returnPer100Spins.toFixed(2)}</strong> retorno esperado (100 tiradas)</li>
              <li>• €{calculatePaylineData.costPer100Spins.toFixed(2)} - €{calculatePaylineData.returnPer100Spins.toFixed(2)} = <strong>€{calculatePaylineData.expectedLoss.toFixed(2)}</strong> pérdida esperada</li>
              <li>• Cada ganancia promedio: <strong>€{calculatePaylineData.averageWin.toFixed(2)}</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mitos vs Realidad */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">🔍 Mitos vs Realidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
            <h4 className="text-xl font-bold text-red-800 mb-4">❌ MITOS</h4>
            <ul className="space-y-3 text-red-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>"Más líneas = más posibilidades de ganar dinero"</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>"Si juego todas las líneas, tengo ventaja"</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>"Las líneas inactivas me hacen perder premios"</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>"Más líneas mejoran el RTP"</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
            <h4 className="text-xl font-bold text-green-800 mb-4">✅ REALIDAD</h4>
            <ul className="space-y-3 text-green-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span><strong>El RTP es idéntico</strong> independientemente de las líneas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Más líneas = <strong>mayor costo total</strong> por tirada</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Más líneas = ganancias más frecuentes pero <strong>más pequeñas</strong></span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>La elección de líneas solo afecta la <strong>experiencia de juego</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ejemplo práctico mejorado */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-blue-800 mb-4">💡 Ejemplo Práctico Detallado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-bold text-blue-700 mb-2">Jugador A - 1 línea × €0.50</h4>
            <ul className="text-sm space-y-1 text-blue-600">
              <li>• Apuesta total: <strong>€0.50</strong> por tirada</li>
              <li>• Hit frequency: <strong>~25%</strong></li>
              <li>• Cuando gana: <strong>€1.90</strong> promedio</li>
              <li>• 100 tiradas: <strong>€50</strong> apostados</li>
              <li>• Pérdida esperada: <strong>€2.50</strong> (RTP 95%)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-bold text-blue-700 mb-2">Jugador B - 25 líneas × €0.02</h4>
            <ul className="text-sm space-y-1 text-blue-600">
              <li>• Apuesta total: <strong>€0.50</strong> por tirada</li>
              <li>• Hit frequency: <strong>~26%</strong></li>
              <li>• Cuando gana: <strong>€1.83</strong> promedio</li>
              <li>• 100 tiradas: <strong>€50</strong> apostados</li>
              <li>• Pérdida esperada: <strong>€2.50</strong> (RTP 95%)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p className="text-blue-700 font-semibold text-center">
            🎯 <strong>Resultado:</strong> Ambos jugadores arriesgan exactamente lo mismo (€50) y pierden exactamente lo mismo (€2.50). 
            Solo cambia la <em>distribución</em> de las ganancias, no el resultado final.
          </p>
        </div>
      </div>

      {/* Consejos finales */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 Consejos para Líneas de Pago</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-yellow-700 space-y-2">
            <li>• <strong>El RTP es SIEMPRE el mismo</strong> independientemente de las líneas</li>
            <li>• Elige según tu presupuesto: menos líneas = menor costo por tirada</li>
            <li>• Más líneas = experiencia más "activa" pero MÁS CARA</li>
          </ul>
          <ul className="text-yellow-700 space-y-2">
            <li>• <strong>No hay estrategia "correcta"</strong> - solo diferentes formas de experimentar la pérdida</li>
            <li>• Controla tu <strong>apuesta total</strong>, no solo la apuesta por línea</li>
            <li>• Recuerda: <strong>la casa siempre gana</strong> independientemente de las líneas</li>
          </ul>
        </div>
      </div>

      {/* Advertencia final */}
      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
        <p className="text-red-700 text-sm">
          <strong>⚠️ Recuerda:</strong> Las líneas de pago son una característica del juego, no una estrategia para ganar dinero. 
          Independientemente del número de líneas que actives, <strong>la ventaja matemática siempre favorece a la casa</strong>. 
          El juego debe ser solo entretenimiento, nunca una forma de generar ingresos.
        </p>
      </div>
    </div>
  );
};

export default PaylineCalculator;
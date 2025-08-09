import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts';

interface SimulationResult {
  initialBalance: number;
  finalBalance: number;
  netProfit: number;
  expectedValue: number;
  balanceHistory: { time: number; value: number }[];
  actualRTP: number;
  totalWins: number;
  bigWins: number;
}

interface PayoutEntry {
  multiplier: number;
  probability: number;
  cumulativeProbability: number;
}

const SlotSimulator: React.FC = () => {
  const [rtp, setRtp] = useState(95);
  const [bet, setBet] = useState(1);
  const [spins, setSpins] = useState(100);
  const [initialBalance, setInitialBalance] = useState(1000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'line'> | null>(null);

  // Inicializar el gráfico
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#374151',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      rightPriceScale: {
        borderColor: '#e5e7eb',
        textColor: '#6b7280',
      },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: false,
        secondsVisible: false,
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 3,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `€${price.toFixed(2)}`,
      },
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // Responsive
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Crear tabla de pagos calibrada matemáticamente según RTP
  const createPayoutTable = (targetRTP: number): PayoutEntry[] => {
    const rtpDecimal = targetRTP / 100;
    
    // Tabla base de pagos realista para slots
    const basePayouts = [
      { multiplier: 0, baseProb: 0.65 },    // No gana - 65%
      { multiplier: 1.5, baseProb: 0.20 },  // Gana pequeño - 20%
      { multiplier: 3, baseProb: 0.10 },    // Gana medio - 10%
      { multiplier: 10, baseProb: 0.04 },   // Gana grande - 4%
      { multiplier: 50, baseProb: 0.009 },  // Gana muy grande - 0.9%
      { multiplier: 200, baseProb: 0.001 }  // Jackpot - 0.1%
    ];

    // Calcular RTP base
    const baseRTP = basePayouts.reduce((sum, payout) => 
      sum + (payout.multiplier * payout.baseProb), 0);

    // Factor de ajuste para alcanzar el RTP objetivo
    const adjustmentFactor = rtpDecimal / baseRTP;

    // Ajustar multiplicadores manteniendo probabilidades
    const adjustedPayouts = basePayouts.map(payout => ({
      multiplier: payout.multiplier * adjustmentFactor,
      probability: payout.baseProb
    }));

    // Crear tabla con probabilidades acumulativas para sampling eficiente
    let cumulative = 0;
    return adjustedPayouts.map(payout => {
      cumulative += payout.probability;
      return {
        multiplier: payout.multiplier,
        probability: payout.probability,
        cumulativeProbability: cumulative
      };
    });
  };

  // Función para simular una tirada individual
  const simulateSpin = (payoutTable: PayoutEntry[]): number => {
    const random = Math.random();
    
    for (const entry of payoutTable) {
      if (random <= entry.cumulativeProbability) {
        return entry.multiplier;
      }
    }
    
    // Fallback (no debería llegar aquí)
    return 0;
  };

  const simulateSpins = async () => {
    setIsSimulating(true);
    
    // Simular con pequeño delay para UX
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const payoutTable = createPayoutTable(rtp);
    let balance = initialBalance;
    const balanceHistory: { time: number; value: number }[] = [{ time: 0, value: balance }];
    let totalWinAmount = 0;
    let totalWagered = 0;
    let totalWins = 0;
    let bigWins = 0; // Wins > 5x bet

    for (let i = 1; i <= spins; i++) {
      // Verificar si tiene suficiente dinero para apostar
      if (balance < bet) {
        break;
      }

      const multiplier = simulateSpin(payoutTable);
      const winAmount = bet * multiplier;
      
      totalWagered += bet;
      
      if (multiplier > 0) {
        balance += winAmount - bet; // Ganancia neta
        totalWinAmount += winAmount;
        totalWins++;
        
        if (multiplier >= 5) {
          bigWins++;
        }
      } else {
        balance -= bet; // Pierde la apuesta
      }
      
      // Asegurar que el balance no sea negativo
      balance = Math.max(0, balance);
      
      // Guardar puntos para el gráfico (cada pocos spins para performance)
      if (i % Math.max(1, Math.floor(spins / 100)) === 0 || i === spins) {
        balanceHistory.push({ time: i, value: balance });
      }
      
      // Si se queda sin dinero, parar
      if (balance <= 0) break;
    }

    const netProfit = balance - initialBalance;
    const expectedValue = (rtp / 100 - 1) * bet * Math.min(spins, Math.floor(initialBalance / bet));
    const actualRTP = totalWagered > 0 ? (totalWinAmount / totalWagered) * 100 : 0;

    const simulationResult: SimulationResult = {
      initialBalance,
      finalBalance: balance,
      netProfit,
      expectedValue,
      balanceHistory,
      actualRTP,
      totalWins,
      bigWins
    };

    setResult(simulationResult);

    // Actualizar gráfico
    if (seriesRef.current) {
      seriesRef.current.setData(balanceHistory);
    }

    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setResult(null);
    if (seriesRef.current) {
      seriesRef.current.setData([]);
    }
  };

  const getResultColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Calcular máximo de tiradas posibles con el saldo actual
  const maxPossibleSpins = Math.floor(initialBalance / bet);
  const effectiveSpins = Math.min(spins, maxPossibleSpins);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-indigo-600 mb-4">
          🎰 Simulador de Máquina Tragaperras
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Experimenta con diferentes configuraciones para entender cómo el RTP afecta tus resultados a largo plazo.
          Este simulador te muestra la realidad matemática detrás de las tragaperras.
        </p>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            💰 Saldo inicial: <span className="font-bold text-indigo-600">€{initialBalance}</span>
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>€100</span>
            <span>€5000</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            📊 RTP: <span className="font-bold text-indigo-600">{rtp}%</span>
          </label>
          <input
            type="range"
            min="75"
            max="98"
            step="1"
            value={rtp}
            onChange={(e) => setRtp(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>75%</span>
            <span>98%</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            💳 Apuesta: <span className="font-bold text-indigo-600">€{bet}</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="50"
            step="0.5"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>€0.5</span>
            <span>€50</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            🔄 Tiradas: <span className="font-bold text-indigo-600">{spins}</span>
          </label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={spins}
            onChange={(e) => setSpins(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50</span>
            <span>2000</span>
          </div>
        </div>
      </div>

      {/* Advertencia si no hay suficiente saldo */}
      {maxPossibleSpins < spins && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <p className="text-yellow-700">
            ⚠️ <strong>Advertencia:</strong> Tu saldo solo permite {maxPossibleSpins} tiradas de €{bet}. 
            La simulación se detendrá cuando te quedes sin dinero.
          </p>
        </div>
      )}

      {/* Información previa */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">📈 Predicción Matemática</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Inversión total:</span>
            <span className="font-bold ml-2">€{(bet * effectiveSpins).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-blue-700">Retorno esperado:</span>
            <span className="font-bold ml-2">€{(bet * effectiveSpins * rtp / 100).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-blue-700">Pérdida esperada:</span>
            <span className="font-bold ml-2 text-red-600">€{(bet * effectiveSpins * (1 - rtp / 100)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={simulateSpins}
          disabled={isSimulating}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {isSimulating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Simulando...
            </>
          ) : (
            <>
              🎰 Simular Tiradas
            </>
          )}
        </button>
        
        {result && (
          <button
            onClick={resetSimulation}
            className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            🔄 Reiniciar
          </button>
        )}
      </div>

      {/* Resultados */}
      {result && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Resultados de la Simulación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600 mb-2">💰 Saldo inicial</h4>
              <p className="text-2xl font-bold text-gray-900">€{result.initialBalance.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600 mb-2">🏁 Saldo final</h4>
              <p className={`text-2xl font-bold ${getResultColor(result.finalBalance - result.initialBalance)}`}>
                €{result.finalBalance.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600 mb-2">📈 Ganancia/Pérdida</h4>
              <p className={`text-2xl font-bold ${getResultColor(result.netProfit)}`}>
                {result.netProfit >= 0 ? '+' : ''}€{result.netProfit.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600 mb-2">🎯 RTP Real</h4>
              <p className={`text-2xl font-bold ${Math.abs(result.actualRTP - rtp) < 5 ? 'text-green-600' : 'text-orange-600'}`}>
                {result.actualRTP.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-600 mb-2">🏆 Tiradas ganadoras</h4>
              <p className="text-2xl font-bold text-blue-600">{result.totalWins}</p>
              <p className="text-xs text-gray-500 mt-1">{result.bigWins} grandes</p>
            </div>
          </div>

          {/* Análisis del RTP */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Análisis de Precisión</h4>
            <div className="flex items-center justify-between text-sm">
              <span>RTP Configurado: <strong>{rtp}%</strong></span>
              <span>RTP Obtenido: <strong className={Math.abs(result.actualRTP - rtp) < 5 ? 'text-green-600' : 'text-orange-600'}>
                {result.actualRTP.toFixed(1)}%
              </strong></span>
              <span>Diferencia: <strong>{Math.abs(result.actualRTP - rtp).toFixed(1)}%</strong></span>
            </div>
            {Math.abs(result.actualRTP - rtp) > 10 && (
              <p className="text-orange-600 text-xs mt-2">
                💡 Con pocas tiradas, el RTP real puede variar significativamente del teórico. Prueba con más tiradas para mayor precisión.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Evolución del Saldo</h3>
        <div ref={chartContainerRef} className="w-full h-96 rounded" />
        {!result && (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Ejecuta una simulación para ver el gráfico</p>
            </div>
          </div>
        )}
      </div>

      {/* Información educativa */}
      <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
        <h4 className="text-lg font-semibold text-yellow-800 mb-3">💡 ¿Qué nos enseña esta simulación?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-yellow-700 space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              El RTP es una <strong>expectativa matemática a muy largo plazo</strong>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              A corto plazo, los resultados pueden <strong>variar enormemente</strong>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              Incluso con RTP alto, la probabilidad de pérdida es <strong>significativa</strong>
            </li>
          </ul>
          <ul className="text-yellow-700 space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              La "ventaja de la casa" <strong>siempre funciona</strong> a favor del casino
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              Más tiradas = resultados más cercanos al <strong>valor esperado negativo</strong>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              El juego <strong>nunca debe verse como inversión</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Advertencia */}
      <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
        <p className="text-red-700 text-sm">
          <strong>⚠️ Recuerda:</strong> Esta simulación muestra resultados estadísticos. En la realidad, 
          el juego compulsivo puede llevar a problemas serios. Si sientes que no puedes controlar tu juego, 
          busca ayuda profesional inmediatamente.
        </p>
      </div>
    </div>
  );
};

export default SlotSimulator;
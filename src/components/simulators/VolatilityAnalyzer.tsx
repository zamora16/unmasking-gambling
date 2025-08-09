import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts';

interface VolatilityResults {
  lowVolatility: {
    balance: number;
    wins: number;
    bigWins: number;
    sessions: number[];
    distribution: { range: string; count: number }[];
    actualRTP: number;
    totalWagered: number;
    totalWinAmount: number;
  };
  highVolatility: {
    balance: number;
    wins: number;
    bigWins: number;
    sessions: number[];
    distribution: { range: string; count: number }[];
    actualRTP: number;
    totalWagered: number;
    totalWinAmount: number;
  };
}

interface PayoutEntry {
  multiplier: number;
  probability: number;
  cumulativeProbability: number;
}

const VolatilityAnalyzer: React.FC = () => {
  const [initialBalance, setInitialBalance] = useState(1000);
  const [sessions, setSessions] = useState(10);
  const [spinsPerSession, setSpinsPerSession] = useState(100);
  const [bet, setBet] = useState(5);
  const [targetRTP, setTargetRTP] = useState(95);
  const [results, setResults] = useState<VolatilityResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const lowVolChartRef = useRef<HTMLDivElement>(null);
  const highVolChartRef = useRef<HTMLDivElement>(null);
  const lowVolChart = useRef<IChartApi | null>(null);
  const highVolChart = useRef<IChartApi | null>(null);

  // Inicializar gráficos
  useEffect(() => {
    const initChart = (container: HTMLDivElement, title: string) => {
      return createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#374151',
        },
        width: container.clientWidth,
        height: 300,
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
    };

    if (lowVolChartRef.current && !lowVolChart.current) {
      lowVolChart.current = initChart(lowVolChartRef.current, 'Baja Volatilidad');
    }
    
    if (highVolChartRef.current && !highVolChart.current) {
      highVolChart.current = initChart(highVolChartRef.current, 'Alta Volatilidad');
    }

    const handleResize = () => {
      if (lowVolChartRef.current && lowVolChart.current) {
        lowVolChart.current.applyOptions({ width: lowVolChartRef.current.clientWidth });
      }
      if (highVolChartRef.current && highVolChart.current) {
        highVolChart.current.applyOptions({ width: highVolChartRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lowVolChart.current) lowVolChart.current.remove();
      if (highVolChart.current) highVolChart.current.remove();
    };
  }, []);

  // Crear tabla de pagos para BAJA volatilidad (ganancias frecuentes, pequeñas)
  const createLowVolatilityTable = (targetRTP: number): PayoutEntry[] => {
    const rtpDecimal = targetRTP / 100;
    
    // Baja volatilidad: muchas ganancias pequeñas
    const basePayouts = [
      { multiplier: 0, baseProb: 0.45 },     // No gana - 45%
      { multiplier: 1.2, baseProb: 0.30 },   // Gana pequeño - 30%
      { multiplier: 1.8, baseProb: 0.15 },   // Gana medio - 15%
      { multiplier: 2.5, baseProb: 0.08 },   // Gana bueno - 8%
      { multiplier: 5, baseProb: 0.018 },    // Gana grande - 1.8%
      { multiplier: 15, baseProb: 0.002 }    // Jackpot pequeño - 0.2%
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

    // Crear tabla con probabilidades acumulativas
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

  // Crear tabla de pagos para ALTA volatilidad (ganancias raras, grandes)
  const createHighVolatilityTable = (targetRTP: number): PayoutEntry[] => {
    const rtpDecimal = targetRTP / 100;
    
    // Alta volatilidad: pocas ganancias grandes
    const basePayouts = [
      { multiplier: 0, baseProb: 0.75 },     // No gana - 75%
      { multiplier: 2, baseProb: 0.12 },     // Gana medio - 12%
      { multiplier: 5, baseProb: 0.08 },     // Gana grande - 8%
      { multiplier: 15, baseProb: 0.035 },   // Gana muy grande - 3.5%
      { multiplier: 50, baseProb: 0.012 },   // Jackpot medio - 1.2%
      { multiplier: 200, baseProb: 0.003 }   // Mega jackpot - 0.3%
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

    // Crear tabla con probabilidades acumulativas
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
    
    return 0; // Fallback
  };

  const simulateVolatilityType = (
    balance: number, 
    spins: number, 
    betAmount: number, 
    payoutTable: PayoutEntry[]
  ) => {
    let currentBalance = balance;
    let wins = 0;
    let bigWins = 0;
    let totalWagered = 0;
    let totalWinAmount = 0;
    const history: { time: number; value: number }[] = [{ time: 0, value: currentBalance }];
    const results: number[] = [];

    for (let i = 1; i <= spins; i++) {
      if (currentBalance < betAmount) break;

      const multiplier = simulateSpin(payoutTable);
      const winAmount = betAmount * multiplier;
      
      totalWagered += betAmount;
      
      if (multiplier > 0) {
        currentBalance += winAmount - betAmount; // Ganancia neta
        totalWinAmount += winAmount;
        wins++;
        results.push(winAmount - betAmount);
        
        if (multiplier >= 5) bigWins++;
      } else {
        currentBalance -= betAmount;
        results.push(-betAmount);
      }
      
      currentBalance = Math.max(0, currentBalance);
      
      if (i % Math.max(1, Math.floor(spins / 20)) === 0) {
        history.push({ time: i, value: currentBalance });
      }
    }

    // Crear distribución de resultados
    const distribution = createDistribution(results);
    const actualRTP = totalWagered > 0 ? (totalWinAmount / totalWagered) * 100 : 0;

    return {
      balance: currentBalance,
      wins,
      bigWins,
      history,
      results,
      distribution,
      actualRTP,
      totalWagered,
      totalWinAmount
    };
  };

  const createDistribution = (results: number[]) => {
    const ranges = [
      { min: -Infinity, max: -20, label: "< -€20" },
      { min: -20, max: -10, label: "-€20 a -€10" },
      { min: -10, max: -1, label: "-€10 a -€1" },
      { min: -1, max: 1, label: "±€1" },
      { min: 1, max: 10, label: "€1 a €10" },
      { min: 10, max: 25, label: "€10 a €25" },
      { min: 25, max: 50, label: "€25 a €50" },
      { min: 50, max: Infinity, label: "> €50" }
    ];

    return ranges.map(range => ({
      range: range.label,
      count: results.filter(r => r >= range.min && r < range.max).length
    }));
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    const lowVolPayoutTable = createLowVolatilityTable(targetRTP);
    const highVolPayoutTable = createHighVolatilityTable(targetRTP);

    const lowVolResults = {
      balance: 0,
      wins: 0,
      bigWins: 0,
      sessions: [] as number[],
      distribution: [] as { range: string; count: number }[],
      actualRTP: 0,
      totalWagered: 0,
      totalWinAmount: 0
    };

    const highVolResults = {
      balance: 0,
      wins: 0,
      bigWins: 0,
      sessions: [] as number[],
      distribution: [] as { range: string; count: number }[],
      actualRTP: 0,
      totalWagered: 0,
      totalWinAmount: 0
    };

    let lowVolHistory: { time: number; value: number }[] = [];
    let highVolHistory: { time: number; value: number }[] = [];
    let allLowResults: number[] = [];
    let allHighResults: number[] = [];
    let totalLowWagered = 0;
    let totalHighWagered = 0;
    let totalLowWinAmount = 0;
    let totalHighWinAmount = 0;

    for (let session = 0; session < sessions; session++) {
      // Simular baja volatilidad
      const lowVol = simulateVolatilityType(initialBalance, spinsPerSession, bet, lowVolPayoutTable);
      lowVolResults.balance += lowVol.balance;
      lowVolResults.wins += lowVol.wins;
      lowVolResults.bigWins += lowVol.bigWins;
      lowVolResults.sessions.push(lowVol.balance);
      allLowResults.push(...lowVol.results);
      totalLowWagered += lowVol.totalWagered;
      totalLowWinAmount += lowVol.totalWinAmount;

      // Simular alta volatilidad
      const highVol = simulateVolatilityType(initialBalance, spinsPerSession, bet, highVolPayoutTable);
      highVolResults.balance += highVol.balance;
      highVolResults.wins += highVol.wins;
      highVolResults.bigWins += highVol.bigWins;
      highVolResults.sessions.push(highVol.balance);
      allHighResults.push(...highVol.results);
      totalHighWagered += highVol.totalWagered;
      totalHighWinAmount += highVol.totalWinAmount;

      // Acumular historia para gráficos (primera sesión)
      if (session === 0) {
        lowVolHistory = [...lowVol.history];
        highVolHistory = [...highVol.history];
      }
    }

    // Promediar resultados
    lowVolResults.balance = lowVolResults.balance / sessions;
    highVolResults.balance = highVolResults.balance / sessions;
    lowVolResults.distribution = createDistribution(allLowResults);
    highVolResults.distribution = createDistribution(allHighResults);
    lowVolResults.actualRTP = totalLowWagered > 0 ? (totalLowWinAmount / totalLowWagered) * 100 : 0;
    highVolResults.actualRTP = totalHighWagered > 0 ? (totalHighWinAmount / totalHighWagered) * 100 : 0;
    lowVolResults.totalWagered = totalLowWagered;
    highVolResults.totalWagered = totalHighWagered;
    lowVolResults.totalWinAmount = totalLowWinAmount;
    highVolResults.totalWinAmount = totalHighWinAmount;

    setResults({ lowVolatility: lowVolResults, highVolatility: highVolResults });

    // Actualizar gráficos
    if (lowVolChart.current && highVolChart.current) {
      // Limpiar gráficos existentes
      lowVolChart.current.remove();
      highVolChart.current.remove();
      
      // Recrear gráficos
      if (lowVolChartRef.current && highVolChartRef.current) {
        lowVolChart.current = createChart(lowVolChartRef.current, {
          layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#374151' },
          width: lowVolChartRef.current.clientWidth,
          height: 300,
          rightPriceScale: { borderColor: '#e5e7eb', textColor: '#6b7280' },
          timeScale: { borderColor: '#e5e7eb', timeVisible: false, secondsVisible: false },
          grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
        });

        highVolChart.current = createChart(highVolChartRef.current, {
          layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#374151' },
          width: highVolChartRef.current.clientWidth,
          height: 300,
          rightPriceScale: { borderColor: '#e5e7eb', textColor: '#6b7280' },
          timeScale: { borderColor: '#e5e7eb', timeVisible: false, secondsVisible: false },
          grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
        });

        const lowSeries = lowVolChart.current.addLineSeries({
          color: '#10b981',
          lineWidth: 3,
          priceFormat: { type: 'custom', formatter: (price: number) => `€${price.toFixed(0)}` },
        });
        lowSeries.setData(lowVolHistory);

        const highSeries = highVolChart.current.addLineSeries({
          color: '#ef4444',
          lineWidth: 3,
          priceFormat: { type: 'custom', formatter: (price: number) => `€${price.toFixed(0)}` },
        });
        highSeries.setData(highVolHistory);
      }
    }

    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setResults(null);
    if (lowVolChart.current) {
      lowVolChart.current.remove();
      lowVolChart.current = null;
    }
    if (highVolChart.current) {
      highVolChart.current.remove();
      highVolChart.current = null;
    }
    
    // Reinicializar gráficos
    setTimeout(() => {
      if (lowVolChartRef.current) {
        lowVolChart.current = createChart(lowVolChartRef.current, {
          layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#374151' },
          width: lowVolChartRef.current.clientWidth,
          height: 300,
          rightPriceScale: { borderColor: '#e5e7eb', textColor: '#6b7280' },
          timeScale: { borderColor: '#e5e7eb', timeVisible: false, secondsVisible: false },
          grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
        });
      }
      
      if (highVolChartRef.current) {
        highVolChart.current = createChart(highVolChartRef.current, {
          layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#374151' },
          width: highVolChartRef.current.clientWidth,
          height: 300,
          rightPriceScale: { borderColor: '#e5e7eb', textColor: '#6b7280' },
          timeScale: { borderColor: '#e5e7eb', timeVisible: false, secondsVisible: false },
          grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
        });
      }
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">
          ⚡ Analizador de Volatilidad
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Comprende la diferencia entre slots de baja y alta volatilidad. <strong>Ambas tienen el mismo RTP</strong>, 
          pero la frecuencia y tamaño de los premios es completamente diferente.
        </p>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            💰 Saldo por sesión: <span className="font-bold text-orange-600">€{initialBalance}</span>
          </label>
          <input
            type="range"
            min="500"
            max="2000"
            step="100"
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            🎮 Sesiones a simular: <span className="font-bold text-orange-600">{sessions}</span>
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={sessions}
            onChange={(e) => setSessions(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            🔄 Tiradas por sesión: <span className="font-bold text-orange-600">{spinsPerSession}</span>
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={spinsPerSession}
            onChange={(e) => setSpinsPerSession(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            💳 Apuesta: <span className="font-bold text-orange-600">€{bet}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            📊 RTP objetivo: <span className="font-bold text-orange-600">{targetRTP}%</span>
          </label>
          <input
            type="range"
            min="85"
            max="98"
            step="1"
            value={targetRTP}
            onChange={(e) => setTargetRTP(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Información clave sobre RTP */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">🎯 Concepto Clave</h4>
        <p className="text-blue-700">
          <strong>AMBOS tipos tendrán exactamente el mismo RTP del {targetRTP}%</strong>. 
          La volatilidad solo cambia <em>cómo</em> se distribuyen las ganancias y pérdidas, 
          pero <strong>no el resultado matemático final</strong>.
        </p>
      </div>

      {/* Información teórica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
          <h3 className="text-xl font-bold text-green-800 mb-3">🟢 Baja Volatilidad</h3>
          <ul className="text-green-700 space-y-2">
            <li>• <strong>Ganancias frecuentes</strong> pero pequeñas (55% win rate)</li>
            <li>• Multiplicadores típicos: 1.2x - 2.5x</li>
            <li>• <strong>Menor riesgo emocional</strong> - experiencia más predecible</li>
            <li>• Ideal para sesiones largas con poco bankroll</li>
            <li>• <strong>Mismo RTP final</strong> que alta volatilidad</li>
          </ul>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
          <h3 className="text-xl font-bold text-red-800 mb-3">🔴 Alta Volatilidad</h3>
          <ul className="text-red-700 space-y-2">
            <li>• <strong>Ganancias raras</strong> pero muy grandes (25% win rate)</li>
            <li>• Multiplicadores típicos: 5x - 200x</li>
            <li>• <strong>Alto riesgo emocional</strong> - experiencia impredecible</li>
            <li>• Pueden vaciarte el saldo muy rápido</li>
            <li>• <strong>Mismo RTP final</strong> que baja volatilidad</li>
          </ul>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando...
            </>
          ) : (
            <>⚡ Analizar Volatilidad</>
          )}
        </button>

        {results && (
          <button
            onClick={resetAnalysis}
            className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            🔄 Reiniciar
          </button>
        )}
      </div>

      {/* Resultados */}
      {results && (
        <div className="space-y-8">
          {/* Comparación de RTP - LO MÁS IMPORTANTE */}
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">🎯 Verificación de RTP</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-yellow-700">RTP Objetivo</p>
                <p className="text-2xl font-bold text-yellow-800">{targetRTP}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-700">Baja Volatilidad</p>
                <p className={`text-2xl font-bold ${Math.abs(results.lowVolatility.actualRTP - targetRTP) < 3 ? 'text-green-600' : 'text-orange-600'}`}>
                  {results.lowVolatility.actualRTP.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-red-700">Alta Volatilidad</p>
                <p className={`text-2xl font-bold ${Math.abs(results.highVolatility.actualRTP - targetRTP) < 3 ? 'text-green-600' : 'text-orange-600'}`}>
                  {results.highVolatility.actualRTP.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-center text-yellow-700 mt-4 text-sm">
              ✅ <strong>Ambos tipos convergen al mismo RTP</strong> - La volatilidad no mejora tus posibilidades matemáticas
            </p>
          </div>

          {/* Comparación de resultados */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Comparación de Experiencia de Juego</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baja Volatilidad */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-xl font-bold text-green-800 mb-4">🟢 Baja Volatilidad</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Saldo final promedio:</span>
                    <span className="font-bold">€{results.lowVolatility.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Tiradas ganadoras:</span>
                    <span className="font-bold">{results.lowVolatility.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Ganancias grandes (5x+):</span>
                    <span className="font-bold">{results.lowVolatility.bigWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Sesiones rentables:</span>
                    <span className="font-bold">
                      {results.lowVolatility.sessions.filter(s => s > initialBalance).length}/{sessions}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-green-700">RTP real:</span>
                    <span className="font-bold">{results.lowVolatility.actualRTP.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Alta Volatilidad */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h4 className="text-xl font-bold text-red-800 mb-4">🔴 Alta Volatilidad</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-red-700">Saldo final promedio:</span>
                    <span className="font-bold">€{results.highVolatility.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Tiradas ganadoras:</span>
                    <span className="font-bold">{results.highVolatility.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Ganancias grandes (5x+):</span>
                    <span className="font-bold">{results.highVolatility.bigWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Sesiones rentables:</span>
                    <span className="font-bold">
                      {results.highVolatility.sessions.filter(s => s > initialBalance).length}/{sessions}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-red-700">RTP real:</span>
                    <span className="font-bold">{results.highVolatility.actualRTP.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos de evolución */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Evolución del Saldo (Primera Sesión)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-green-800 mb-3 text-center">Baja Volatilidad - Más Predecible</h4>
                <div ref={lowVolChartRef} className="w-full" />
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-red-800 mb-3 text-center">Alta Volatilidad - Más Salvaje</h4>
                <div ref={highVolChartRef} className="w-full" />
              </div>
            </div>
          </div>

          {/* Distribución de resultados */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Distribución de Resultados por Tirada</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-green-800 mb-4">🟢 Baja Volatilidad</h4>
                <div className="space-y-2">
                  {results.lowVolatility.distribution.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="text-sm text-green-700 w-24">{item.range}</span>
                      <div className="flex-1 bg-green-200 rounded-full h-4 ml-3">
                        <div 
                          className="bg-green-500 h-4 rounded-full" 
                          style={{ 
                            width: `${Math.max(5, (item.count / Math.max(...results.lowVolatility.distribution.map(d => d.count))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-green-700 ml-2 w-8">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-red-800 mb-4">🔴 Alta Volatilidad</h4>
                <div className="space-y-2">
                  {results.highVolatility.distribution.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="text-sm text-red-700 w-24">{item.range}</span>
                      <div className="flex-1 bg-red-200 rounded-full h-4 ml-3">
                        <div 
                          className="bg-red-500 h-4 rounded-full" 
                          style={{ 
                            width: `${Math.max(5, (item.count / Math.max(...results.highVolatility.distribution.map(d => d.count))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-red-700 ml-2 w-8">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lecciones importantes */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">🎓 Lecciones Clave sobre Volatilidad</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-blue-700 space-y-2">
            <li>• <strong>Ambos tienen exactamente el mismo RTP</strong> a largo plazo</li>
            <li>• La volatilidad <strong>no cambia las matemáticas</strong> fundamentales</li>
            <li>• Alta volatilidad = <strong>mayor riesgo emocional y financiero</strong></li>
            <li>• Baja volatilidad da <strong>falsa sensación de seguridad</strong></li>
          </ul>
          <ul className="text-blue-700 space-y-2">
            <li>• Las <strong>grandes ganancias son estadísticamente raras</strong> en ambos tipos</li>
            <li>• <strong>Ninguna volatilidad</strong> te da ventaja sobre la casa</li>
            <li>• La elección de volatilidad es solo <strong>preferencia de experiencia</strong></li>
            <li>• <strong>El resultado final es el mismo</strong>: pierdes dinero a largo plazo</li>
          </ul>
        </div>
      </div>

      {/* Advertencia */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
        <p className="text-yellow-700 text-sm">
          <strong>⚠️ Importante:</strong> La volatilidad no es una estrategia para ganar dinero. 
          Es simplemente una característica del juego que afecta cómo se distribuyen las ganancias y pérdidas. 
          <strong>La ventaja de la casa permanece constante</strong> independientemente de la volatilidad elegida.
        </p>
      </div>
    </div>
  );
};

export default VolatilityAnalyzer;
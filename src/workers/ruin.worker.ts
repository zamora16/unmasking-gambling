import { simulateRuin, type RuinParams } from '../lib/montecarlo';
import { GAMES, type GameId } from '../lib/games';

export type RuinRequest = Omit<RuinParams, 'game'> & { gameId: GameId; id: number };

self.onmessage = (e: MessageEvent<RuinRequest>) => {
  const { gameId, id, ...rest } = e.data;
  const t0 = performance.now();
  const result = simulateRuin({ ...rest, game: GAMES[gameId] });
  (self as unknown as Worker).postMessage({ id, result, ms: performance.now() - t0 });
};

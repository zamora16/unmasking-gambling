# Unmasking Gambling

**Data journalism and interactive simulations on the mathematics of gambling, in Spanish and English.**

🌐 **Live:** [zamora16.github.io/unmasking-gambling](https://zamora16.github.io/unmasking-gambling/) · [English](https://zamora16.github.io/unmasking-gambling/en/)

![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-pandas%20%C2%B7%20SciPy-3776AB?logo=python&logoColor=white)
![Tests](https://github.com/zamora16/unmasking-gambling/actions/workflows/deploy.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Most prevention messages say that gambling is risky. This site shows *why*, with simulations you can run and real data you can check.

## What's inside

| Section | What it does | Techniques |
| --- | --- | --- |
| **Ruin Lab** | Simulates thousands of players at once in the browser and shows how the house edge wins over time. | Monte Carlo in a Web Worker, percentile bands, Kaplan–Meier survival, gambler's ruin |
| **Do the odds tell the truth?** | Analysis of 235,796 football matches (2000–2026) with real bookmaker odds. | Overround removal (proportional, power, Shin), calibration with Wilson intervals, favourite–longshot bias with bootstrap CIs, strategy backtests, out-of-sample ordinal logit on Elo vs the market |
| **The market** | Dashboard of Spain's online gambling market: revenue, hold, marketing, bonuses and prevalence among teenagers and adults. | Curated official data (DGOJ, Ministry of Health), every figure linked to its source |
| **The games** | House edge of every common game and a calculator of what it costs to play at your own pace. | Exact probability calculations |
| **Help** | Helplines, self-exclusion and practical steps. | |

A few findings from the odds analysis:

- The reference bookmaker's median margin fell from 12.8% (2000/01) to about 6.5%, and is roughly twice as high in small leagues as in the Premier League.
- Betting on long shots (odds 10–15) loses 28% on average; short favourites lose about 2%.
- None of eight simple strategies made money over ten seasons. An Elo model's "value bets", tested out of sample, lost 8.8%.

## Project structure

```
src/lib/          the maths: games, Monte Carlo, Kaplan–Meier, margin removal (pure TypeScript)
src/workers/      Web Worker that runs the simulations
src/charts/       hand-built SVG charts on d3 scales (tooltips, table view, dark mode)
src/islands/      interactive React components
src/views/        page content, in Spanish and English
src/data/         JSON produced by the analysis and the curated market dataset
analysis/odds/    reproducible Python pipeline for the odds analysis
tests/            Vitest tests (exact edges, gambler's ruin formula, Kaplan–Meier, margin methods)
```

## Run it

```bash
npm install
npm run dev      # http://localhost:4321/unmasking-gambling/
npm test
npm run build
```

Reproduce the odds analysis (writes `src/data/odds/*.json`):

```bash
pip install -r analysis/requirements.txt
curl -LO https://raw.githubusercontent.com/xgabora/Club-Football-Match-Data-2000-2025/main/data/Matches.csv
python analysis/odds/pipeline.py Matches.csv
```

## Data sources

- Match results and odds: [Football-Data.co.uk](https://www.football-data.co.uk/) and [ClubElo](http://clubelo.com/), compiled in [xgabora/Club-Football-Match-Data](https://github.com/xgabora/Club-Football-Match-Data-2000-2025).
- Spanish market: annual reports of the [Dirección General de Ordenación del Juego](https://www.ordenacionjuego.es/) and the *Revista Española de Drogodependencias*.
- Prevalence: ESTUDES and EDADES surveys, [Observatorio Español de las Drogas y las Adicciones](https://pnsd.sanidad.gob.es/).

## Need help?

This site is educational and does not replace professional help. Spain: **FEJAR 900 200 225**, crisis line **024**. UK: **GamCare 0808 8020 133**. US: **1-800-GAMBLER**, **988**.

## Author

[Ángel Zamora Martínez](https://zamora16.github.io/angel-zamora-portfolio/), PhD in Psychology. Released under the [MIT License](LICENSE).

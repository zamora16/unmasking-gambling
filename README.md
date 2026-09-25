# Unmasking Gambling

**An interactive educational site that shows, with simulators and the actual maths, why the house always wins, and guides people towards help.**

🌐 **Live:** [zamora16.github.io/unmasking-gambling](https://zamora16.github.io/unmasking-gambling/) (Spanish)

![Astro](https://img.shields.io/badge/Astro-4-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Most prevention messages tell people that gambling is risky. This site lets them *see* it: they can play a slot machine, bet on a roulette system or simulate a betting season and watch the expected value work against them.

## What's inside

- **Slots**: slot simulator, RTP and volatility explained, payline calculator and visualiser.
- **Roulette**: simulator, house-edge breakdown, calculator and why betting systems (Martingale and others) fail.
- **Lottery and scratch cards**: expected value and probability calculators.
- **Sports betting**: odds converter, bookmaker margin ("juice") calculator, bankroll manager, streak and season simulators.
- **"El Camino"**: a six-step self-help path with a self-assessment, self-control tools and a printable personal plan.
- **Help**: crisis pop-up and verified support resources for Spain, Latin America, the UK and the US, managed from a single typed file (`src/utils/links.ts`).

## Tech

Astro (static output) with React islands for the interactive simulators, TypeScript and Tailwind CSS. Deployed to GitHub Pages by a GitHub Actions workflow on every push to `main`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in ./dist
```

## Need help?

This site is educational and does not replace professional help. In Spain you can call **FEJAR, 900 200 225**, or **024** if you are in crisis. UK: [GamCare](https://www.gamcare.org.uk). US: [National Council on Problem Gambling](https://www.ncpgambling.org), 1-800-GAMBLER.

## Author

[Ángel Zamora Martínez](https://zamora16.github.io/angel-zamora-portfolio/), PhD in Psychology. Released under the [MIT License](LICENSE).

# Meowtrics

A simple web app for tracking and visualizing data about my cats — weight over time, meal preferences, and potentially more in the future.

Built with Vue 3 and Apache ECharts. Hosted on GitHub Pages.

## How it works

Data is collected via iOS Shortcuts on my phone. Each shortcut appends a row to a CSV file in iCloud Drive, which then automatically calls a shortcut that commits and pushes the updated file to this repo. A GitHub Actions workflow then builds and deploys the app to GitHub Pages, so the site updates automatically whenever new data is synced. The app reads those CSV files at runtime and renders charts from them.

## What's being tracked

- **Weight logs** — Periodic weight measurements for each cat.
- **Lunch log (Cummings)** — At lunchtime, Cummings is presented with two cans of food and whichever one he rubs up against is the winner. The bowl and utensil are readied beforehand so the chosen can is opened and served immediately in front of him — reinforcing the connection between his choice and the meal.

## Development

```sh
npm install
npm run dev
```

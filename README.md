# Meowtrics

A simple web app for tracking and visualizing data about my cats — weight over time, meal preferences, and potentially more in the future.

Built with Vue 3 and Apache ECharts. Hosted on GitHub Pages.

## How it works

Data is collected via iOS Shortcuts on my iPhone. Each shortcut appends a row to a CSV file in iCloud Drive, and then automatically calls a new Shortcut that commits and pushes the updated file to this repo. A GitHub Actions workflow then builds and deploys the app to GitHub Pages, so the site updates automatically whenever new data is synced. The app reads those CSV files at runtime and renders charts from them.

## Development

```sh
npm install
npm run dev
```

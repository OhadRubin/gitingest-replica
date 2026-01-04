# RepoInsights

A client-side GitHub repository analytics tool built with React, TypeScript, and Tailwind CSS. Discover which files change most, who contributes what, and how your codebase evolves over time.

## Features

- **Hot Files**: Ranked list of most-changed files by commit frequency, additions, or deletions
- **Contributor Stats**: Who changed which files, commit counts, and file ownership
- **Activity Heatmap**: Weekly activity visualization with monthly grouping
- **Export**: Download analytics as JSON or CSV
- **Caching**: Results cached in localStorage (1hr TTL) to reduce API calls
- **Rate Limit Handling**: Automatic retry with backoff for GitHub API limits

## Usage

### Development

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

### Deployment

To deploy to GitHub Pages:

```bash
npm run auto-deploy
```

## How It Works

1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Optionally add a GitHub Personal Access Token for higher rate limits (5,000 vs 60 requests/hour)
3. The app fetches up to 500 commits and analyzes file changes
4. View analytics across three tabs: Hot Files, Contributors, Activity

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Framer Motion (Animations)

## API Limits

| Auth Status | Rate Limit |
|-------------|------------|
| No token | 60 requests/hour |
| With PAT | 5,000 requests/hour |

The app fetches up to 500 commits (list) and 200 commits (detailed file changes) per analysis.

## License

MIT

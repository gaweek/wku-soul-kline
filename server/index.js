import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleVibeLineAnalyze } from './vibelineAnalyzer.js';
import { handleVibeMatchAnalyze } from './vibelineMatchAnalyzer.js';

dotenv.config();

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    product: 'WKU soul-kline',
    routes: ['/api/vibeline/analyze', '/api/vibeline/match'],
  });
});

app.post('/api/vibeline/analyze', handleVibeLineAnalyze);
app.post('/api/vibeline/match', handleVibeMatchAnalyze);

const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WKU soul-kline server listening on http://localhost:${PORT}`);
});

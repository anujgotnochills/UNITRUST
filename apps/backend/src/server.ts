import express, { Express } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { startBlockchainListeners } from './services/blockchainListener';

// Route imports
import assetRoutes from './routes/assets';
import certificateRoutes from './routes/certificates';
import requestRoutes from './routes/requests';
import profileRoutes from './routes/profiles';
import ipfsRoutes from './routes/ipfs';
import hiddenRoutes from './routes/hidden';

const app: Express = express();

// Middleware — CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(env.ALLOWED_ORIGIN ? env.ALLOWED_ORIGIN.split(',').map((s) => s.trim()) : []),
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any vercel.app subdomain (for preview deployments)
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/assets', assetRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/hidden', hiddenRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);

async function start() {
  await connectDB();
  startBlockchainListeners();

  app.listen(PORT, () => {
    console.log(`\n🚀 UniTrust Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(console.error);

export default app;

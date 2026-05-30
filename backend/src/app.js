import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import roomRoutes from './routes/room.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '16kb' }));
app.use(globalLimiter);

app.use('/api/room', roomRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  const status = err.status ?? (err.errors ? 400 : 500);
  const message = err.status ? err.message : 'Something went wrong';

  if (!err.status) console.error('[error]', err);

  res.status(status).json({ error: message });
});

export default app;

import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { initSocket } from './socket/index.js';

const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket'],
});

initSocket(io);

httpServer.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});

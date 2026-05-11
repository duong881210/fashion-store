import './env';

import { createServer } from 'http';
import next from 'next';
import { Server as SocketServer } from 'socket.io';
import { initSocketServer } from './src/server/socket/index';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 }, // recover missed events
  });

  initSocketServer(io);

  // Attach io to global for tRPC access
  ; (global as any).__io = io;

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`Server ready on http://localhost:${port}`);
  });
});

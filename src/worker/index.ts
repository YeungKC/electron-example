/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { IpcServer, MessagePortWrapper } from 'ipc-express';
import { getServerPort } from './connect/port';

async function bootstrap() {
  const port = await getServerPort();
  const server = new IpcServer(new MessagePortWrapper(port));

  const app = express();

  app.post('/increase', (req, res) => {
    res.send(req.body + 1);
  });

  app.post('/decrease', () => {
    throw new Error('decrease');
  });

  app.post('/echo', (req, res) => {
    res.send(req.body);
  });

  app.get('*', (_, res) => {
    res.status(404).send();
  });

  app.use((err: any, req: any, res: any, next: any) => {
    res.send(err);
  });

  server.listen(app);
}
bootstrap();

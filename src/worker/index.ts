import WorkerServer from './connect/worker-server';

async function bootstrap() {
  const server = await WorkerServer.init();
  server.on<number, number>('increase', (data) => data + 1);
  server.on<number, number>('decrease', () => {
    throw new Error('decrease error');
  });

  server.on('echo', (data) => data);
}
bootstrap();

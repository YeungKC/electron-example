import { IpcClient, MessagePortWrapper } from 'ipc-express';
import { render } from 'react-dom';
import { getClientPort } from 'worker/connect/port';
import App from './App';

render(<App />, document.getElementById('root'));

async function bootstrap() {
  const port = await getClientPort();
  const client = new IpcClient(new MessagePortWrapper(port));

  const promises = new Array(10)
    .fill(0)
    .map((_, i) => client.post('/increase', i));

  const results = await Promise.allSettled(promises);

  console.log('increase result: ', results);

  try {
    const result = await client.post('/decrease', 1);
    console.log('decrease result: ', result);
  } catch (e) {
    console.log('decrease error: ', e);
  }

  console.log('echo result: ', await client.post('/echo', { foo: 1 }));
}
bootstrap();

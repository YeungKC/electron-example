import { render } from 'react-dom';
import WorkerClient from '../worker/connect/worker-client';
import App from './App';

render(<App />, document.getElementById('root'));

async function bootstrap() {
  const client = await WorkerClient.init('client');

  const promises = new Array(10)
    .fill(0)
    .map((_, i) => client.postMessage('increase', i));

  const results = await Promise.allSettled(promises);

  console.log('increase result: ', results);

  try {
    const result = await client.postMessage('decrease', 1);
    console.log('decrease result: ', result);
  } catch (e) {
    console.log('decrease error: ', e);
  }

  console.log('echo result: ', await client.postMessage('echo', { foo: 1 }));
}
bootstrap();

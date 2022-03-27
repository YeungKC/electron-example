import { ipcRenderer } from 'electron';
import logger from '../../util/logger';
import { WORKER_CHANNEL, REQUEST_WORKER_CHANNEL } from './key';
import { MessagePortData, MessagePortResponse } from './type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...params: any[]) => logger.silly(...params);

export default class WorkerClient {
  private port: MessagePort;

  private prefix: string;

  private currentRequestId = 0;

  private requestCallbacks = new Map<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data?: any, error?: Error) => void
  >();

  private constructor(_port: MessagePort, prefix: string) {
    this.port = _port;
    this.prefix = prefix;

    this.port.onmessage = (event) => this.onMessage(event);
    this.port.onmessageerror = (event) =>
      logger.error('client recive error: ', event);
  }

  static init(prefix: string) {
    return new Promise<WorkerClient>((resolve) => {
      let timer: NodeJS.Timer | undefined;

      ipcRenderer.once(WORKER_CHANNEL, ({ ports: [p] }) => {
        if (timer) clearInterval(timer);
        resolve(new WorkerClient(p, prefix));
      });

      timer = setInterval(() => {
        ipcRenderer.send(REQUEST_WORKER_CHANNEL);
      }, 1);
    });
  }

  private onMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: MessageEvent<MessagePortData<MessagePortResponse<any>>>
  ) {
    const { data } = event;
    if (!data) return;

    const {
      prefix,
      id,
      type,
      data: { data: response, error: e },
    } = data;
    if (prefix !== this.prefix) return;

    log(`client recive: `, data);

    const key = `${type}-${id}`;
    const callback = this.requestCallbacks.get(key);

    if (!callback) return;
    this.requestCallbacks.delete(key);

    if (e !== undefined) {
      callback(undefined, e);
      return;
    }

    callback(response);
  }

  postMessage<Request, Data>(type: string, data: Request) {
    this.currentRequestId += 1;

    const { currentRequestId: callCount } = this;
    return new Promise<Data>((resolve, reject) => {
      this.requestCallbacks.set(`${type}-${callCount}`, (response, e) => {
        if (e !== undefined) {
          reject(e);
          return;
        }
        resolve(response);
      });

      const request: MessagePortData<Request> = {
        prefix: this.prefix,
        type,
        id: callCount,
        data,
      };

      log(`client send: `, request);

      this.port.postMessage(request);
    });
  }
}

import { ipcRenderer } from 'electron';
import logger from '../../util/logger';
import { CLIENT_CHANNEL } from './key';
import { MessagePortData, MessagePortResponse } from './type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...params: any[]) => logger.silly(...params);

export default class WorkerServer {
  private port: MessagePort;

  private callbackMap = new Map<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((data?: any) => Promise<any> | any)[]
  >();

  private constructor(port: MessagePort) {
    this.port = port;
    this.port.onmessage = (event) => this.onMessage(event);
    this.port.onmessageerror = (event) =>
      logger.error('server recive error: ', event);
  }

  static init() {
    return new Promise<WorkerServer>((resolve) => {
      ipcRenderer.on(CLIENT_CHANNEL, ({ ports: [port] }) => {
        return resolve(new WorkerServer(port));
      });
    });
  }

  private postMessage<Data>(
    prefix: string,
    type: string,
    id: number,
    data: Data
  ) {
    const request: MessagePortData<MessagePortResponse<Data>> = {
      prefix,
      type,
      id,
      data: {
        data,
      },
    };
    return this.port.postMessage(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private postError(prefix: string, type: string, id: number, e: any) {
    const request: MessagePortData<MessagePortResponse<never>> = {
      prefix,
      type,
      id,
      data: {
        error: e,
      },
    };
    return this.port.postMessage(request);
  }

  private onMessage(event: MessageEvent<MessagePortData<unknown>>) {
    if (!event.data) return;
    const { prefix, type, id, data } = event.data;

    log(`server recive: `, event.data);

    const array = this.callbackMap.get(type) || [];
    array.forEach(async (callback) => {
      try {
        const result = await callback(data);

        log(`server send: `, {
          prefix,
          type,
          id,
          data: result,
        });

        this.postMessage(prefix, type, id, result);
      } catch (e) {
        log(`server send error: `, {
          prefix,
          type,
          id,
          error: e,
        });

        this.postError(prefix, type, id, e);
      }
    });
  }

  on<Data, Response>(
    type: string,
    callback: (data: Data) => Promise<Response> | Response
  ) {
    const array = this.callbackMap.get(type) || [];
    array.push(callback);
    this.callbackMap.set(type, array);
  }
}

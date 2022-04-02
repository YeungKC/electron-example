import { ipcRenderer } from 'electron';
import {
  WORKER_CHANNEL,
  REQUEST_WORKER_CHANNEL,
  CLIENT_CHANNEL,
} from './constant';

export const getClientPort = () =>
  new Promise<MessagePort>((resolve) => {
    let timer: NodeJS.Timer | undefined;

    ipcRenderer.once(WORKER_CHANNEL, ({ ports: [p] }) => {
      if (timer) clearInterval(timer);
      resolve(p);
    });

    timer = setInterval(() => {
      ipcRenderer.send(REQUEST_WORKER_CHANNEL);
    }, 1);
  });

export const getServerPort = () =>
  new Promise<MessagePort>((resolve) => {
    ipcRenderer.on(CLIENT_CHANNEL, ({ ports: [port] }) => {
      return resolve(port);
    });
  });

import {
  BrowserWindow,
  app,
  ipcMain,
  MessageChannelMain,
  IpcMainEvent,
} from 'electron';
import path from 'path';
import { REQUEST_WORKER_CHANNEL, CLIENT_CHANNEL, WORKER_CHANNEL } from './key';
import { resolveHtmlPath } from '../../main/util';

const createWorkerWindow = async (mainWindow: () => BrowserWindow | null) => {
  const worker = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'worker.js')
        : path.join(__dirname, '../../../.erb/dll/worker.js'),
    },
  });

  // todo empty or dashboard
  await worker.loadURL(resolveHtmlPath('worker/index.html'));

  const listener = (event: IpcMainEvent) => {
    if (event.senderFrame !== mainWindow()?.webContents.mainFrame) return;
    ipcMain.removeListener(REQUEST_WORKER_CHANNEL, listener);

    const { port1, port2 } = new MessageChannelMain();
    worker.webContents.postMessage(CLIENT_CHANNEL, null, [port1]);
    event.senderFrame.postMessage(WORKER_CHANNEL, null, [port2]);
  };

  ipcMain.on(REQUEST_WORKER_CHANNEL, listener);
};

export default createWorkerWindow;

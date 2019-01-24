import { ipcMain } from 'electron';
import engine from './engine';

function initialize() {
  engine.initialize();

  ipcMain.on('engine:initialize', () => {
    engine.initialize();
  });
  ipcMain.on('engine:start', () => {
    // engine.start();
  });
  ipcMain.on('engine:stop', () => {
    // engine.stop();
  });
}

export default {
  initialize,
};

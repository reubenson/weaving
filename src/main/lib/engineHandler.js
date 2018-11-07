import { ipcMain } from 'electron';
import engine from './engine';

function initialize() {
  engine.initialize();

  ipcMain.on('engine:initialize', () => {
    engine.initialize();
  });
}

export default {
  initialize,
};

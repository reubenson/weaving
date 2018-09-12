import path from 'path';
import { remote } from 'electron';  // eslint-disable-line
import fs from 'fs';

const filename = path.join(remote.app.getPath('userData'), '/config.json');

function retrieveConfig() {
  let buff;

  try {
    buff = fs.readFileSync(filename, { encoding: 'utf8' });
    return JSON.parse(buff);
  } catch (e) {
    return {};
  }
}

function saveConfig(data) {
  fs.writeFile(filename, JSON.stringify(data), () => {});
}

export default {
  retrieveConfig,
  saveConfig,
};

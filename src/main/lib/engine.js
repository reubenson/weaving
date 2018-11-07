/* eslint-disable */

import fs from 'fs';
// import * as fs from 'fs';
import _ from 'lodash';
import h from 'highland';
import midi from './midi';
import noteListener from '../../services/note-listener';
import noteModel from '../../services/note-model';
import through from 'through';
const base = process.env.HOME; // only works on linux?
// const base = '/Users/reubenson';
const filename = `${base}/Library/Application Support/Electron/config.json`;
const noteListeners = {};
const noteModels = {};
let config = {};

function retrieveConfig() {
  let buff;

  try {
    buff = fs.readFileSync(filename, { encoding: 'utf8' });
    return JSON.parse(buff);
  } catch (e) {
    console.log('e', e);
    return {};
  }
}

function createNoteListeners(obj) {
  _.forEach(obj, data => {
    const id = data.id;
    const item = new noteListener(data);

    noteListeners[id] = item;
  });
}

function createNoteModels(obj) {
  _.forEach(obj, data => {
    const id = data.id;
    const item = new noteModel(data);

    noteModels[id] = item;
  });
}

function handleStream(inputStream, outputStream) {
  const getNoteModelId = h.map(([channel, note, velocity]) => {
    const isNoteOn = channel >= 144 ? true : false;
    const noteListener = _.find(noteListeners, item => item.onNote === note);
    const noteModelId = _.get(noteListener, 'noteModelId');
    const noteModel = noteModels[noteModelId];
    const nextNote = noteModel.getNextNote();
    
    channel = noteModel.channel;
    return {
      channel,
      note: nextNote,
      velocity,
      isNoteOn,
    };
  });

  const sendNote = h.map(({channel, note, velocity, isNoteOn}) => {
    const offset = isNoteOn ? 144 : 128;

    return new Buffer([channel + offset - 1, note, velocity]);
  });

  const pipeline = h.pipeline(
    getNoteModelId,
    sendNote
  );

  const test = new through((data) => {
    console.log('data', data);
    return data;
  });
  
  inputStream
    .pipe(pipeline)
    // .pipe(test)
    .pipe(outputStream);
  pipeline.resume();
}

function initialize() {
  let midiInputStream, midiOutputStream;
  config = {};

  _.assign(config, retrieveConfig());
  
  createNoteListeners(config.noteListeners);
  createNoteModels(config.noteModels);

  // initialize midi ports
  if (config.inputPort && config.outputPort) {
    midiInputStream = midi.setInput(config.inputPort);
    midiOutputStream = midi.setOutput(config.outputPort);

    handleStream(midiInputStream, midiOutputStream);
  }
}

export default {
  initialize,
};

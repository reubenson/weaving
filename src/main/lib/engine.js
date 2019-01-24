/* eslint-disable */

import fs from 'fs';
import _ from 'lodash';
import h from 'highland';
import midi from './midi';
import noteListener from '../../services/note-listener';
import noteModel from '../../services/note-model';
import spatialModel from '../../services/spatial-model';
import AggregateModel from '../../services/aggregate-model';
import through from 'through';
const base = process.env.HOME; // only works on linux?
// const base = '/Users/reubenson';
const filename = `${base}/Library/Application Support/Electron/config.json`;
const noteListeners = {};
const noteModels = {};
const spatialModels = {};
let aggregateModel = new AggregateModel();
let config = {};

function retrieveConfig() {
  let buff;

  try {
    buff = fs.readFileSync(filename, { encoding: 'utf8' });
    console.log('buff', buff);
    return JSON.parse(buff);
  } catch (e) {
    console.log('e', e);
    return {};
  }
}

function createNoteListeners(obj) {
  _.forEach(obj, data => {
    const id = data.id;

    noteListeners[id] = new noteListener(data);
  });
}

function createNoteModels(obj) {
  _.forEach(obj, data => {
    const id = data.id;

    noteModels[id] = new noteModel(data, config);
  });
}

function createSpatialModels(obj) {
  _.forEach(obj, data => {
    const id = data.id;
    const models = _.filter(noteModels, item => item.spatialModelId === id);

    spatialModels[id] = new spatialModel(data);
    spatialModels[id].setNoteModels(models);
  });
}

function processMidiNoteSend({channel, note, velocity, isNoteOn}) {
  const offset = isNoteOn ? 144 : 128;

  // temp
  // velocity = 127;
  
  if (typeof channel === 'number' && typeof note === 'number') {
    // console.log('channel', channel);
    // console.log('note', note);
    // console.log('[channel + offset - 1, note, velocity]', [channel + offset - 1, note, velocity]);
    return new Buffer([channel + offset - 1, note, velocity]);
  }
}

function processDensity({velocity, isNoteOn}) {

}

function processNoteIn([channel, note, velocity]) {
  const isNoteOn = channel >= 144 ? true : false;
  const noteListener = _.find(noteListeners, item => item.onNote === note);
  const noteModelId = _.get(noteListener, 'noteModelId');
  const noteModel = noteModels[noteModelId];
  let nextNote;

  console.log('channel', channel);

  if (noteModel) {
    noteModel.update({velocity, isOn: isNoteOn});
    nextNote = noteModel.getNote();

    if (nextNote) {
      noteModel.strumCell();
    }
    
    channel = noteModel.channel;
    return {
      channel,
      note: nextNote,
      velocity,
      isNoteOn,
    };
  } else {
    console.log('noteModel not found');
    console.log('noteModelId', noteModelId);
    return { channel, note, velocity, isNoteOn };
  }
}

function generateAggregateStream(inputStream) {
  const getNoteModelId = h.map(processNoteIn);
  const aggregateStream = h.map(({channel, note, velocity, isNoteOn}) => {
    console.log('channel', channel);
    console.log('velocity', velocity);
  });
  const pipeline = h.pipeline(
    getNoteModelId
    // aggregateStream
  );

  // pipeline.resume();
  inputStream
    // .pipe(aggregateStream);
    .pipe(pipeline)
    // .pipe(aggregateStream);
}

function handleStream(inputStream, outputStream) {
  const getNoteModelId = h.map(processNoteIn);
  const sendNote = h.map(processMidiNoteSend);
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

function generateNoteStream(inputStream) {
  const noteIn = h.map(processNoteIn);
  const pipeline = h.pipeline(noteIn);

  const noteStream = inputStream.pipe(pipeline)
    // .fork()
    // .map(_.cloneDeep);
  // inputStream
    // .pipe(pipeline);
    // .through(getNoteModelId)
    // .pipe(through);
  pipeline.resume();
  noteStream.resume();

  return noteStream;

  // return noteStream.fork();
    // .fork();
}

function feedAggregateModel(inputStream) {
  const sendNote = h.map(processMidiNoteSend);
  const pipeline = h.pipeline(sendNote);
  const through = inputStream
    .fork()
    .map(_.cloneDeep)
    .pipe(pipeline);

  through.resume();
  return through;
}

function feed(inputStream, outputStream, transform) {
  transform = h.map(transform);

  inputStream
    .fork()
    .map(_.cloneDeep)
    .pipe(h.pipeline(transform))
    .pipe(outputStream);
}

function initialize() {
  let midiInputStream, midiOutputStream;
  config = {};

  console.log('calling initialize');
  _.assign(config, retrieveConfig());
  
  createNoteListeners(config.noteListeners);
  createNoteModels(config.noteModels);
  createSpatialModels(config.spatialModels);
  // aggregateModel= new AggregateModel(noteModels, config);
  aggregateModel.setNoteModels(noteModels);
  aggregateModel.configureOutputLevel(config);

  // initialize midi ports
  if (config.inputPort && config.outputPort) {
    midiInputStream = midi.setInput(config.inputPort);
    midiOutputStream = midi.setOutput(config.outputPort);

    const inputNoteStream = generateNoteStream(midiInputStream);
    
    feed(inputNoteStream, midiOutputStream, processMidiNoteSend);
    // feed(inputNoteStream, midiOutputStream, processDensity)
    
    // inputNoteStream.through(feedAggregateModel)
      // .pipe(midiOutputStream);
    // handleStream(midiInputStream, midiOutputStream);    
    // generateAggregateStream(midiInputStream, midiOutputStream);

    // instead, generate multiple input streams as needed,
    // and pipe each into midiOutputStream
    // test first by generating a timer-based input stream
    // that generates random controller values
  }
}

function start() {
  _.forEach(spatialModels, (item) => {
    item.start();
  });

  _.forEach(noteModels, (item) => {
    item.start();
  });

  aggregateModel.start();
}

function stop() {
  _.forEach(spatialModels, (item) => {
    item.stop();
  });

  _.forEach(noteModels, (item) => {
    item.stop();
  });

  aggregateModel.stop();
}

export default {
  initialize,
  start,
  stop,
};

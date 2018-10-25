/* eslint-disable */

import _ from 'lodash';
import store from '../store';

let inputs = [];
let outputs = [];
let midiInput;
let midiOutput;

function setInput(name) {
  midiInput = _.find(inputs, input => input.name === name);

  // reset listener
  if (midiInput) {
    inputs.forEach(input => input.onmidimessage = null);
    midiInput.onmidimessage = handleMidiMessage;
    console.log('listening on ', midiInput.name);
  }
}

function setOutput(name) {
  midiOutput = _.find(outputs, output => output.name === name);
}

/**
 * Parse basic information out of a MIDI message.
 */
function parseMidiMessage(message) {
  return {
    command: message.data[0] >> 4,
    channel: message.data[0] & 0xf,
    note: message.data[1],
    velocity: message.data[2]
  }
}

function onNote(noteValue, velocity) {
  if (velocity > 0) {
    store.commit('HANDLE_NOTE_ON', { noteValue, velocity });
  } else {
    store.commit('HANDLE_NOTE_OFF', { noteValue });
  }
}

function onPad(pad, velocity) {}
function onPitchBend(value) {}
function onModWheel(value) {}

/**
 * Handle a MIDI message from a MIDI input.
 */
function handleMidiMessage(message) {
  // Parse the MIDIMessageEvent.
  const { command, channel, note, velocity } = parseMidiMessage(message);

  // Stop command.
  // Negative velocity is an upward release rather than a downward press.
  if (command === 8) {
    if      (channel === 0) onNote(note, -velocity);
    else if (channel === 9) onPad(note, -velocity);
  }

  // Start command.
  else if (command === 9) {
    if      (channel === 0) onNote(note, velocity);
    else if (channel === 9) onPad(note, velocity);
  }

  // Knob command.
  else if (command === 11) {
    if (note === 1) onModWheel(velocity);
  }

  // Pitch bend command.
  else if (command === 14) {
    onPitchBend(velocity);
  }
}

function getPortNames() {
  return window.navigator.requestMIDIAccess()
    .then((access) => {
      access.inputs.forEach(entry => inputs.push(entry));
      access.outputs.forEach(entry => outputs.push(entry));

      return { 
        inputs: inputs.map(input => input.name),
        outputs: outputs.map(output => output.name),
      };
    });
}

function noteOn(channel, note, velocity) {
  const status = 144 + channel - 1;

  midiOutput.send([status, note, velocity]);
}

function noteOff(channel, note, velocity) {
  const status = 128 + channel;

  midiOutput.send([status, note, velocity]);
}

// controllerNumber must be 0 to 119
function sendControlChange(channel, controllerNumber, controllerValue) {
  if (typeof channel !== 'number') {
    console.error('channel not specified');
    return;
  }

  if (typeof controllerNumber !== 'number') {
    console.error('controllerNumber not specified');
    return;
  }

  if (typeof controllerValue !== 'number') {
    console.error('controllerValue not specified');
    return;
  }

  if (!midiOutput) {
    console.error('midi output not specified');
    return;
  }

  midiOutput.send([176 + channel - 1, controllerNumber, controllerValue ]);
}

export default {
  getPortNames,
  setInput,
  setOutput,
  noteOn,
  noteOff,
  sendControlChange,
};

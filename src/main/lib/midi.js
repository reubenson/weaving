/* eslint-disable */
import midi from 'midi';
import _ from 'lodash';
import Buffer from 'buffer';

const input = new midi.input(); // eslint-disable-line
const output = new midi.output(); // eslint-disable-line

function setInput(name) {
  const inputPortCount = input.getPortCount();

  for (let i = 0; i < inputPortCount; i++) {
    const portName = input.getPortName(i);

    if (name === portName) {
      console.log('opening input port', name);
      input.openPort(i);

      return midi.createReadStream(input);
    }
  }
}

function setOutput(name) {
  const outputPortCount = output.getPortCount();

  for (let i = 0; i < outputPortCount; i++) {
    const portName = output.getPortName(i);

    if (name === portName) {
      console.log('opening output port', name);
      output.openPort(i);

      return midi.createWriteStream(output);
    }
  }
}


function sendNoteOff(channel, note, velocity) {
  const status = 128 + channel;

  output.sendMessage([status, note, velocity]);
}

function sendNoteOn(channel, note, velocity) {
  if (channel === 1) {
    console.log('note send', note);
  }
  output.sendMessage([144 + channel - 1, note, velocity ]);
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

  if (!output) {
    console.error('midi output not specified');
    return;
  }

  // console.log('[176 + channel - 1, controllerNumber, controllerValue ]', [176 + channel - 1, controllerNumber, controllerValue ]);
  output.sendMessage([176 + channel - 1, controllerNumber, controllerValue ]);
}

export default {
  setInput,
  setOutput,
  sendControlChange,
  sendNoteOff,
  sendNoteOn,
};

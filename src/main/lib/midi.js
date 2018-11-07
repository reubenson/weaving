/* eslint-disable */
import midi from 'midi';
import _ from 'lodash';
import Buffer from 'buffer';

const input = new midi.input(); // eslint-disable-line
const output = new midi.output(); // eslint-disable-line
// const inputPortCount = input.getPortCount();
// const outputPortCount = output.getPortCount();

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

export default {
  setInput,
  setOutput,
};

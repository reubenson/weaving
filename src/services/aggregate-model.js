import _ from 'lodash';
import midi from '../main/lib/midi';
import BufferTimer from '../renderer/lib/buffer-timer';

function aggregateModel() {
  // this.noteModels = noteModels;
  // this.velocityController = outputLevelController;
  // _.assign(this, props);
}

aggregateModel.prototype = {
  start() {
    // const lfoSpeed = 0.1; // Hz
    // const period = 1000 / lfoSpeed; // ms

    this.velocityTracker = new BufferTimer();

    this.velocityTracker.setInterval((buffer) => {
      // const now = Date.now();
      const velocities = _.map(this.noteModels, item => item.velocity);
      const val = _.max(velocities);

      buffer.pop();
      buffer.unshift(val);
      const level = Math.round(_.mean(buffer));

      // console.log('level', level);

      // this.noteModels.forEach((model, index) => {
      // const phaseOffset = period * (index / this.noteModels.length);
      // let val = ((now + phaseOffset) % period) / period;

      // normalize to MIDI range
      // val = Math.round(val * 127);
      midi.sendControlChange(this.velocityChannel, this.velocityController, level);
      // });
    });
  },
  stop() {
    this.velocityTracker.clearInterval();
  },
  setNoteModels(noteModels) {
    this.noteModels = noteModels;
  },
  configureOutputLevel({ outputLevelChannel, outputLevelController }) {
    this.velocityController = outputLevelController;
    this.velocityChannel = outputLevelChannel;
  },
};

export default aggregateModel;

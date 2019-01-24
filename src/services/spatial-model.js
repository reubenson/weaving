import _ from 'lodash';
import midi from '../main/lib/midi';
import BufferTimer from '../renderer/lib/buffer-timer';

function spatialModel(props) {
  _.assign(this, props);
}

spatialModel.prototype = {
  start() {
    const lfoSpeed = 0.1; // Hz
    const period = 1000 / lfoSpeed; // ms

    this.spinTracker = new BufferTimer();

    this.spinTracker.setInterval(() => {
      const now = Date.now();

      this.noteModels.forEach((model, index) => {
        const phaseOffset = period * (index / this.noteModels.length);
        let val = ((now + phaseOffset) % period) / period;

        // normalize to MIDI range
        val = Math.round(val * 127);
        midi.sendControlChange(model.channel, this.controller, val);
      });
    });
  },
  stop() {
    this.spinTracker.clearInterval();
  },
  setNoteModels(noteModels) {
    this.noteModels = noteModels;
  },
};

export default spatialModel;

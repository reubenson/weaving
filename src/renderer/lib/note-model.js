import _ from 'lodash';
import store from '../store';
import midi from './midi';

function shouldSendNoteOn({ velocityThreshold }, velocity) {
  return velocity >= velocityThreshold;
}

function sendNoteOn(note, velocity) {
  const noteProcessor = _.find(store.state.Config.noteProcessors, item => item.onNote === note);
  const id = _.get(noteProcessor, 'id');
  const channel = _.get(noteProcessor, 'channel');

  if (_.isNumber(id) && shouldSendNoteOn(noteProcessor, velocity)) {
    midi.noteOn(channel, 80, velocity);
    store.commit('UPDATE_NOTE_PROCESSOR', {
      id,
      isOn: true,
      velocity,
    });
  }
}

function sendNoteOff(note) {
  const noteProcessor = _.find(store.state.Config.noteProcessors, item => item.onNote === note);
  const id = _.get(noteProcessor, 'id');
  const channel = _.get(noteProcessor, 'channel');

  if (_.isNumber(id)) {
    midi.noteOff(channel, 80);
    store.commit('UPDATE_NOTE_PROCESSOR', {
      channel,
      isOn: false,
    });
  }
}

export default {
  sendNoteOn,
  sendNoteOff,
};

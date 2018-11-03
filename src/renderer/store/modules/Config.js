import Vue from 'vue';
import _ from 'lodash';
import nanoid from 'nanoid/generate';
import datastore from '../../datastore';
import noteNames from '../../lib/noteNames';
import eventBus from '../../lib/eventBus';

function genID() {
  return nanoid('abcdefghijklmnopqrstuvwxyz', 6);
}

const state = {
  showConfigurationEdit: true,
  inputPort: '',
  outputPort: '',
  noteListeners: {},
  noteModels: {},
  outputLevelChannel: 1,
  outputLevelController: 1,
  noteListenerSettings: {
    velocity: '',
    spin: '',
  },
};

const bootstrap = {
  noteListener: {
    id: '',
    onNote: 36,
    channel: 1,
    isOn: false,
    velocity: 0,
    velocityThreshold: 0,
    noteModelId: '',
  },
  noteModel: {
    id: '',
    channel: 1,
    velocity: 0,
    name: '',
    generator: '',
    scale: '',
    tonic: '',
  },
};

function getUnassignedChannel(assignedChannels) {
  const allChannels = _.times(16, i => i + 1);

  return allChannels.find(item => assignedChannels.indexOf(item) < 0);
}

function getUnassignedOnNote(assignedOnNotes) {
  const allOnNotes = Object.keys(noteNames).map(item => parseInt(item, 10));

  return allOnNotes.find(item => assignedOnNotes.indexOf(item) < 0);
}

function getNoteModelById(id) {
  return state.noteModels[id];
}

function getNoteListenerByNote(note) {
  return _.find(state.noteListeners, item => item.onNote === note);
}

const getters = {
  showConfigurationEdit(state) {
    return state.showConfigurationEdit;
  },
  noteListenerSettings(state) {
    return state.noteListenerSettings;
  },
  listenersCount(state) {
    return state.noteListeners.length;
  },
  channels(state) {
    return _.map(state.noteListeners, item => parseInt(item.channel, 10));
  },
  onNotes(state) {
    return _.map(state.noteListeners, item => parseInt(item.onNote, 10));
  },
  models(state) {
    return state.noteModels;
  },
  modelNames(state) {
    return _.map(state.noteModels, item => item.name);
  },
  getNoteListener(state) {
    return id => _.find(state.noteListeners, (item => id === item.id));
  },
  getNoteModel() {
    return id => getNoteModelById(id);
  },
  maxLevel(state) {
    const onNotes = _.filter(state.noteListeners, item => item.isOn);
    const velocities = _.map(onNotes, item => item.velocity);

    return _.max(velocities) || 0;
  },
};

const actions = {
  retrieveConfig({ commit }) {
    const config = datastore.retrieveConfig();
    commit('UPDATE_CONFIG', config);
  },
  saveConfig() {
    datastore.saveConfig({
      inputPort: state.inputPort,
      outputPort: state.outputPort,
      noteListenerSettings: state.noteListenerSettings,
      noteListeners: state.noteListeners,
      noteModels: state.noteModels,
      outputLevelChannel: state.outputLevelChannel,
      outputLevelController: state.outputLevelController,
    });
  },
};

const mutations = {
  HANDLE_NOTE_ON(state, { noteValue, velocity }) {
    const noteListener = getNoteListenerByNote(noteValue);
    const noteModelId = noteListener && noteListener.noteModelId;
    const noteModel = noteModelId && getNoteModelById(noteModelId);

    if (noteListener && velocity >= noteListener.velocityThreshold) {
      Vue.set(noteListener, 'isOn', true);
      Vue.set(noteListener, 'velocity', velocity);

      if (noteModel) {
        eventBus.emit('note-model:trigger-on', noteModel.id, velocity);
      }
    }
  },
  // does NOTE_OFF need to be specific to a velocity value?
  HANDLE_NOTE_OFF(state, { noteValue }) {
    const noteListener = getNoteListenerByNote(noteValue);
    const noteModel = noteListener && noteListener.model && getNoteModelById(noteListener.model.id);

    Vue.set(noteListener, 'isOn', false);
    Vue.set(noteListener, 'velocity', 0);

    if (noteModel) {
      eventBus.emit('note-model:trigger-on', noteModel.id);
    }
  },
  RESET_NOTE_MODEL(state, id) {
    const noteModel = getNoteModelById(id);

    if (noteModel) {
      Vue.set(noteModel, 'receiveNoteOff', false);
    }
  },

  // should probably use normalizr
  UPDATE_CONFIG(state, data) {
    const keys = Object.keys(data);

    keys.forEach((key) => {
      const val = data[key];

      if (typeof val === 'object') {
        _.forEach(val, (val2, key2) => {
          Vue.set(state[key], key2, val2);
        });
      } else {
        Vue.set(state, key, val);
      }
    });
    actions.saveConfig();
  },
  ADD_NOTE_LISTENER(state) {
    const noteListener = _.clone(bootstrap.noteListener);
    const assignedChannels = _.map(state.noteListeners, (item => item.channel));
    const assignedOnNotes = _.map(state.noteListeners, (item => item.onNote));

    noteListener.id = genID();
    noteListener.channel = getUnassignedChannel(assignedChannels);
    noteListener.onNote = getUnassignedOnNote(assignedOnNotes);

    Vue.set(state.noteListeners, noteListener.id, noteListener);
  },
  UPDATE_NOTE_LISTENER(state, data) {
    const id = _.get(data, 'id');
    const noteListener = getters.getNoteListener(id);
    const keys = Object.keys(data).filter(key => key !== 'id');

    if (noteListener) {
      keys.forEach((key) => {
        // Vue.set(state.noteListeners[index], key, data[key]);
        _.set(state.noteListeners[id], key, data[key]);
      });
    }
  },
  REMOVE_NOTE_LISTENER(state, id) {
    Vue.delete(state.noteListeners, id);
  },

  ADD_NOTE_MODEL(state) {
    const noteModel = _.clone(bootstrap.noteModel);
    const assignedChannels = _.map(state.noteModels, item => item.channel);

    noteModel.id = genID();
    noteModel.channel = getUnassignedChannel(assignedChannels);
    noteModel.name = `${noteModel.id}`;

    Vue.set(state.noteModels, noteModel.id, noteModel);
  },
  UPDATE_NOTE_MODEL(state, data) {
    const id = _.get(data, 'id');
    const keys = Object.keys(data).filter(key => key !== 'id');
    const noteModel = getNoteModelById(id);

    if (noteModel) {
      keys.forEach(key => _.set(noteModel, key, data[key]));
    }
    actions.saveConfig();
  },
  REMOVE_NOTE_MODEL(state, id) {
    Vue.delete(state.noteModels, id);
    actions.saveConfig();
  },
  SET_INPUT_PORT(state, port) {
    state.inputPort = port;
  },
  SET_OUTPUT_PORT(state, port) {
    state.outputPort = port;
  },
};

// refactor this into separate file
// const modules = {
//   noteProcessor: {
//     state: {
//       channel: '',
//       onNote: '',
//       isOn: false,
//     },
//   },
// };

export default {
  state,
  mutations,
  actions,
  getters,
  // modules,
};

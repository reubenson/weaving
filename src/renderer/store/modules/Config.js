import Vue from 'vue';
import _ from 'lodash';
import datastore from '../../datastore';
import noteNames from '../../lib/noteNames';

const state = {
  showConfigurationEdit: true,
  inputPort: '',
  outputPort: '',
  noteProcessors: [],
  noteModels: [],
  outputLevelChannel: 1,
  outputLevelController: 1,
  noteProcessorSettings: {
    velocity: '',
    spin: '',
  },
};

const bootstrap = {
  id: 0,
  onNote: 36,
  channel: 1,
  isOn: false,
  velocity: 0,
  velocityThreshold: 0,
  model: '',
  generator: '',
  scale: '',
};

bootstrap.noteModel = {
  id: 0,
  channel: 1,
  velocity: 0,
  name: '',
  receiveNoteOn: 0, // set to note velocity
  receiveNoteOff: false,
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
  return _.find(state.noteModels, item => item.id === id);
}

function getNoteListenerByNote(note) {
  return _.find(state.noteProcessors, item => item.onNote === note);
}

const mutations = {
  HANDLE_NOTE_ON(state, { noteValue, velocity }) {
    const noteListener = getNoteListenerByNote(noteValue);
    const noteModel = noteListener && noteListener.model && getNoteModelById(noteListener.model.id);

    if (noteListener && velocity >= noteListener.velocityThreshold) {
      Vue.set(noteListener, 'isOn', true);
      Vue.set(noteListener, 'velocity', velocity);

      if (noteModel) {
        Vue.set(noteModel, 'receiveNoteOn', velocity);
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
      Vue.set(noteModel, 'receiveNoteOff', false);
    }
  },
  TRIGGER_NOTE_MODEL(state, { id, velocity }) {
    const noteModel = getNoteModelById(id);

    if (noteModel) {
      Vue.set(noteModel, 'receiveNoteOn', velocity);
    }
  },
  UNTRIGGER_NOTE_MODEL(state, id) {
    const noteModel = getNoteModelById(id);

    if (noteModel) {
      Vue.set(noteModel, 'receiveNoteOn', 0);
    }
  },
  RESET_NOTE_MODEL(state, id) {
    const noteModel = getNoteModelById(id);

    if (noteModel) {
      Vue.set(noteModel, 'receiveNoteOff', false);
    }
  },
  UPDATE_CONFIG(state, data) {
    _.merge(state, data);
  },
  UPDATE_NOTE_MODEL(state, data) {
    const id = _.get(data, 'id');
    const channel = _.get(data, 'channel');
    let noteModel;
    let index;

    if (typeof id === 'number') {
      index = _.findIndex(state.noteModels, item => item.id === id);
    } else if (typeof channel === 'number') {
      index = _.findIndex(state.noteModels, item => item.channel === channel);
    }

    if (typeof index === 'number') {
      noteModel = state.noteModels[index];
      _.assign(noteModel, data);
      Vue.set(state.noteModels, index, noteModel);
    }
  },
  UPDATE_NOTE_PROCESSOR(state, data) {
    const id = _.get(data, 'id');
    const channel = _.get(data, 'channel');
    let noteProcessor;
    let index;

    if (typeof id === 'number') {
      index = _.findIndex(state.noteProcessors, item => item.id === id);
    } else if (typeof channel === 'number') {
      index = _.findIndex(state.noteProcessors, item => item.channel === channel);
    }

    if (typeof index === 'number') {
      noteProcessor = state.noteProcessors[index];
      _.assign(noteProcessor, data);
      Vue.set(state.noteProcessors, index, noteProcessor);
    }
  },
  ADD_NOTE_PROCESSOR(state) {
    const noteProcessor = _.clone(bootstrap);
    const assignedChannels = state.noteProcessors.map(item => item.channel);
    const assignedOnNotes = state.noteProcessors.map(item => item.onNote);

    noteProcessor.id = Date.now();
    noteProcessor.channel = getUnassignedChannel(assignedChannels);
    noteProcessor.onNote = getUnassignedOnNote(assignedOnNotes);

    state.noteProcessors.push(noteProcessor);
  },
  ADD_NOTE_MODEL(state) {
    const noteModel = _.clone(bootstrap.noteModel);
    const assignedChannels = state.noteModels.map(item => item.channel);

    noteModel.id = Date.now();
    noteModel.channel = getUnassignedChannel(assignedChannels);
    noteModel.name = `Model ${noteModel.id}`;

    state.noteModels.push(noteModel);
  },
  REMOVE_NOTE_PROCESSOR(state, channel) {
    const index = _.findIndex(state.noteProcessors, item => item.channel === channel);
    state.noteProcessors.splice(index, 1);
  },
  REMOVE_NOTE_MODEL(state, id) {
    const index = _.findIndex(state.noteModels, item => item.id === id);
    state.noteModels.splice(index, 1);
  },
  SET_INPUT_PORT(state, port) {
    state.inputPort = port;
  },
  SET_OUTPUT_PORT(state, port) {
    state.outputPort = port;
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
      noteProcessorSettings: state.noteProcessorSettings,
      noteProcessors: state.noteProcessors,
      noteModels: state.noteModels,
      outputLevelChannel: state.outputLevelChannel,
      outputLevelController: state.outputLevelController,
    });
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

const getters = {
  showConfigurationEdit(state) {
    return state.showConfigurationEdit;
  },
  noteProcessorSettings(state) {
    return state.noteProcessorSettings;
  },
  processorsCount(state) {
    return state.noteProcessors.length;
  },
  channels(state) {
    return _.map(state.noteProcessors, item => parseInt(item.channel, 10));
  },
  onNotes(state) {
    return _.map(state.noteProcessors, item => parseInt(item.onNote, 10));
  },
  models(state) {
    return state.noteModels;
  },
  getNoteProcessor(state) {
    return id => state.noteProcessors.find(item => id === item.id);
  },
  getNoteModel(state) {
    return id => state.noteModels.find(item => id === item.id);
  },
  maxLevel(state) {
    const onNotes = _.filter(state.noteProcessors, item => item.isOn);
    const velocities = _.map(onNotes, item => item.velocity);

    return _.max(velocities) || 0;
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
  // modules,
};

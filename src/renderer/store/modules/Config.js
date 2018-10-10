import _ from 'lodash';
import datastore from '../../datastore';
import noteNames from '../../lib/noteNames';

const state = {
  showConfigurationEdit: false,
  inputPort: '',
  outputPort: '',
  noteProcessors: [],
  outputLevelChannel: '',
  outputLevelController: '',
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
};

function getUnassignedChannel(assignedChannels) {
  const allChannels = _.times(16, i => i + 1);

  return allChannels.find(item => assignedChannels.indexOf(item) < 0);
}

function getUnassignedOnNote(assignedOnNotes) {
  const allOnNotes = Object.keys(noteNames).map(item => parseInt(item, 10));

  return allOnNotes.find(item => assignedOnNotes.indexOf(item) < 0);
}

const mutations = {
  UPDATE_CONFIG(state, data) {
    _.merge(state, data);
  },
  UPDATE_NOTE_PROCESSOR(state, data) {
    const id = _.get(data, 'id');
    const channel = _.get(data, 'channel');
    let index;

    if (typeof id === 'number') {
      index = _.findIndex(state.noteProcessors, item => item.id === id);
    } else if (typeof channel === 'number') {
      index = _.findIndex(state.noteProcessors, item => item.channel === channel);
    }

    if (typeof index === 'number') {
      _.assign(state.noteProcessors[index], data);
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
  REMOVE_NOTE_PROCESSOR(state, channel) {
    const index = _.findIndex(state.noteProcessors, item => item.channel === channel);
    state.noteProcessors.splice(index, 1);
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
  getNoteProcessor(state) {
    return id => state.noteProcessors.find(item => id === item.id);
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

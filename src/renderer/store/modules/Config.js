import _ from 'lodash';
import datastore from '../../datastore';

const state = {
  inputPort: '',
  outputPort: '',
};

const mutations = {
  SET_INPUT_PORT(state, port) {
    state.inputPort = port;
    // console.log('state.inputPort', state.inputPort);
    // this.$db.saveConfig({
    //   inputPort: port
    // });
  },
  SET_OUTPUT_PORT(state, port) {
    state.outputPort = port;
    // console.log('state.outputPort', state.outputPort);
  },
  SET_CONFIG(state, config) {
    _.assign(state, config);
  },
};

const actions = {
  retrieveConfig({ commit }) {
    const config = datastore.retrieveConfig();
    console.log('config', config);
    commit('SET_CONFIG', config);
  },
  saveConfig() {
    datastore.saveConfig({
      inputPort: state.inputPort,
      outputPort: state.outputPort,
    });
  },
};

export default {
  state,
  mutations,
  actions,
};

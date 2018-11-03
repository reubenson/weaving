import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';
import db from './datastore';
import eventBus from '../renderer/lib/eventBus';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// init event bus
Vue.prototype.$eventBus = eventBus;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

Vue.prototype.$db = db;

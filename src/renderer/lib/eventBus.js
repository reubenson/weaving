import Vue from 'vue';
const bus = new Vue();

export default {
  emit(eventName, a, b) {
    console.log('eventName', eventName);
    bus.$root.$emit(eventName, a, b);
  },
  on(eventName, callback) {
    console.log('callback', callback);
    bus.$root.$on(eventName, callback);
  },
  // emit: (bus.$root.$emit),
  // on: bus.$root.$on,
};

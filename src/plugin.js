import Tags from './components/Tags.vue';

module.exports = {
  install: function (Vue, options) {
    Vue.component('vue-tags', Tags);
  }
};

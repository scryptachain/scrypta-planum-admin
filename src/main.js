import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import './assets/style.scss'
import Gravatar from 'vue-gravatar';
Vue.config.productionTip = false
Vue.component('v-gravatar', Gravatar);
Vue.use(Buefy, {
  defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas',
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

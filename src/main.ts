import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import 'buefy/dist/buefy.css'
import VueCompositionAPI from '@vue/composition-api'
import Notifications from 'vue-notification'
import Buefy from 'buefy';

import { library } from '@fortawesome/fontawesome-svg-core';
// internal icons
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(fas);
Vue.component('vue-fontawesome', FontAwesomeIcon);
Vue.use(Notifications)
Vue.use(VueCompositionAPI)
Vue.use(Buefy, {
  defaultIconComponent: "vue-fontawesome",
  defaultIconPack: "fas",
  customIconPacks: {
    fas: {
      sizes: {
        default: "lg",
        "is-small": "1x",
        "is-medium": "2x",
        "is-large": "3x"
      },
      iconPrefix: ""
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
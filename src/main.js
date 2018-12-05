import Vue from 'vue'
import App from './App.vue'
import { TokenService } from './services/token.service'
import ApiService from './services/api.service'

ApiService.init(process.env.VUE_APP_ROOT_API)

if (TokenService.getToken()) {
  ApiService.setHeader()
}

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

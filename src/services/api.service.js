import axios from 'axios'
import { TokenService } from './token.service'
import { store } from '../store'

const ApiService = {

  _401interceptor: null,

  init(baseURL) {
    axios.defaults.baseURL = baseURL
  },

  setHeader() {
    axios.defaults.headers.common['Authorization'] = `Bearer ${TokenService.getToken()}`
  },

  removeHeader() {
    axios.defaults.headers.common = {}
  },

  get(resource) {
    return axios.get(resource)
  },

  post(resource, data) {
    return axios.post(resource, data)
  },

  put(resource, data) {
    return axios.put(resource, data)
  },

  delete(resource) {
    return axios.delete(resource)
  },

  mount401Interceptor() {
    this._401interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.request.status === 401) {
          if (error.config.url.includes('/o/token/')) {
            // Refresh token has failed. Logout the user
            store.dispatch('auth/logout')
            throw error
          } else {
            // Refresh access token
            try {
              await store.dispatch('auth/refreshToken')
              // Retry original request
              return this.customRequest({
                method: error.config.method,
                url: error.config.url,
                data: error.config.data
              })
            } catch (e) {
              throw error
            }
          }
        }
        throw error
      }
    )
  },

  unmount401Interceptor() {
    // Eject the interceptor
    axios.interceptors.response.eject(this._401interceptor)
  },

  // Perform a custom Axios request,
  // `data` is an object containing following properties:
  // - method
  // - url
  // - data ... request payload
  // - auth (optional)
  //   - username
  //   - password
  customRequest(data) {
    return axios(data)
  }
}

export default ApiService

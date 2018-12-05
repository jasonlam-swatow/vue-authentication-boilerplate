import { UserService, AuthenticationError } from '../services/user.service'
import { TokenService } from '../services/token.service'
import router from '../router'

const state = {
  authenticating: false,
  accessToken: TokenService.getToken(),
  authenticatingErrorCode: 0,
  authenticationError: '',
  refreshTokenPromise: null
}

const getters = {
  loggedIn: state => state.accessToken ? true : false,
  authenticatingErrorCode: state => state.authenticatingErrorCode,
  authenticationError: state => state.authenticationError,
  authenticating: state => state.authenticating
}

const actions = {
  async login({ commit }, { email, password }) {
    commit('loginRequest')

    try {
      const token = await UserService.login(email, password)
      commit('loginSuccess', token)

      router.push(router.history.current.query.redirect || '/')

      return true
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit('loginError', { errorCode: e.errorCode, errorMessage: e.message })
      }

      return false
    }
  },

  logout({ commit }) {
    UserService.logout()
    commit('logoutSuccess')
    router.push('/login')
  },

  refreshToken({ commit, state }) {
    // If this is the first time the refreshToken has been called, make a request
    // otherwise return the same promise to the caller
    if(!state.refreshTokenPromise) {
      const p = UserService.refreshToken()
      commit('refreshTokenPromise', p)

      // Wait for the UserService.refreshToken() to resolve. On success set the token and clear promise
      // Clear the promise on error as well.
      p.then(
        response => {
          commit('refreshTokenPromise', null)
          commit('loginSuccess', response)
        },
        error => {
          commit('refreshTokenPromise', null)
        }
      )
    }

    return state.refreshTokenPromise
  }
}

const mutations = {
  loginRequest(state) {
    state.authenticating = true
    state.authenticatingError = ''
    state.authenticatingErrorCode = 0
  },

  loginSuccess(state, accessToken) {
    state.accessToken = accessToken
    state.authenticating = false
  },

  loginError(state, { errorCode, errorMessage }) {
    state.authenticating = false
    state.authenticationErrorCode = errorCode
    state.authenticationError = errorMessage
  },

  logoutSuccess(state) {
    state.accessToken = ''
  },

  refreshTokenPromise(state, promise) {
    state.refreshTokenPromise = promise
  }
}

export const auth = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

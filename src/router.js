import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import LoginView from './views/LoginView.vue'
import { TokenService } from './services/token.service'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    name: 'home',
    component: Home
  }, {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true, onlyWhenLoggedOut: true }
  }, {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
  }]
})

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public)
  const onlyWhenLoggedOut = to.matched.some(record => record.meta.onlyWhenLoggedOut)
  const loggedIn = !!TokenService.getToken()

  if (!isPublic && !loggedIn) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }  // Store the full path to redirect to after logged in
    })
  }

  // Do not allow user to visit login page if logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next('/')
  }

  next()
})

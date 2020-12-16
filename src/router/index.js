import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

const About = () => import(/* webpackChunkName: "about" */ '../views/About.vue')
const Login = () => import(/* webpackChunkName: "about" */ '../views/Login')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/agoraRTC',
    name: 'AgoraRTC',
    component: () => import('../views/AgoraRTC')
  },
  {
    path: '/agoraRTM',
    name: 'AgoraRTM',
    component: () => import('../views/AgoraRTM')
  },
  {
    path: '/boardClient',
    name: 'BoardClient',
    component: () => import('../views/BoardClient')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

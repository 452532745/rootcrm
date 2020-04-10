import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import VueLazyload from 'vue-lazyload'
import VueClipboard from 'vue-clipboard2'

//Import Froala Editor 
import 'froala-editor/js/plugins.pkgd.min.js';
//Import third party plugins
import 'froala-editor/js/third_party/embedly.min';
import 'froala-editor/js/third_party/font_awesome.min';
import 'froala-editor/js/third_party/spell_checker.min';
import 'froala-editor/js/third_party/image_tui.min';
// Import Froala Editor css files.
import 'froala-editor/css/froala_editor.pkgd.min.css';
// Import and use Vue Froala lib.
import VueFroala from 'vue-froala-wysiwyg'

import App from './App'
import routes from './router'
import store from './store/'

Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.use(VueFroala);
Vue.use(VueClipboard);
Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.use(VueLazyload, {
  preLoad: 1.3,
  loading: require('./assets/images/loading.gif'),
  attempt: 1,
  listenEvents: ['scroll']
});

const router = new VueRouter({
  scorllBehavior: () => ({
    y: 0
  }),
  routes
});

axios.defaults.baseURL = process.env.API_ROOT;

axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded'
/*axios.defaults.baseURL = (process.env.NODE_ENV !=='production' ? config.dev.httpUrl:config.build.httpUrl);
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';*/

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (localStorage.JWT_TOKEN) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.Authorization = `token ${localStorage.JWT_TOKEN}`
    }
    return config
  },
  err => {
    return Promise.reject(err)
  })

// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          store.commit('LOG_OUT')
          router.replace({
            path: '/login',
            query: { redirect: router.currentRoute.fullPath }
          })
          console.log('非法访问，请重试！')
      }
    }
    return Promise.reject(error.response.data)   // 返回接口返回的错误信息
  })


// 处理刷新的时候vuex被清空但是用户已经登录的情况
if (window.sessionStorage.userInfo) {
  store.dispatch('setUserInfo', JSON.parse(window.sessionStorage.userInfo));
}

// JWT 用户权限校验，判断 TOKEN 是否在 localStorage 当中
router.beforeEach((to, from, next) => {
  // 获取 JWT Token
  if (to.meta.requiresAuth) {
    // 判断该路由是否需要登录权限
    if (localStorage.getItem('JWT_TOKEN')) {
      // 通过获取当前的token是否存在
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
        // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})

const vm = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

export default vm
// 引入 api 接口
import * as types from './mutation-types'

export default {
  [types.REQUEST_QUESTION_LIST](state, action) {
    // 获取mock数据
    let data = JSON.stringify(action.naire)
    state.naire = JSON.parse(data)
  },
  [types.CREATE_NEW_NAIRE](state, data) {
    // state.naire = data.naire
    state.naire = { ...state.naire, ...data.naire }
  },
  [types.SAVE_NEW_NAIRE](state, data) {
    // state.naire = action.naire
    state.naire = { ...state.naire, ...data.naire }
  },
  [types.ADD_NEW_QUESTION](state, action) {
    state.naire.topic.push(action.topic)
  },
  [types.DEL_QUESTION](state, index) {
    state.naire.topic.splice(index, 1)
  },
  [types.DEL_OPTION](state, data) {
    state.naire.topic[data.index].options.splice(data.opIndex, 1)
  },
  [types.CHANGE_STATUS](state, data) {
    state.status = data
  },
  [types.CHANGE_NAIRE_STATUS](state, data) {
    state.naire.status = data
  },
  [types.UPDATE_TITLE](state, data) {
    // state.title = data
    state.naire = { ...state.naire, title: data }
  },
  [types.UPDATE_INTRO](state, data) {
    // state.intro = data
    state.naire = { ...state.naire, intro: data }
  },
  [types.UPDATE_DEADLINE](state, data) {
    // state.deadline = data
    state.naire = { ...state.naire, deadline: data }
  },
  [types.USER_LOGIN](state, payload) {
    state.isAdmin = payload.isAdmin
    state.user_data = payload.user[0]
    localStorage.setItem('USER_CODE', payload.user[0].user_code)
    localStorage.setItem('USER_ID', payload.user[0].user_id)
    localStorage.setItem('USER_NAME', payload.user[0].user_name)
    localStorage.setItem('USER_PERMISSION', payload.user[0].user_permission)
    localStorage.setItem('DEPARTMENT_ID', payload.user[0].department_id)
    localStorage.setItem('JWT_TOKEN', payload.token)
  },
  [types.LOG_OUT](state) {
    state.isAdmin = false
    state.user_data = {}
    localStorage.removeItem('USER_CODE')
    localStorage.removeItem('USER_ID')
    localStorage.removeItem('USER_NAME')
    localStorage.removeItem('USER_PERMISSION')
    localStorage.removeItem('DEPARTMENT_ID')
    localStorage.removeItem('JWT_TOKEN')
    localStorage.removeItem('NUM')
  },
  [types.HANDLE_ASIDE](state) {
    state.isAsideHidden == 'asideNotHidden' ? state.isAsideHidden = 'asideHidden' : state.isAsideHidden = 'asideNotHidden'
  },
  [types.SHOW_APP](state) {
    state.isNavShow = true
  },
  [types.HIDDEN_APP](state) {
    state.isNavShow = false
  }
}
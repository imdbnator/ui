/*
Todo
  - Need to add dismiss option and functionality
 */
import cloneDeep from 'lodash.clonedeep'
import {randomNumber} from 'modules/utils'

const initial = {
  global: []
}

let notificationCount = 0

export default function reducer (store = initial, action) {
  notificationCount++
  switch (action.type) {
    case 'ADD_GLOBAL_NOTIFY':
      store = cloneDeep(store)
      store.global = [{
        title: action.payload.title,
        message: action.payload.message,
        activeClassName: action.payload.type,
        key: notificationCount,
        action: false,
        dismissAfter: (action.payload.type === 'error') ? 4000 : 4000
      }]
      break
    case 'REMOVE_GLOBAL_NOTIFY':
      store = cloneDeep(store)
      store.global.filter(notification => notification.key !== action.payload.key)
    default:
  }
  return store
}

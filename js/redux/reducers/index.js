import { combineReducers } from 'redux'

import notify from 'reducers/notify'
import fetch from 'reducers/fetch'
import settings from 'reducers/settings'

export default combineReducers({
  fetch,
  notify,
  settings
})

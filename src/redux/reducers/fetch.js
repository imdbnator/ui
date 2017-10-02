import {formatCollection} from 'modules/collection'

const inital = {
  collection: {}
}

export default function reducer (store = inital, action) {
  switch (action.type) {
    case 'PARSE_COLLECTION':
      store = {...store}
      store.collection = formatCollection(action.payload.collection)
      break
    case 'PROCESS_COLLECTION':
      break
    default:
  }
  return store
}

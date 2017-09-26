function globalNotify ({title, message, type}) {
  return {
    type: 'ADD_GLOBAL_NOTIFY',
    payload: {title, message, type}
  }
}

function removeGlobalNotify (key) {
  return {
    type: 'REMOVE_GLOBAL_NOTIFY',
    payload: {key}
  }
}

module.exports = {
  globalNotify,
  removeGlobalNotify
}

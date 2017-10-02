const isEmpty = require('lodash.isempty')
const includes = require('lodash.includes')

function pushOwns(id){
  const owns = !isEmpty(localStorage.getItem('owns')) ? JSON.parse(localStorage.getItem('owns')) : []
  if (!includes(owns, id)) owns.push(id)
  localStorage.setItem('owns', JSON.stringify(owns))
  return true
}

function checkOwns(id){
  const owns = localStorage.getItem('owns')
  const doesOwn = !isEmpty(owns) && includes(JSON.parse(owns), id)
  return doesOwn
}

module.exports = {
  pushOwns,
  checkOwns
};

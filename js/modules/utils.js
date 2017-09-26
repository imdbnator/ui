/*
Todo
  - Add a way to uniquely identiy an id by its db. For example, ttxx is imdb similar make tmxx to be tmdb id. Helps, when you are searching across many movies databses
  - Finish overview
 */

function simpleHash (string) {
  var hash = 0, i, chr
  if (string.length === 0) return hash
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function randomNumber (a, b) {
  return Math.floor(Math.random() * b) + a
}

function formatBytes (bytes, decimals) {
  if (bytes == 0) return '0 Bytes'
  var k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/*
* Take an element (the first param), and traverse the DOM upward from it
* until it hits the element with a given class name (second parameter).
* This mimics jQuery's `.closest()`.
*
* @param  {element} element  The element to start from
* @param  {string}  clazz      The class name
* @return {element}          The closest element
 */
function closestByClass (element, clazz) {
  while (element.className.indexOf(clazz) === -1) {
    element = element.parentNode
    if (!element) {
      return null
    }
  }
  return element
}

function getInitials (string) {
  let initials = ''
  string.split(' ').map(function (value) {
    initials += value[0].toUpperCase()
  })
  return initials
}

module.exports = {
  simpleHash,
  randomNumber,
  formatBytes,
  closestByClass,
  getInitials
}

// const mockCollection = require('../samples/collection')
// formatCollection(mockCollection)
// console.log(JSON.stringify(formatCollection(mockCollection)))

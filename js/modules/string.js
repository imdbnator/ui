'use strict'

/**
 * Converts a thousands or millions number to a string with comma
 * @param  {[number]} number [Number to convert]
 * @return {[string]}        [Number with commas at thousands and million.]
 */
Number.prototype.comma = function (delimeter) {
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimeter)
}

/**
 * Capitalizes a string
 * @return {[string]} [Capitalized string]
 */
String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase() })
}

/**
 * Get a person's initial from full name
 * @return {string} An initials string
 */
String.prototype.getInitials = function () {
  let initials = ''
  this.split(' ').map(function (value) {
    initials += value[0].toUpperCase()
  })
  return initials
}

Array.prototype.joinSentence = function () {
  return (this.length == 1) ? this : this.slice(0, -1).join(', ') + ' and ' + this[this.length - 1]
}

String.prototype.pathToPoster = function (tmdbSize) {
  const width = tmdbSize.match(/^w(\d*)/g)[0].substring(1)
  return (this === '')
    ? `http://localhost:8082/images/grey.svg?fill=9f9f9f&initials=NA&width=${width}&font=arial`
    : `https://image.tmdb.org/t/p/${tmdbSize}${this}`
}

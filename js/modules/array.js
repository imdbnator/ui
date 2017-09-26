Array.prototype.sortAscending = function () {
  return this.sort((a, b) => {
    if (a[1] > b[1]) {
      return 1
    }
    if (a[1] == b[1]) {
      return 0
    }
    if (a[1] < b[1]) {
      return -1
    }
  })
}

Array.prototype.sortDescending = function () {
  return this.sort((a, b) => {
    if (a[1] > b[1]) {
      return -1
    }
    if (a[1] == b[1]) {
      return 0
    }
    if (a[1] < b[1]) {
      return 1
    }
  })
}

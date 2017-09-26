/*
Bugs
  - Prevent genres from showing the same image for multiple genres from the highest rated movie. Also make sure, it is not empty.
  - Sort genres in alphabet order AFTER the the genres have been extracted
 */

const isEqual = require('lodash.isequal')
const isEmpty = require('lodash.isempty')
const isNumber = require('lodash.isnumber')
const isArray = require('lodash.isarray')
const includes = require('lodash.includes')
const findIndex = require('lodash.findindex')
const cloneDeep = require('lodash.clonedeep')
const uniqWith = require('lodash.uniqwith')
const mergeWith = require('lodash.mergewith')
const differenceWith = require('lodash.differencewith')
const intersectionWith = require('lodash.intersectionwith')

const formatBytes = require('./utils').formatBytes

function formatCollection (prevCollection) {
  const collection = cloneDeep(prevCollection)
  const entries = collection['entries']

  const uniqueIMDBids = {}
  const overview = {
    top: {
      movies: [],
      tv: [],
      people: [],
      revenue: []
    },
    ratings: [],
    years: [],
    genres: [],
    keywords: [],
    languages: []
  }

  const formattedTV = []
  let formattedMovies = []
  const formattedPeople = []
  const formattedGenres = []
  const formattedKeywords = []
  const formattedLanguages = []
  const formattedErrors = []
  const formattedFormats = []

  let oscars = 0
  let hds = 0
  let blurays = 0
  let size = {
    total: 0,
    movies: 0,
    tv: 0
  }

  const genreAccum = {}

  // Iterate over entries and populate movies
  for (let i = 0; i < entries.length; i++) {
    const { entryid, input, guesser, search, info, ignore } = entries[i]
    if (ignore) continue

    size.total += input.size

    // If movie not found
    if (!search.found) {
      formattedErrors.push({
        entryid,
        input: input.name,
        guess: (guesser.found) ? guesser.guess.title : 'Unable to guess.'
      })
      continue
    }

    const { imdbid, year, rating, votes, genres, keywords, cast, crew, awards, language, poster, backdrop } = info

    // Check if movie is unique. If not, push into duplicates row.
    if (imdbid in uniqueIMDBids) {
      const thisEntryid = uniqueIMDBids[imdbid]
      formattedMovies = formattedMovies.map(movie => {
        if (movie.entryid !== thisEntryid) return movie
        if ('duplicates' in movie) {
          movie['duplicates'].push(input.name)
        } else {
          movie['duplicates'] = [input.name]
        }
        return movie
      })
      continue
    }

    // Process info
    if (isNumber(year)) {
      const prettyYear = (Math.floor(year / 10) * 10)
      const index = overview.years.map(a => a.name).indexOf(prettyYear)
      if (index > -1) {
        overview.years[index].count += 1
        if (overview.years[index].titles.length < 5) {
          overview.years[index].titles.push(entryid)
        }
      } else {
        overview.years.push({name: prettyYear, count: 1, titles: [entryid]})
      }
    }

    if (!isEmpty(guesser.guess.format)) {
      const format = guesser.guess.format
      const index = formattedFormats.map(a => a.name).indexOf(format)
      if (index > -1) {
        formattedFormats[index].count += 1
        if (formattedFormats[index].titles.length < 5) {
          formattedFormats[index].titles.push(entryid)
        }
      } else {
        formattedFormats.push({name: format, count: 1, titles: [entryid]})
      }
    }

    // Votes
    // if (votes) {
    //   const base = Math.floor(votes / 100000) * 100
    //   const prettyVote = `${base}K to ${base}K`
    //   meta.votes[prettyVote] = (prettyVote in meta.votes) ? meta.votes[prettyVote] + 1 : 1
    // }

    if (isNumber(rating)) {
      const prettyRating = `${(Math.round(rating * 2) / 2).toFixed(1)}`
      const index = overview.ratings.map(a => a.name).indexOf(prettyRating)
      if (index > -1) {
        overview.ratings[index].count += 1
        if (overview.ratings[index].titles.length < 5) {
          overview.ratings[index].titles.push(entryid)
        }
      } else {
        overview.ratings.push({name: prettyRating, count: 1, titles: [entryid]})
      }
    }

    if (!isEmpty(genres)) {
      genres:
      for (let i = 0; i < genres.length; i++) {
        const genre = genres[i]
        const index = formattedGenres.map(a => a.name).indexOf(genre)

        if (index > -1) {
          formattedGenres[index].count += 1
          if (formattedGenres[index].titles.length < 5) {
            formattedGenres[index].titles.push(entryid)
          }

          if (!isNumber(rating)) continue genres
          if (!isNumber(votes)) continue genres
          if (!(genre in genreAccum)) {
            genreAccum[genre] = {
              entryid,
              rating,
              votes
            }
          }

          if (rating > genreAccum[genre].rating || (rating === genreAccum[genre].rating && votes >= genreAccum[genre].votes)) {
            if (!isEmpty(backdrop)) {
              if (!isEmpty(poster)) formattedGenres[index].poster = poster
              formattedGenres[index].backdrop = backdrop
              genreAccum[genre].entryid = entryid
              genreAccum[genre].rating = rating
              genreAccum[genre].votes = votes
            }
          }

          continue genres
        }

        if (!isEmpty(backdrop)) {
          genreAccum[genre] = {
            entryid,
            rating: (isNumber(rating)) ? rating : 0,
            votes: (isNumber(votes)) ? votes : 0
          }
        }

        formattedGenres.push({name: genre, count: 1, titles: [entryid], poster: (!isEmpty(poster) ? poster : null), backdrop: (!isEmpty(backdrop) ? backdrop : null)})
      }
    }

    if (!isEmpty(keywords)) {
      for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i]
        const index = formattedKeywords.map(a => a.name).indexOf(keyword)

        if (index > -1) {
          formattedKeywords[index].count += 1
          if (formattedKeywords[index].titles.length < 5) {
            formattedKeywords[index].titles.push(entryid)
          }
          continue
        }
        formattedKeywords.push({name: keyword, count: 1, titles: [entryid]})
      }
    }

    if (!isEmpty(cast)) {
      for (let i = 0; i < cast.length; i++) {
        const { tmdbid, name, gender, job, poster } = cast[i]
        const index = formattedPeople.map(a => a.name).indexOf(name)

        if (index > -1) {
          formattedPeople[index].count += 1
          if (formattedPeople[index].jobs.indexOf(job) === -1) {
            formattedPeople[index].jobs.push(job)
          }
          if (formattedPeople[index].titles.length < 5) {
            formattedPeople[index].titles.push(entryid)
          }
          continue
        }

        formattedPeople.push({tmdbid, name, count: 1, gender, jobs: !isEmpty(job) ? [job] : [], titles: [entryid], poster})
      }
    }

    if (!isEmpty(crew)) {
      for (let i = 0; i < crew.length; i++) {
        const { tmdbid, name, gender, job, poster } = crew[i]
        const index = formattedPeople.map(a => a.name).indexOf(name)

        if (index > -1) {
          formattedPeople[index].count += 1
          if (formattedPeople[index].jobs.indexOf(job) === -1) {
            formattedPeople[index].jobs.push(job)
          }
          if (formattedPeople[index].titles.length < 5) {
            formattedPeople[index].titles.push(entryid)
          }
          continue
        }

        formattedPeople.push({tmdbid, name, count: 1, gender, jobs: !isEmpty(job) ? [job] : [], titles: [entryid], poster})
      }
    }

    if (!isEmpty(language)) {
      const index = formattedLanguages.map(a => a.name).indexOf(language)
      if (index > -1) {
        formattedLanguages[index].count += 1
        if (formattedLanguages[index].titles.length < 5) {
          formattedLanguages[index].titles.push(entryid)
        }
      } else {
        formattedLanguages.push({name: language, count: 1, titles: [entryid]})
      }
    }

    if (!isEmpty(awards)) {
      if (includes(awards, 'Oscar')) oscars += 1
    }

    if (guesser.found) {
      if (!isEmpty(guesser.guess.format)) {
        if (includes(guesser.guess.format.toLowerCase(), 'blu')) {
          blurays += 1
          hds += 1
        }
      }
      if (!isEmpty(guesser.guess.screen_size)) {
        if (includes(guesser.guess.screen_size, '720') || includes(guesser.guess.screen_size, '720')) {
          hds += 1
        }
      }
    }

    size.movies += input.size

    // Add movie
    uniqueIMDBids[imdbid] = entryid
    formattedMovies.push(Object.assign({
      entryid,
      input: input.name,
      path: input.path,
      guess: (guesser.found) ? guesser.guess.title : 'Was unable to guess.',
      size: input.size,
      type: input.type,
      format: (guesser.found) ? ((guesser.guess.format) ? guesser.guess.format : null) : 'Was unable to guess.'
    }, info))
  }

  // Update collection
  delete collection['entries']

  collection['movies'] = formattedMovies
  collection['tv'] = formattedTV
  collection['genres'] = formattedGenres
  collection['people'] = formattedPeople
  collection['keywords'] = formattedKeywords
  collection['languages'] = formattedLanguages
  collection['formats'] = formattedFormats
  collection['errors'] = formattedErrors

  // Calculate counts
  collection['count'] = {
    total: entries.length,
    movies: formattedMovies.length,
    tv: formattedTV.length,
    people: {cast: formattedPeople.filter(a => a.jobs.indexOf('Cast') > -1).length, directors: formattedPeople.filter(a => a.jobs.indexOf('Director') > -1).length},
    genres: formattedGenres.length,
    keywords: formattedKeywords.length,
    oscars,
    blurays,
    hds,
    size: {
      total: formatBytes(size.total),
      movies: formatBytes(size.movies),
      tv: formatBytes(size.tv)
    },
    errors: formattedErrors.length
  }

  // Sort & finalize properties
  const clonedMovies = cloneDeep(formattedMovies)

  overview.top.movies = clonedMovies.sort((a, b) => b.rating - a.rating).slice(0, 10)
  overview.top.people = formattedPeople.sort((a, b) => b.count - a.count).slice(0, 10)
  overview.top.revenue = clonedMovies.sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  overview.ratings.sort((a, b) => a.name - b.name)
  overview.years.sort((a, b) => a.name - b.name)
  overview.genres = cloneDeep(formattedGenres).sort((a, b) => b.count - a.count).slice(0, 10)
  overview.languages = formattedLanguages.sort((a, b) => b.count - a.count).slice(0, 10)
  overview.keywords = formattedKeywords.slice(0, 20)
  collection['overview'] = overview

  return collection
}


function aggregateSection (collection, {fields, section, checked, debug}) {

  // Populate aggreates with given fields
  const aggregates = {}
  for (let i = 0; i < fields.length; i++) {
    aggregates[fields[i]] = []
  }

  // Check if section is provided
  if (isEmpty(section)) {
    debug && console.log('Aggregate (ERROR):', `section: ${section} cannot be empty.`)
    return aggregates
  }

  // Check if section exists in collecton
  if (!(section in collection)) {
    debug && console.log('Aggregate (ERROR):', `section: ${section} does not exist in collection.`)
    return aggregates
  }

  // Check if section in collection is Empty
  if (isEmpty(collection)){
    debug && console.log('Aggregate (ERROR):', `section: ${section} is empty in collection.`)
    return aggregates
  }

  // Check if provided fields are empty
  if (isEmpty(fields)) {
    debug && console.log('Aggregate (WARNING):', `Empty fields were provided for aggregation.`)
    return aggregates
  }

  // Check if checked is provided
  if (isEmpty(checked)){
    debug && console.log('Aggregate (WARNING):', `Empty checked fields: ${checked} provided`)
  }

  sectionObjs:
  for (let i = 0; i < collection[section].length; i++) {
    const sectionObj = collection[section][i]
    fields:
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j]

      // Check if field is present in fields
      if (!(field in sectionObj)) continue fields

      // Check if field exists in checked
      const checkExists = !isEmpty(checked) && (field in checked)

      // Parse content appropriately as per its content type
      let content = cloneDeep(sectionObj[field])
      const contentType = typeof content

      if (contentType === 'string' || contentType === 'number') {
        if (contentType === 'string' && isEmpty(content)) continue fields
        if (contentType === 'number' && !isNumber(content)) continue fields

        const index = aggregates[field].map(a => a.name).indexOf(content)
        if (index === -1) {
          const isChecked = checkExists && includes(checked[field].toString(), content.toString()) // To make sure integers passed as strings work.
          aggregates[field].push({name: content, count: 1, isChecked})
        } else {
          aggregates[field][index]['count'] += 1
        }
      }

      if (contentType === 'object') {
        if (isEmpty(content)) continue fields
        if (isArray(content)) {
          for (let j = 0; j < content.length; j++) {
            let subContent = content[j]
            const subContentType = typeof subContent

            // Content is array and subcontent is String
            // If subContent is like genre
            if (subContentType === 'string') {
              const index = aggregates[field].map(a => a.name).indexOf(subContent)
              if (index === -1) {
                const isChecked = checkExists && includes(checked[field], subContent)
                aggregates[field].push({name: subContent, count: 1, isChecked})
              } else {
                aggregates[field][index]['count'] += 1
              }
            }

            // Content is array and subContent is Object
            // If subContent is like people, cast
            if (subContentType === 'object') {
              const index = findIndex(aggregates[field], function (o) { return o.name === subContent.name })
              if (index === -1) {
                const isChecked = checkExists && includes(checked[field], subContent.name) // Special case
                aggregates[field].push(Object.assign(subContent, {count: 1, isChecked}))
              } else {
                aggregates[field][index]['count'] += 1
              }
            }
          }
        }
      }
    }
  }

  // Sort aggregates primarily based on checked state and secondarily on count
  for (let field in aggregates) {
    aggregates[field].sort((a,b) => {
      if (b.checked){
        if (b.checked && a.checked) return -1
        return +1
      }
      if (includes(['year', 'rating'], field)) return (b.name - a.name)
      return (b.count - a.count)
    })
  }

  // Special modification for ratings
  if ('rating' in aggregates){
    const ratings = aggregates['rating']
    aggregates['rating'] = {
      minRating: (!isEmpty(ratings[ratings.length-1])) ? ratings[ratings.length-1].name : 0,
      maxRating: (!isEmpty(ratings[0])) ? ratings[0].name : 10
    }
  }
  debug && console.log('Aggregates:', aggregates);
  return aggregates
}

function sortMovies (prevMovies, properties) {
  const movies = cloneDeep(prevMovies)
  const { field, order } = properties

  let foo = (order === 'desc') ? +1 : -1
  movies.sort(function (a, b) {
    switch (field) {
      case 'rating':
        if (a[field] > b[field]) {
          return -(foo)
        }
        if (a[field] === b[field]) {
          if (a['votes'] >= b['votes']) {
            return -(foo)
          }
          return +(foo)
        }
        return +(foo)
        break
      default:
        if (a[field] >= b[field]) {
          return -(foo)
        }
        return +(foo)
        break
    }
  })

  return movies
}

/**
 * Checks if keys in an array exist in another array. If they do, it accummulates
 * a score for each time a value exists in this string based on the given weight.
 * @param  {array}  needle    [Array's values to be search for]
 * @param  {array}  haystack  [Array to search in]
 * @param  {number} weight    [Number to array to this score]
 * @return {object}           [Returns an object with score and matches]
 */
function score (needle, haystack, weight) {
  let score = 0
  let matches = []
  for (var i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) > -1) {
      score += weight
      matches.push(needle[i])
    }
  }
  return {score, matches}
}

function flattenField (array, prop) {
  if (typeof array === 'object') {
    if (typeof array[0] === 'object') {
      return array.map(a => a[prop])
    }
  }
  return array
}

/**
 * Given a movie in movies, this function returns a an array of entryids
 * similar to it based on keywords, genre, cast, language similarity
 * @param  {number} baseEntryid     [The IMDB Id to find movies similar to]
 * @param  {array} movies           [The movies to look in for similar movies]
 * @return {object}                 [An array of movies similar to base movie with scores]
 */
function similarMovies (baseEntryid, movies) {
  let similar = []
  const minScore = 3
  const params = {
    cast: 2,
    keywords: 1,
    genres: 0.5,
    director: 0.5
    // language: 0.25,
    // country: 0.15
  }

  const baseMovie = movies.find(movie => (movie.entryid == baseEntryid))

  if (!baseMovie) {
    return {success: false, message: 'Entry ID not found.'}
  }

  // Iterate over all movies
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i]
    const result = {
      entryid: movie.entryid,
      title: movie.title,
      score: 0,
      scores: {}
    }

    if (baseEntryid === movie.entryid) continue

    // Iterate over given paramters and compare this movie with baseMovie
    for (let param in params) {
      if (!(param in baseMovie) || !(param in movie)) continue
      const paramScore = score(flattenField(baseMovie[param], 'name'), flattenField(movie[param], 'name'), params[param])
      result.scores[param] = paramScore
      result.score += paramScore.score
    }

    // If score less than threshold, then continue
    if (result.score < minScore) continue

    // Push similarObj with movie details and matches into similar
    similar.push(result)
  }

  // Sort `similar` as per the score
  similar.sort((a, b) => {
    if (a.score >= b.score) {
      return -1
    }
    return +1
  })

  return {success: true, entryid: baseMovie.entryid, title: baseMovie.title, results: similar}
}

function sequentialFilter (prevCollection, {filtersQueue, onlySection, debug}) {
  if (isEmpty(filtersQueue)) {
    debug && console.log('filtersQueue (INFO):', 'Empty filter queue provided.')
    return cloneDeep(prevCollection)
  }

  let collection = prevCollection
  for (var i = 0; i < filtersQueue.length; i++) {
    const filters = filtersQueue[i]
    collection = filterCollection(collection, {filters, onlySection, debug})
  }
  return collection
}

function filterCollection (prevCollection, {filters, onlySection, maxResults, debug}) {
  // Check if filters exists.
  if (isEmpty(filters)) {
    debug && console.log('Filtering (WARNING):', 'Empty filters were provided.')
    return cloneDeep(prevCollection)
  }

  // Check if filters are to be ignored.
  if (filters.ignore) {
    debug && console.log('Filtering (INFO):', 'Ignoring filters')
    return cloneDeep(prevCollection)
  }

  // Check if onlySection exists and if the coresponsing section is provided in filters.
  if (!isEmpty(onlySection) && !(onlySection in filters)) {
    debug && console.log('Filtering (WARNING):', `onlySection: "${onlySection}" provided but corresponding filter does not exist in filters.'`, filters)
    return cloneDeep({[onlySection]: prevCollection[onlySection]})
  }

  // Selectively deep clone collection if onlySection is provided
  let collection = {}
  if (!isEmpty(onlySection)) {
    collection = cloneDeep({[onlySection]: prevCollection[onlySection]})
  } else {
    collection = cloneDeep(prevCollection)
  }

  sections:
  for (let section in filters) {
    if (!(section in collection)) {
      debug && console.log('Filtering (WARNING):', `section: ${section} provided in filters but does not exist in collection`)
      continue sections
    }

    let resultsCount = 0
    collection[section] = []

    section:
    for (let j = 0; j < prevCollection[section].length; j++) {
      const sectionObj = prevCollection[section][j]
      let andHolds = false
      let orHolds = false

      bools:
      for (let bool in filters[section]) {
        // Check if empty bool filtering conditions were given. If yes, mark as condition met and continue
        if (isEmpty(filters[section][bool])) {
          if (bool === 'OR') andHolds = true
          if (bool === 'AND') orHolds = true
          continue bools
        }

        requirements:
        for (let i = 0; i < filters[section][bool].length; i++) {
          const { field, value, condition } = filters[section][bool][i]

          // Check if the basic constraints are given
          if (isEmpty(field) || isEmpty(condition)) {
            debug && console.log('Filtering (ERROR):', 'Invalid requirement provided: Check if "field"  & "condition" are provided.')
            continue requirements
          }

          // Check if a field exists in sectionObj
          if (!(field in sectionObj)) {
            debug && console.log('Filtering (ERROR):', `field: ${field} provided but does not exist in section: ${section}`)
            continue requirements
          }

          let content = cloneDeep(sectionObj[field])

          // Parse content to apply condition in next state
          switch (field) {
            case 'cast':
            case 'crew':
              content = content.map(a => a.name.toLowerCase())
              break
            case 'gender':
            case 'count':
            case 'year':
            case 'size':
            case 'votes':
            case 'rating':
            case 'entryid':
            case 'imdbid':
            case 'tmdbid':
            case 'runtime':
            case 'budget':
            case 'revenue':
            case 'popularity':
              content = parseFloat(content)
              break
            case 'keywords':
            case 'genres':
            case 'jobs':
              content = content.map(a => a.toLowerCase())
              break
            default:
              content = (!isEmpty(content)) ? content.toLowerCase() : ''
              break
          }

          // Apply the condition on content
          let holds = false
          switch (condition) {
            case 'equal':
              holds = content === parseFloat(value)
              break
            case 'greater':
              holds = content > parseFloat(value)
              break
            case 'lesser':
              holds = content < parseFloat(value)
              break
            case 'ge':
              holds = content >= parseFloat(value)
              break
            case 'le':
              holds = content <= parseFloat(value)
              break
            case 'includes':
              holds = includes(content, value.toLowerCase())
              break
            default:
          }

          // Accumlate the result to the respective bool
          if (bool === 'AND') {
            if (!holds) {
              andHolds = false
              break bools
            }
            if (holds) andHolds = true
          }
          if (bool === 'OR') {
            if (holds) orHolds = (orHolds || true)
          }
        }
      }

      // If no condition is satisfied exit, else push sectionObj into respective section
      if (!andHolds && !orHolds) continue section
      collection[section].push(sectionObj)
      resultsCount++

      // Break section processing if minimum results are already obtained for section
      if (resultsCount >= maxResults) continue sections
    }
  }

  return collection
}

function combineFilters (oldFilters, newFilters, type) {
  const filters = mergeWith(cloneDeep(oldFilters), cloneDeep(newFilters), function (objValue, srcValue) {
    if (isArray(objValue)) {
      const intersection = intersectionWith(objValue, srcValue, isEqual)
      const union = uniqWith(srcValue.concat(objValue), isEqual)
      const result = differenceWith(union, intersection, isEqual)
      return result
    }
  })
  return cloneDeep(filters)
}

module.exports = {
  formatCollection,
  aggregateSection,
  sortMovies,
  filterCollection,
  sequentialFilter,
  combineFilters,
  similarMovies
}

if (process.env.DEBUG) {

  // const base = {
  //   "movies": {
  //     "AND": [{
  //       "field": "title",
  //       "value": "Spiderman"
  //     }, {
  //       "field": "rating",
  //       "value": 4,
  //       "condition": "greater"
  //     }, {
  //       "field": "votes",
  //       "value": 5000,
  //       "condition": "greater"
  //     }],
  //     "OR": [{
  //       "field": "genres",
  //       "value": "drama"
  //     },{
  //       "field": "rating",
  //       "value": 9
  //     }]
  //   }
  // }
  // const add = {
  //     "people": {
  //       "AND": [{
  //         "field": "rating",
  //         "value": 5,
  //         "condition": "greater"
  //       }, {
  //         "field": "title",
  //         "value": "Toy",
  //         "condition": "includes"
  //       }],
  //       "OR": [{
  //         "field": "rating",
  //         "value": 9
  //       }]
  //     },
  //     "movies":{
  //       "AND": [{
  //         "field": "title",
  //         "value": "Spiderman"
  //       }],
  //       "OR": [{
  //         "field": "genres",
  //         "value": "drama"
  //       }]
  //     }
  //   }

  // const base = {
  //   "movies": {
  //     "AND":[{
  //       "field": "field",
  //       "value": "value",
  //       "condition": "includes"
  //     }]
  //   }
  // }
  // const add = {
  //   "movies": {
  //     "AND":[{
  //       "field": "field2",
  //       "value": "value3",
  //       "condition": "includes"
  //     }]
  //   }
  // }
  // const filters = combineFilters(base, add)
  // console.log(JSON.stringify(filters))

  // const mockCollection = require('../samples/populatedCollection')
  // console.log(JSON.stringify(formatCollection(mockCollection)))
  //
  // console.log(JSON.stringify(similarMovies(30, mockMovies)))
  // console.log(JSON.stringify(sortMovies(mockMovies, {field: 'title', order: 'desc'})))

  // const collection = require('../samples/formattedCollection')
  // const aggregates = aggregateSection(collection, {fields: ['genres', 'year', 'format'], checked: {'cast': ['Brad Pitt'], 'genres': ['Drama'], 'format': ['DVDRip'], 'year': [2011]}, onlySection: 'movies', debug: true})
  // const aggregates = aggregateSection(collection, {fields: ['jobs', 'name', 'gender'], checked: {'jobs': ['Cast'], 'gender': [2], 'name': ['Brad Pitt']}, onlySection: 'people', debug: true})
  // console.log(JSON.stringify(aggregates))

  // // console.log(JSON.stringify(filterCollection(collection, handleFilters(base, add, 'remove'))));
  // const filters = {
  //   "movies": {
  //     "AND": [{
  //       "field": "rating",
  //       "value": 4,
  //       "condition": "greater"
  //     },
  //     {
  //       "field": "votes",
  //       "value": 5000,
  //       "condition": "greater"
  //     },
  //   ],
  //     "OR": [
  //       {
  //         "field": "title",
  //         "value": "incep",
  //         "condition": "includes"
  //       },
  //       {
  //       "field": "rating",
  //       "value": 8.5,
  //       "condition": "greater"
  //     }]
  //   }
  // }
  //
  // const ratingFilters = {
  //   'movies': {
  //     'AND': {
  //       'field': 'rating',
  //       'value': 8,
  //       'condition': 'greater'
  //     }
  //   }
  // }
  //
  // const peopleFilters = {
  //   "people": {
  //     "AND": [{
  //       'field': 'jobs',
  //       'value': 'original music composer',
  //       'condition': 'includes'
  //     }]
  //   }
  // }
  // const filteredCollection = filterCollection({people: collection.people}, {filters: peopleFilters, onlySection: 'people', debug: true})
  // const filteredCollection = filterCollection({movies: collection.movies}, {moviesFilters, onlySection: 'movies'})
  // console.log(JSON.stringify(filteredCollection))
}

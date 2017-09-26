/*
Todo
  - Need to add highlight to search results
  - Hacky way to go about key generation because, its giving a lot of flattenChildren(..) errors on fast typing. For example. type "Grace" fast
 */
import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import {filterCollection} from 'modules/collection'
import {DefaultPoster} from 'components/posters'
import Search from 'semantic-ui-react/dist/commonjs/modules/Search/Search.js'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import cloneDeep from 'lodash.clonedeep'
import 'modules/string'

let componentKey = 0

@withRouter
@connect((store) => {
  return {
    collection: store.fetch.collection
  }
})
export default class FindAny extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: false,
      results: [],
      value: ""
    }
  }

  _handleSearchChange(event, {value}){
    if (value.length < 1) return

    const results = {}
    const searchFilters = {
      "movies": {
        "AND": [{
          "field": "title",
          "value": value,
          "condition": "includes"
        }]
      },
      "people": {
        "AND": [{
          "field": "name",
          "value": value,
          "condition": "includes"
        }]
      },
      "genres": {
        "AND": [{
          "field": "name",
          "value": value,
          "condition": "includes"
        }]
      },
      "keywords": {
        "AND": [{
          "field": "name",
          "value": value,
          "condition": "includes"
        }]
      },
      "languages": {
        "AND": [{
          "field": "name",
          "value": value,
          "condition": "includes"
        }]
      },
      "formats": {
        "AND": [{
          "field": "name",
          "value": value,
          "condition": "includes"
        }]
      }
    }
    const collection = filterCollection(this.props.collection, {filters: searchFilters, maxResults: 3})
    for (let section in searchFilters) {
      if (!isEmpty(collection[section])){
        results[section] = {
          "name": section.capitalize(),
          "results": this._sectionToResults(collection[section], section)
        }
      }
    }
    this.setState({results, value})
  }

  _sectionToResults (section, type) {
    if (type === 'movies'){
      return section.map((movie) => {
        const { entryid, title, year, rating, poster } = movie
        return {
          'entryid': entryid,
          'type': type,
          'title': title,
          'description': (year) ? year.toString() : 'XXXX',
          'image': (poster) ? poster : null,
          'price': (rating) ? rating.toFixed(1): 'NA',
          'renderer': this._resultRenderer
        }
      })
    }
    if (type === 'people'){
      return section.map((movie) => {
        const { tmdbid, name, count, poster } = movie
        return {
          'tmdbid': tmdbid,
          'type': type,
          'title': name,
          'description': `found in ${count} movies`,
          'image': (poster) ? poster : null,
          'renderer': this._resultRenderer
        }
      })
    }
    if (type === 'genres' || type === 'languages' || type === 'keywords' || type === 'formats'){
      return section.map((movie) => {
        const { name, count } = movie
        return {
          'type': type,
          'title': name,
          'description': `found in ${count} movies`,
          'renderer': this._resultRenderer
        }
      })
    }
  }

  _resultRenderer ({ title, description, image, price }) {
    const key1 = componentKey++
    const key2 = componentKey++
    const key3 = componentKey++

    return [
      <div class='image' key={key1}>
        {image && <DefaultPoster tmdbSize='w45' posterPath={image} alt={title} key={key2} />}
      </div>,
      <div class='content' key={key3}>
        {price && <div class='price'>{price}</div>}
        {title && <div class='title' dangerouslySetInnerHTML={{__html: title}} />}
        {description && <div class='description'>{description}</div>}
      </div>
    ]
  }

  _handleResultSelect(event, {result}){
    const {entryid, tmdbid, title, type} = result
    let path = `${this.props.match.url}`

    switch (type) {
      case 'movies':
        path += '/movie/' + entryid
        break
      case 'languages':
        path += '/movies/' + JSON.stringify({
          "movies": {
            "AND": [{
              "field": "language",
              "value": title,
              "condition": "includes"
            }]
          }
        })
        break;
      case 'formats':
        path += '/movies/' + JSON.stringify({
          "movies": {
            "AND": [{
              "field": "format",
              "value": title,
              "condition": "includes"
            }]
          }
        })
        break
      case 'genres':
      case 'keywords':
      case 'format':
        path += '/movies/' + JSON.stringify({
          "movies": {
            "AND": [{
              "field": type,
              "value": title,
              "condition": "includes"
            }]
          }
        })
        break;
      case 'people':
        path += '/person/' + tmdbid
        break
      default:

    }
    this.props.history.push(path)
  }

  render () {
    return (
      <Search
        category={true}
        loading={this.state.isLoading}
        results={this.state.results}
        onSearchChange={this._handleSearchChange.bind(this)}
        onResultSelect={this._handleResultSelect.bind(this)}
      />
    )
  }
}

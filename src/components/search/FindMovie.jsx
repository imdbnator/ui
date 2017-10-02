import React from 'react'
import {DefaultPoster} from 'components/posters'
import Search from 'semantic-ui-react/dist/commonjs/modules/Search/Search.js'

let componentKey = 0

export default class FindMovie extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: false,
      success: false,
      results: [],
      error: false,
      errorMessage: null
    }
  }

  _handleSearchChange (event, {value}) {
    if (value.length < 1) return

    this.setState({ isLoading: true, success: false, error: false, errorMessage: null})

    fetch(`//${process.env.API_HOST}/process/search?input=${encodeURIComponent(value)}&index=tmdb&type=movie&mode=prefix`)
      .then((response) => {
        if (response.status !== 200) throw new Error(`API status error: ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!data.success) throw new Error(data.message)
        if (data.elasticsearch.hits.length === 0) throw new Error(`No results found for "${value}".`)
        this.setState({ isLoading: false, success: true, results: this._hitsToDropdown(data.elasticsearch.hits)})
        console.log('Search Success:', data)
      })
      .catch((err) => {
        this.setState({ isLoading: false, error: true, errorMessage: err.message})
        console.log('Search Error:', err)
      })
  }

  _hitsToDropdown (hits) {
    return hits.slice(0, 10).map((hit) => {
      const { highlight, _source } = hit
      return {
        'imdbid': _source.imdbid,
        'tmdbid': _source.tmdbid,
        'title': _source.title,
        'description': (_source.year) ? _source.year.toString() : 'XXXX',
        'image': (_source.poster) ? _source.poster : null,
        'price': _source.rating.toFixed(1),
          // "highlight": highlight.title[0], // (Todo): Show the respective highlight intead of just 'title'. Ex: alternative_title_*
        'renderer': this._resultRenderer
      }
    })
  }

  _resultRenderer ({ image, price, title, description, highlight }) {
    // (Todo): Hacky way to go about key generation because, its giving a lot of flattenChildren(..) errors on fast typing. For example. type "Grace" fast
    const key1 = componentKey++
    const key2 = componentKey++
    const key3 = componentKey++

    return [
      <div class='image' key={key1}>
        <DefaultPoster tmdbSize='w45' posterPath={image} alt={title} key={key2} />
      </div>,
      <div class='content' key={key3}>
        {price && <div class='price'>{price}</div>}
        {title && <div class='title' dangerouslySetInnerHTML={{__html: title}} />}
        {description && <div class='description'>{description}</div>}
      </div>
    ]
  }

  _handleResultSelect (event, data) {
    // Does not work unless clicked twice?!
    const {imdbid, tmdbid} = data.result
    console.log('Selected:', imdbid)
    console.log('Selected:', tmdbid)
  }

  render () {
    return (
      <Search
        loading={this.state.isLoading}
        results={this.state.results}
        onSearchChange={this._handleSearchChange.bind(this)}
        onResultSelect={this._handleResultSelect.bind(this)}
      />
    )
  }
}

/*
Todo
  - Think of a way of auto readloading collection when match changes.
 */
import React from 'react'
import {connect} from 'react-redux'
import {closestByClass} from 'modules/utils'
import isEmpty from 'lodash.isempty'

import Search from 'semantic-ui-react/dist/commonjs/modules/Search/Search.js'
import {Loading, Dimmer} from 'components/notifications'
import {DefaultPoster} from 'components/posters'
import {globalNotify} from 'actions/notify'

let componentKey = 0

@connect((store) => {
  return {
    id: store.fetch.collection.id
  }
})
export default class EditBox extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isSearchLoading: false,
      searchHits: [],
      isClosestLoading: true,
      maxClosestScore: 0,
      closestHits: [],
      isStoring: false,
    }
  }

  _handleChoose(event){
    const $element = closestByClass(event.target, "button")
    const imdbid = $element.getAttribute('data-imdbid')
    console.log(imdbid);
    this._modifyEntry(this.props.movie.entryid, imdbid)
  }

  _modifyEntry(entryid, imdbid){
    this.setState({isStoring: true})
    fetch(`http://${API_HOST}/collection/${this.props.id}/override/${entryid}/to/${imdbid}`, {
      method: 'put'
    }).then(response => {
      if (response.status !== 200) throw new Error(`Server status: ${response.status}`)
      return response.json()
    }).then(data => {
      if (!data.success) throw new Error(data.message)
      this.setState({isStoring: false})
      localStorage.setItem('refetch', 'true')
      console.log('Storing (SUCCESS):', data);
      this.props.dispatch(globalNotify({
        title: 'Success!',
        message: 'The match has been overriden. Reload page for viewing changes.',
        type: 'success'
      }))
      // Send new movie title to listener.
    }).catch(err => {
      this.setState({isStoring: false})
      console.log('Storing (ERROR):', err.message);
      this.props.dispatch(globalNotify({
        title: 'Bummer!',
        message: 'Was unable to override match.',
        type: 'error'
      }))
    })
  }

  _handleSearchChange (event, {value}) {
    if (value.length < 1) return

    this.setState({isSearchLoading: true})

    fetch(`http://${API_HOST}/process/search?input=${encodeURIComponent(value)}&index=tmdb&type=movie&mode=prefix`)
      .then((response) => {
        if (response.status !== 200) throw new Error(`Status error: ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!data.success) throw new Error(data.message)
        if (data.elasticsearch.hits.length === 0) throw new Error(`No results found for "${value}".`)
        this.setState({ isSearchLoading: false, searchHits: data.elasticsearch.hits})
        console.log('Search (SUCCESS):', data)
      })
      .catch((err) => {
        this.setState({ isSearchLoading: false})
        console.log('Search (ERROR):', err.message)
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
        'image': (_source.poster) ? (poster) ? `https://image.tmdb.org/t/p/w45/${_source.poster}` : null: null,
        'price': _source.rating.toFixed(1),
        // 'renderer': this._resultRenderer
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
        <DefaultPoster className="ui image" tmdbSize='w45' posterPath={image} alt={title} key={key2} />
      </div>,
      <div class='content' key={key3}>
        {price && <div class='price'>{price}</div>}
        {title && <div class='title' dangerouslySetInnerHTML={{__html: title}} />}
        {description && <div class='description'>{description}</div>}
      </div>
    ]
  }

  _handleResultSelect (event, data) {
    // (Bug) Does not work unless clicked twice?! Unless a non header is clicked, it doesnt work! Custom rendering doesnt work.
    const {imdbid, tmdbid} = data.result
    this._modifyEntry(this.props.movie.entryid, imdbid)
  }


  render () {
    return (
      <div class='ui three column celled center aligned grid'>
        <div class='one column row'>
          <div class='column'>
            <Search
              loading={this.state.isSearchLoading}
              results={this._hitsToDropdown(this.state.searchHits)}
              onSearchChange={this._handleSearchChange.bind(this)}
              onResultSelect={this._handleResultSelect.bind(this)}
              placeholder="Search for a title ...."
            />
          </div>
        </div>
        <div class='equal width row'>
          {this.state.isClosestLoading && [1,2,3].map(i => {
            return(
              <div class='column' key={componentKey++}>
                <h4 class="ui header">
                  Loading
                </h4>
                <DefaultPoster className="ui image" posterPath={null} width='58px' height='87px' alt='Loading' />
                <p>Confidence: 0%</p>
                <div class="ui loading green button">Choose</div>
              </div>
            )})
          }
          {!this.state.isClosestLoading && isEmpty(this.state.closestHits) &&
            []
          }
          {!this.state.isClosestLoading && this.state.closestHits.slice(0, 3).map((hit,i) => {
            const isDisabled = hit._source.imdbid === this.props.movie.imdbid  || hit._source.tmdbid === this.props.movie.tmdbid
            return (
              <div class='column' key={componentKey++}>
                <h4 class='ui header'>
                  <span style={{textOverflow: 'ellipsis'}}>{hit._source.title}</span>
                    <div class="sub header">({hit._source.year})</div>
                </h4>
                <DefaultPoster className="ui image" posterPath={hit._source.poster} tmdbSize='w58_and_h87_bestv2' width='58px' height='87px' alt={hit._source.title} />
                <p>Confidence: {Math.floor((hit._score/this.state.maxClosestScore) * 100)}%</p>
                <div class={`${(this.state.isStoring) && 'loading disabled'} ${(isDisabled) && 'disabled'} ui green button`} data-imdbid={hit._source.imdbid} data-tmdbid={hit._source.tmdbid} onClick={this._handleChoose.bind(this)}>Choose</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  componentDidMount () {
    fetch(`http://${API_HOST}/process/search?input=${this.props.movie.guess}&index=tmdb&type=movie&mode=match`)
    .then((response) => {
      if (response.status !== 200) throw new Error(`Server status: ${response.status}`)
      return response.json()
    })
    .then((data) => {
      if (!data.success) throw new Error(data.message)
      this.setState({isClosestLoading: false, closestHits: data.elasticsearch.hits, maxClosestScore: data.elasticsearch.max_score})
      console.log('Best hits (SUCCESS):', data)
    })
    .catch((err) => {
      this.setState({isClosestLoading: true})
      console.log('Best hits (ERROR):', err.message)
      this.props.dispatch(globalNotify({
        title: 'Bummer!',
        message: err.message,
        type: 'error'
      }))

    })
  }

}

/*
Todo
  - Finish case of invalid entryid
 */
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import isEmpty from 'lodash.isempty'
import isNumber from 'lodash.isnumber'
import includes from 'lodash.includes'
import {similarMovies} from 'modules/collection'
import {formatBytes} from 'modules/utils'

import {DefaultPoster} from 'components/posters'
import {Loading, Dimmer} from 'components/notifications'

const debug = true
let componentKey = 0

@connect((store) => {
  return {
    movies: store.fetch.collection.movies
  }
})
export default class Movie extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      entryid: parseInt(this.props.match.params.entryid),
      isLoading: true,
      showDimmer: false,
    }

    this._toggleDimmer = this._toggleDimmer.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.entryid !== nextProps.match.params.entryid){
      this.setState({
        entryid: parseInt(nextProps.match.params.entryid)
      })
    }
  }

  _toggleDimmer(event){
    if (event.type === 'mouseenter'){
      this.setState({showDimmer: true})
    }
    if (event.type === 'mouseleave'){
      this.setState({showDimmer: false})
    }
  }

  render () {
    if (this.state.isLoading){
      return(<Loading message="Loading movie ..." />)
    }

    const movies = this.props.movies
    const movie = movies.find(movie => movie.entryid === this.state.entryid)
    debug && console.log('Movie:', movie)

    if (isEmpty(movie)){
      return (<Dimmer header="Aww" message="Invalid Movie ID." icon="red frown icon"/>)
    }

    // Gather movie fields
    const { entryid, input, guess, size, title, year, rating, votes, runtime, genres, cast, crew, plot, language, keywords, awards, poster, backdrop, trailers } = movie

    // Get Cast & Crew details
    const Cast1 = []
    const Cast2 = []
    if (!isEmpty(cast)){
      for (let i = 0; i < cast.length && i < 4; i++) {
        const { tmdbid, name, gender, character, poster } = cast[i]
        let Cast = (i % 2 === 0) ? Cast1 : Cast2
        Cast.push(
          <div class='item' key={i}>
            <div class='ui image'>
              <DefaultPoster className="actor" posterPath={poster} tmdbSize='w50_and_h50_bestv2' height='40' width='40' fontSize='40' alt={name} initials={true}/>
            </div>
            <div class='middle aligned content'>
              <div class='header'>{name}</div>
              <div class='description'>as {character}</div>
            </div>
          </div>
        )
      }
    } else {
      Cast1.push(<div class="item">No cast data.</div>)
    }

    const Crew1 = []
    const Crew2 = []
    if (!isEmpty(crew)){
      for (let i = 0; i < crew.length && i < 10; i++) {
        const { tmdbid, name, gender, job, poster } = crew[i]
        let Crew = (i % 2 === 0) ? Crew1 : Crew2
        Crew.push(
          <div class='item' key={i}>
            <div class='ui image'>
              <DefaultPoster className="actor" posterPath={poster} tmdbSize='w50_and_h50_bestv2' height='40' width='40' fontSize='40' alt={name} initials={true}/>
            </div>
            <div class='middle aligned content'>
              <div class='header'>{name}</div>
              <div class='description'>{job}</div>
            </div>
          </div>
        )
      }
    } else {
      Crew1.push(<div class="item">No crew data.</div>)
    }

    // Get Similar movies
    const SimilarMovies = []
    const {success, message, results} = similarMovies(entryid, movies)
    const maxSimilar = (results.length < 9) ? results.length : 9
    if (success && !isEmpty(results)){
      for (let i = 0; i < results.length && i < maxSimilar; i++) {
        let { entryid, score, scores } = results[i]
        let { title, poster } = movies.find(movie => movie.entryid === entryid)
        SimilarMovies.push(<DefaultPoster href={this.props.match.path.replace(':entryid', entryid)} className="ui image" posterPath={poster} tmdbSize="w92" alt={title} key={componentKey++}/>)
      }
    }

    const labelStyle = {
      background: 'rgba(0,0,0,0.9)',
      width: '100%',
      position: 'absolute',
      padding: '10px 10px 10px 15px',
      bottom: '0px',
      overflow: 'hidden'
    }

    return (
      <div class="ui active page dimmer" style={{position: 'absolute', textAlign: 'initial', height: 'initial', minHeight: '100%  '}}>
        <div class="backdrop" style={{backgroundImage: `url(http://image.tmdb.org/t/p/w154/${backdrop})`}}></div>
        <div class="ui padded grid" style={{height: '100%'}}>
          <div class="two column row">
            <div class="left floated left aligned column">
              <i class="left arrow link big icon" onClick={()=>{this.props.history.goBack()}}></i>
            </div>
            <div class="right floated right aligned column">
              <i class="close link big icon" onClick={()=>{this.props.history.push(this.props.match.path.replace('movie/:entryid','movies'))}}></i>
            </div>
          </div>
          <div class="stackable row">
            <div class="sixteen wide mobile five wide tablet five wide computer center aligned column" >
              <DefaultPoster className="ui image" posterPath={poster} tmdbSize='w300' alt='No Poster'>
                <div class={`${(this.state.showDimmer) ? 'active' : ''} ui image dimmer`}>
                  <div class='content'>
                    <div class='center'>
                      <h2 class='ui inverted header'>Play</h2>
                      <div class='ui primary button'><i class='play icon' /> Movie</div>
                      <div class='ui red button'><i class='youtube play icon' /> Trailer</div>
                    </div>
                  </div>
                </div>
                <div style={labelStyle}>
                  <h5 class="ui inverted header">
                    {input}
                    <div class="sub red header">
                      ({formatBytes(size)})
                    </div>
                  </h5>
                </div>
              </DefaultPoster>
            </div>
            <div class="eleven wide tablet eleven wide computer column">
              <div class="ui two column stackable grid">
                <div class="eight wide column">
                  <h1 class='ui header'>{title} ({year})</h1>
                  <div class='ui list'>
                    {isNumber(rating) &&
                      <div class='item'>Rating: <div class="ui red label">{rating}</div> ({(isNumber(votes)) ? votes.comma(',') : votes})</div>
                    }
                    {isNumber(runtime) &&
                      <div class='item'>Runtime: {runtime} mins</div>
                    }
                    {!isEmpty(genres) &&
                      <div class='item'>Genres: {genres.join(', ')}</div>
                    }
                    {!isEmpty(language) &&
                      <div class='item'>Language: {language}</div>
                    }
                    {!isEmpty(awards) &&
                      <div class='item'>Awards: {awards}</div>
                    }

                    <div class='item'>Plot: {plot}</div>
                  </div>
                </div>
                <div class="eight wide column">
                  {(!isEmpty(trailers)) &&
                    [
                      <div class="ui inverted header">Trailer</div>,
                      <iframe src={`https://www.youtube.com/embed/${trailers[0].source}?rel=0&amp;showinfo=0&amp;autoplay=0&amp;iv_load_policy=3&amp;autoplay=1`}  width="100%" height="220" frameBorder="1" allowFullScreen></iframe>
                    ]
                  }
                </div>
                <div class="ten wide column">
                  <div class="ui inverted header">Starring</div>
                  <div class='ui two column stackable grid'>
                    <div class='column'>
                      <div class='ui inverted list'>
                        { Cast1 }
                      </div>
                    </div>
                    <div class='column'>
                      <div class='ui inverted list'>
                        { Cast2 }
                      </div>
                    </div>
                  </div>
                  <div class="ui inverted header">Crew</div>
                  <div class='ui two column stackable grid'>
                    <div class='column'>
                      <div class='ui inverted list'>
                        { Crew1 }
                      </div>
                    </div>
                    <div class='column'>
                      <div class='ui inverted list'>
                        { Crew2 }
                      </div>
                    </div>
                  </div>
                </div>
                <div class="six wide column">
                  {(!isEmpty(SimilarMovies)) &&
                    [
                      <div class="ui inverted header">Similar Movies</div>,
                      <div class="ui images">
                        { SimilarMovies }
                      </div>
                    ]
                  }
                  {!isEmpty(keywords) &&
                    [
                      <div class="ui inverted header">Plot Keywords</div>,
                      keywords.join(', ')
                    ]
                  }
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.setState({isLoading: false})
  }
}

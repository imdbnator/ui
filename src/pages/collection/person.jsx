import React from 'react'
import {withRouter, connect} from 'react-redux'
import {Link} from 'react-router-dom'
import includes from 'lodash.includes'

import {DefaultPoster} from 'components/posters'
import {Loading, Dimmer} from 'components/notifications'

const debug = process.env.NODE_ENV !== "production"
let componentKey = 0

@connect((store) => {
  return {
    id: store.fetch.collection.id,
    people: store.fetch.collection.people,
    movies: store.fetch.collection.movies
  }
})
export default class Person extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      person: null,
      personTMDbID: parseInt(props.match.params.tmdbid),
      isFetching: true,
      success: false,
      error: false,
      errorMessage: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.tmdbid !== nextProps.match.params.tmdbid) {
      this.setState({
        personTMDbID: parseInt(nextProps.match.params.tmdbid)
      })
    }
  }

  render () {
    if (this.state.isFetching) {
      return (<Loading message='Fetching person ...' />)
    }

    if (this.state.error) {
      return (<Dimmer header='Aww' message={this.state.errorMessage} icon='red frown icon' />)
    }

    const person = this.state.person
    const { name, birthday, place_of_birth, biography, profile_path, jobs, imdb_id, tmdbid, count, titles } = person
    const movies = this.props.movies.filter(a => includes(titles, a.entryid))
    debug && console.log('Person (INFO):', person)

    return (
      <div class='ui active page dimmer'>
        <div class='content'>
          <div class='ui container grid'>
            <div class="two column row">
              <div class="left floated left aligned column">
                <i class="left arrow link big icon" onClick={()=>{this.props.history.goBack()}}></i>
              </div>
              <div class="right floated right aligned column">
                <i class="close link big icon" onClick={()=>{this.props.history.push(this.props.match.path.replace('person/:tmdbid','people'))}}></i>
              </div>
            </div>
            <div class='stackable row'>
              <div class='five wide column'>
                <div class='ui movie image'>
                  <DefaultPoster posterPath={profile_path} tmdbSize='w300' addStyle={{width: '300px', height: 'auto'}} alt='No Poster' />
                  <div class='ui image dimmer'>
                    <div class='content'>
                      <div class='center'>
                        <h2 class='ui inverted header'>Play</h2>
                        <div class='ui primary button'><i class='play icon' /> Movie</div>
                        <div class='ui red button'><i class='youtube play icon' /> Trailer</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class='left aligned six wide column'>
                <h1 class='ui inverted header'>
                  {name}
                </h1>
                <div class='ui list'>
                  <div class='item'>Birthday: {birthday}</div>
                  <div class='item'>Birth: {place_of_birth}</div>
                  <div class='item'>Roles: {jobs.join(', ')}</div>
                  <div class='item'>Biography: {biography.substring(0, 1000)}. <a href={`http://www.imdb.com/name/${imdb_id}`} target="new">...</a></div>
                </div>
              </div>
              <div class="left aligned five wide column">
                <h1 class="ui inverted header">
                  Found in <Link to={`/collection/${this.props.id}/movies/[{"movies":{"OR":[{"field":"cast","value":"${name}","condition":"includes"}, {"field":"crew","value":"${name}","condition":"includes"}]}}]`}>{movies.length}</Link> movies
                </h1>
                <div class="ui images">
                  {movies.slice(0,9).map(movie => {
                    return(<DefaultPoster href={`/collection/${this.props.id}/movie/${movie.entryid}`} className="ui image" posterPath={movie.poster} tmdbSize="w92" alt={movie.title} key={componentKey++}/>)
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount () {
    fetch(`https://api.themoviedb.org/3/person/${this.state.personTMDbID}?api_key=d708a4aab5f31d89ad892100866e1329&append_to_response=external_ids,combined_credits`)
    .then((response) => {
      if (response.status === 404 || response.status === 422) throw new Error('Invalid TMDB Person\'s id.')
      if (response.status !== 200) throw new Error('Unable to reach TMDB server.')
      return response.json()
    })
    .then((data) => {
      const localPerson = this.props.people.find(a => a.tmdbid === this.state.personTMDbID)
      const person = Object.assign(localPerson, data)
      this.setState({isFetching: false, success: true, person})
    })
    .catch((err) => {
      this.setState({isFetching: false, error: true, errorMessage: err.message})
      debug && console.log('Person (ERROR):', err);
    })
  }
}

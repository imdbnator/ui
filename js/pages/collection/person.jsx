import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'

import {DefaultPoster} from 'components/posters'
import {Loading, Dimmer} from 'components/notifications'

export default class Person extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      person: null,
      personid: props.match.params.tmdbid,
      isFetching: true,
      success: false,
      error: false,
      errorMessage: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.match.params.tmdbid !== nextProps.match.params.tmdbid) {
      this.setState({
        personid: parseInt(nextProps.match.params.tmdbid)
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
    const { name, birthday, place_of_birth, biography, profile_path } = person
    console.log('Person:', person)

    return (
      <div class='ui active page dimmer'>
        <div class='content'>
          <div class='ui container grid'>
            <div class='equal width row'>
              <div class='left floated left aligned column'>
                <i class='left arrow link icon' onClick={() => { this.props.history.goBack() }} />
              </div>
              <div class='right floated right aligned column'>
                <i class='close link icon' onClick={() => { this.props.history.push(this.props.match.path.replace('person/:tmdbid', 'people')) }} />
              </div>
            </div>
            <div class='row'>
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
                  {name} ({place_of_birth})
              </h1>
                <div class='ui list'>
                  <div class='item'>Birthday: {birthday}</div>
                  <div class='item'>Birth: {place_of_birth}</div>
                  <div class='item'>Biography: {biography}</div>
                </div>

                <div class='ui divider' />
                <div class='ui two column doubling grid'>
                  <div class='column'>
                    <div class='ui inverted list' />
                  </div>
                  <div class='column'>
                    <div class='ui inverted list' />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }
  componentDidMount () {
    fetch(`https://api.themoviedb.org/3/person/${this.state.personid}?api_key=d708a4aab5f31d89ad892100866e1329&append_to_response=external_ids,combined_credits`)
    .then((response) => {
      if (response.status === 404 || response.status === 422) throw new Error('Invalid TMDB Person\'s id.')
      if (response.status !== 200) throw new Error('Unable to reach TMDB server.')
      return response.json()
    })
    .then((data) => {
      this.setState({isFetching: false, success: true, person: data})
    })
    .catch((err) => {
      this.setState({isFetching: false, error: true, errorMessage: err.message})
    })
  }
}

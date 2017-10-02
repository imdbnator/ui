import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {Loading} from 'components/notifications'
import {DefaultPoster} from 'components/posters'

let componentKey = 0
@connect((store) => {
  return {
    genres: store.fetch.collection.genres
  }
})
export default class Genres extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true,
      imageWidth: null
    }
  }
  render () {
    if (this.state.isLoading){
      return(<Loading message="Loading posters ..." />)
    }

    const labelStyle = {
      background: 'rgba(0,0,0,0.7)',
      width: 'initial',
      position: 'absolute',
      padding: '10px 10px 10px 15px',
      bottom: '0px'
    }

    return (
      <div class='ui padded divided grid'>
        <div class='no-padding row' style={{paddingBottom: '0rem'}}>
          {this.props.genres.map((genre) => {
            const {name, count, poster, backdrop} = genre
            const href = this.props.match.path.replace('genres', `movies/[{"movies":{"AND":[{"field": "genres","value":"${name}", "condition": "includes"}]}}]`)
            return(
              <div class="no-padding sixteen wide mobile eight wide tablet four wide computer column" key={componentKey++} >
                <DefaultPoster className="ui fluid image" href={href} posterPath={backdrop} tmdbSize="w300" alt={name} key={componentKey++}>
                  <div style={labelStyle}>
                    <h2 class="ui inverted header">
                      {name}
                      <div class="sub header">
                        {count} movies
                      </div>
                    </h2>
                  </div>
                </DefaultPoster>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  componentDidMount() {
    const innerWidth = window.innerWidth
    const perImage = (innerWidth / 4)
    console.log('Genre Images:', perImage);
    this.setState({
      perImage,
      isLoading: false,
      imageWidth: 'w342'
    })
  }
}

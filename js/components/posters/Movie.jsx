import React from 'react'
import {connect} from 'react-redux'
import isEmpty from 'lodash.isempty'
import includes from 'lodash.includes'
import {Link} from 'react-router-dom'
import Default from './Default'

let componentKey = 0

@connect(store => {
  return {
    id: store.fetch.collection.id
  }
})
export default class Movie extends React.Component {
  render () {

    const labelStyle = {
      background: 'rgba(0,0,0,0.7)',
      width: 'inherit',
      position: 'absolute',
      padding: '10px 10px 10px 15px',
      bottom: '0px',
      overflow: 'hidden'
    }

    const { entryid, title, year, poster, backdrop, awards } = this.props.movie
    const href = `/collection/${this.props.id}/movie/${entryid}`
    const posterPath = (this.props.backdrop) ? backdrop : poster
    return (
      <Default className={this.props.className} imageClass={this.props.imageClass} href={href} posterPath={posterPath} alt={title} tmdbSize={this.props.tmdbSize}>
        {(!isEmpty(awards)) && includes(awards, 'Oscar') &&
          <div class="ui yellow corner label">
            <i class="trophy icon"></i>
          </div>
        }
        <div style={labelStyle}>
          <h5 class='ui header'>
            {title}
            <div class='sub header'>
              {year}
            </div>
          </h5>
        </div>
      </Default>
    )
  }
}

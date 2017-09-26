import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import Default from './Default'

let componentKey = 0

@connect(store => {
  return {
    id: store.fetch.collection.id
  }
})
export default class Person extends React.Component {
  render () {

    const labelStyle = {
      background: 'rgba(0,0,0,0.7)',
      width: 'inherit',
      position: 'absolute',
      padding: '10px 10px 10px 15px',
      bottom: '0px',
      overflow: 'hidden'
    }

    const { tmdbid, name, gender, jobs, count, poster } = this.props.person
    const href = `/collection/${this.props.id}/person/${tmdbid}`
    return (
      <Default className={this.props.className} imageClass={this.props.imageClass} href={href} posterPath={poster} alt={name} tmdbSize={this.props.tmdbSize} initials={this.props.initials}>
        <div style={labelStyle}>
          <h5 class='ui header'>
            {name}
            <div class='sub header'>
              {jobs[0]} in {count} titles
            </div>
          </h5>
        </div>
      </Default>
    )
  }
}

import React from 'react'
import {Link} from 'react-router-dom'
import isEmpty from 'lodash.isempty'
import includes from 'lodash.includes'
import {getInitials} from 'modules/utils'

function Placeholder (props) {
  const className = (props.className) ? props.className : 'ui image'
  const fontSize = (props.fontSize) ? props.fontSize : (15 / 154) * '100%'

  // onLoad svg does not work: https://github.com/facebook/react/issues/9607
  return (
    <svg class={className} width='100%' height='100%' style={{height: '100%', width: '100%'}} xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' version='1.1'>
      <rect x='0' y='0' width='100%' height='100%' fill="#333" />
      <text x='50%' y='50%' alignmentBaseline='middle' textAnchor='middle' fill='white' fontFamily="Proxima-Nova-Thin" fontSize={fontSize}>
        {(props.initials) ? getInitials(props.alt) : props.alt}
      </text>
    </svg>
  )
}



class TMDBPoster extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true
    }
  }
  render() {
    const src = `https://image.tmdb.org/t/p/${this.props.tmdbSize}${this.props.posterPath}`
    let className = (this.props.className) ? this.props.className : 'ui image'
    className = (this.props.isFluid) ?  className + ' fluid' : className

    return (
      <img src={src} class={className} alt={this.props.alt} />
    )
  }
}

export default class Default extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {

    const isFluid = includes(this.props.className, 'fluid')
    const style = (isFluid) ? {'height': '100%'} : {}
    const className = this.props.className
    const imageClass = this.props.imageClass

    if (this.props.href){
      return(
        <Link to={this.props.href} class={className} style={style}>
          {!isEmpty(this.props.posterPath)
            ? <TMDBPoster className={imageClass} tmdbSize={this.props.tmdbSize} posterPath={this.props.posterPath} alt={this.props.alt} isFluid={isFluid}/>
            : <Placeholder className={imageClass} tmdbSize={this.props.tmdbSize} alt={this.props.alt} initials={this.props.initials} isFluid={isFluid}/>
          }
          {this.props.children}
        </Link>
      )
    } else {
      return(
        <div class={className} style={style}>
          {!isEmpty(this.props.posterPath)
            ? <TMDBPoster className={imageClass} tmdbSize={this.props.tmdbSize} posterPath={this.props.posterPath} alt={this.props.alt} isFluid={isFluid}/>
            : <Placeholder className={imageClass} tmdbSize={this.props.tmdbSize} alt={this.props.alt} initials={this.props.initials} isFluid={isFluid}/>
          }
          {this.props.children}
        </div>
      )
    }
  }
}

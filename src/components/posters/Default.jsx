import React from 'react'
import {Link} from 'react-router-dom'
import isEmpty from 'lodash.isempty'
import includes from 'lodash.includes'
import {getInitials} from 'modules/utils'

function Placeholder (props) {
  const className = (props.className) ? props.className : 'ui image'
  const fontSize = (props.fontSize) ? props.fontSize : (15 / 154) * 100
  const width = (props.width) ? props.width : ((!props.isFluid) ? props.tmdbSize.match(/(?:w)(\d{2,4})/)[1] + 'px' : '100%' )
  const height = (props.height) ? props.height : '100%'

  // onLoad svg does not work: https://github.com/facebook/react/issues/9607
  return (
    <svg class={className} width={width} height={height} style={{height, width}} xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' version='1.1'>
      <rect x='0' y='0' width={width} height={height} fill="#333" />
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

  _fadeIn(element) {
    let opacity = 0.1;  // initial opacity
    element.style.display = 'block';
    let timer = setInterval(function () {
        if (opacity >= 1){
            clearInterval(timer);
        }
        element.style.opacity = opacity;
        element.style.filter = 'alpha(opacity=' + opacity * 100 + ")";
        opacity += opacity * 0.1;
    }, 10);
  }

  _handleImageLoad(event){
    this._fadeIn(event.target)
  }

  _handleLoad(){
    this.setState({isLoading: false})
  }
  render() {
    const src = `https://image.tmdb.org/t/p/${this.props.tmdbSize}${this.props.posterPath}`
    let className = (this.props.className) ? this.props.className : 'ui image'
    className = (this.props.isFluid) ?  className + ' fluid' : className

    // return (<img src={src} class={className} style={{display: 'none'}} alt={this.props.alt} onLoad={this._handleImageLoad.bind(this)}/>)
    return (<img src={src} class={className}alt={this.props.alt} />)
  }
}

export default class Default extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {

    const isFluid = (this.props.isFluid) ? true : includes(this.props.className, 'fluid')
    const style = (this.props.noStretch) ? {} : ((isFluid) ? {'height': '100%'} : {})
    const className = this.props.className
    const imageClass = this.props.imageClass

    if (this.props.href){
      return(
        <Link to={this.props.href} class={className} style={style}>
          {!isEmpty(this.props.posterPath)
            ? <TMDBPoster className={imageClass} tmdbSize={this.props.tmdbSize} posterPath={this.props.posterPath} alt={this.props.alt} isFluid={isFluid}/>
            : <Placeholder className={imageClass} width={this.props.width} height={this.props.height} tmdbSize={this.props.tmdbSize} alt={this.props.alt} initials={this.props.initials} isFluid={isFluid}/>
          }
          {this.props.children}
        </Link>
      )
    } else {
      return(
        <div class={className} style={style}>
          {!isEmpty(this.props.posterPath)
            ? <TMDBPoster className={imageClass} tmdbSize={this.props.tmdbSize} posterPath={this.props.posterPath} alt={this.props.alt} isFluid={isFluid}/>
            : <Placeholder className={imageClass} width={this.props.width} height={this.props.height} tmdbSize={this.props.tmdbSize} alt={this.props.alt} initials={this.props.initials} isFluid={isFluid}/>
          }
          {this.props.children}
        </div>
      )
    }
  }
}

import React from 'react'
import {connect} from 'react-redux'
import {Pie, Bar} from 'react-chartjs-2' // This library is around 200 KB
import {colors, redMono} from 'utils/colors'
import {Link} from 'react-router-dom'

import {Loading} from 'components/notifications'
import {MoviePoster,PersonPoster, DefaultPoster} from 'components/posters'

let componentKey = 0

@connect((store) => {
  return {
    id: store.fetch.collection.id,
    media: store.settings.media,
    settings: store.fetch.collection.settings,
    count: store.fetch.collection.count,
    overview: store.fetch.collection.overview
  }
})
export default class Overview extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isLoading: true
    }
    this._handleChartClick = this._handleChartClick.bind(this)
  }

  _handleChartClick(chartElement, {field}){
    const value = chartElement[0]._view.label
    let thisFilter = {}
    switch (field) {
      case 'language':
      case 'keywords':
      case 'genres':
        thisFilter = {
          "movies":{
            "AND":[{
              field,
              value,
              condition: "includes"
            }]
          }
        }
        break;
        case 'rating':
          thisFilter = {
            "movies":{
              "AND":[{
                field,
                value: parseFloat(value),
                condition: "ge"
              }]
            }
          }
          break;
      default:
    }
    this.props.history.push(`/collection/${this.props.id}/movies/${JSON.stringify([thisFilter])}`)
  }

  render () {
    // Loading
    if (this.state.isLoading){
      <Loading message="Loading movies ...." />
    }

    const { top, years, genres, ratings, keywords, languages } = this.props.overview

    return (
      <div class="ui padded divided grid">
        <div class="stackable info row">
          <div class="blue sixteen wide tablet five wide computer column">
            <div class="ui header">Description</div>
            <p>{this.props.settings.description}</p>
          </div>
          <div class="black eight wide tablet six wide computer column" style={{backgroundColor: '#2c3e50'}}>
            <h3 class="ui center aligned header">Stats</h3>
            <div class="ui two column stackable grid">
              <div class="column">
                <div class='ui very relaxed selection list'>
                  <Link to={`/collection/${this.props.id}/movies`} class='item'>
                    <img class="image" src="/assets/images/hdd.svg" />
                    <div class='content'>
                      <div class='header'>
                        Collection Size
                      </div>
                      <div class='description'>
                        {this.props.count.total} items totally {this.props.count.size.total}
                      </div>
                    </div>
                  </Link>
                  <div class='item' style={{cursor: 'default'}}>
                    <img class="image" src="/assets/images/folder.svg" />
                    <div class='content'>
                      <div class='header'>
                        Location
                      </div>
                      <div class='description'>
                        NA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="ui very relaxed selection list">
                  <Link to={`/collection/${this.props.id}/edit/movies`} class='item'>
                    <i class='green big check icon' />
                    <div class='content'>
                      <div class='header'>
                        Detected Movies
                      </div>
                      <div class='description'>
                        {this.props.count.movies} totalling {this.props.count.size.movies}
                      </div>
                    </div>
                  </Link>
                  <Link to={`/collection/${this.props.id}/edit/errors`} class='item'>
                    <i class='big red close icon' />
                    <div class='content'>
                      <div class='header'>
                        Unknown
                      </div>
                      <div class='description'>
                        {this.props.count.errors} titles not matched.
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="red eight wide tablet five wide computer column" style={{backgroudColor: '#c0392b !important'}}>
            <h3 class="ui center aligned header">Summary</h3>
            <div class="ui two column stackable grid">
              <div class="column">
                <div class="ui very relaxed selection list">
                  <Link to={`/collection/${this.props.id}/movies`} class="item">
                    <img class="image" src="/assets/images/movie.svg" />
                    <div class="content">
                      <div class="header">Movies</div>
                      <div class="description">
                        {this.props.count.movies} movies detected
                      </div>
                    </div>
                  </Link>
                  <Link to={`/collection/${this.props.id}/people`} class="item">
                    <img class="image" src="/assets/images/person.svg" />
                    <div class="content">
                      <div class="header">Cast & Crew</div>
                      <div class="description">
                        {this.props.count.people.cast} cast identified
                      </div>
                    </div>
                  </Link>
                  <Link to={`/collection/${this.props.id}/movies/[{"movies": {"AND":[{"field": "awards", "value": "oscar", "condition": "includes"}]}}]`} class="item">
                    <img class="image" src="/assets/images/oscar.svg" />
                    <div class="content">
                      <div class="header">Oscar</div>
                      <div class="description">
                        {this.props.count.oscars} oscar movies
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
              <div class="column">
                <div class="ui very relaxed selection list">
                  <div class="item" style={{cursor: 'default'}}>
                    <img class="image" src="/assets/images/poster.svg" />
                    <div class="content">
                      <div class="header">HD Posters</div>
                      <div class="description">
                        {this.props.count.posters} posters available
                      </div>
                    </div>
                  </div>
                  <div class="item" style={{cursor: 'default'}}>
                    <img class="image" src="/assets/images/youtube.svg" />
                    <div class="content">
                      <div class="header">Youtube Trailers</div>
                      <div class="description">
                        {this.props.count.trailers} trailers found
                      </div>
                    </div>
                  </div>
                  <Link to={`/collection/${this.props.id}/movies/[{"movies": {"AND":[{"field": "format", "value": "blu", "condition": "includes"}]}}]`} class="item">
                    <img class="image" src="/assets/images/bluray.svg" />
                    <div class="content">
                      <div class="header">Bluray Movies</div>
                      <div class="description">
                        {this.props.count.blurays} found
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="no-padding posters row">
          {top.movies.slice(0,8).map(movie =>
            <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++}>
              <MoviePoster movie={movie} tmdbSize="w185" baseWidth="100%" baseURL={this.props.match.path.replace('overview', 'movie')} />
            </div>
          )}
        </div>
        <div class="black stackable equal width computer only row">
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Top Genres</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'genres'})} data={{labels:genres.map(a => a.name).slice(0,6), counts: genres.map(a => a.count).slice(0,6)}} type="pie" width={this.props.media.width/3 - '20'} height={this.props.media.width/6} />
          </div>
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Rating Distribution</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'rating'})} data={{labels:ratings.map(a => a.name), counts: ratings.map(a => a.count)}} type="bar" width={this.props.media.width/3 - '20'} height={this.props.media.width/6} />
          </div>
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Top Keywords</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'keywords'})} data={{labels:keywords.map(a => a.name).slice(0,6), counts: keywords.map(a => a.count).slice(0,6)}} width={300} height={150} type="pie" width={this.props.media.width/3 - '20'} height={this.props.media.width/6} />
          </div>
        </div>
        <div class="black stackable equal width tablet only row">
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Top Genres</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'genres'})} data={{labels:genres.map(a => a.name).slice(0,6), counts: genres.map(a => a.count).slice(0,6)}} type="pie" width={this.props.media.width/2 - '20'} height={this.props.media.width/4} />
          </div>
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Rating Distribution</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'rating'})} data={{labels:ratings.map(a => a.name), counts: ratings.map(a => a.count)}} type="bar" width={this.props.media.width/2 - '20'} height={this.props.media.width/4} />
          </div>
        </div>
        <div class="black stackable equal width tablet only row">
          <div class='column'>
            <h3 class='ui center aligned header' style={{marginTop: '0', marginBottom: '3.5rem'}}>Language Distribution</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'language'})} data={{labels:languages.map(a => a.name), counts: languages.map(a => a.count)}} type="bar" width={this.props.media.width/2 - '20'} height={this.props.media.width/4} />
          </div>
          <div class="column">
            <h3 class="ui center aligned header" style={{marginTop: '0', marginBottom: '1.5rem', marginBottom: '3.5rem'}}>Top Keywords</h3>
            <Chart onClick={(e) => this._handleChartClick(e, {field: 'keywords'})} data={{labels:keywords.map(a => a.name).slice(0,6), counts: keywords.map(a => a.count).slice(0,6)}} width={300} height={150} type="pie" width={this.props.media.width/2 - '20'} height={this.props.media.width/4} />
          </div>
        </div>
        <div class="no-padding posters row">
          {top.revenue.slice(0,8).map(movie =>
            <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++}>
              <MoviePoster movie={movie} tmdbSize="w185" baseWidth="100%" baseURL={this.props.match.path.replace('overview', 'movie')} key={componentKey++} />
            </div>
          )}
        </div>
        <div class="no-padding posters row" style={{paddingBottom: '0'}}>
          {top.people.slice(0,8).map(person =>
            <div class="no-padding eight wide mobile four wide tablet two wide computer column" key={componentKey++}>
              <PersonPoster person={person} tmdbSize="w185" baseWidth="100%" baseURL={this.props.match.url.replace('overview', 'person')} key={componentKey++} />
            </div>
          )}
        </div>
      </div>
    )
  }

  componentDidMount(){
    this.setState({isLoading: false})
  }
}

function Chart (props) {
  const { labels, counts } = props.data
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: (props.type === 'bar') ? '#DB2828' : colors
      }
    ]
  }
  const chartOptions = {
    responsive: false,
    maintainAspectRatio: true,
    legend: {
      position: (props.type === 'pie') ? 'left' : 'auto',
      display: props.type !== 'bar',
      labels: {
        fontColor: 'white',
        fontFamily: "'Proxima-Nova-Thin', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  }

  if (props.type === 'pie') return (<Pie getElementsAtEvent={props.onClick} data={chartData} options={chartOptions} width={props.width} height={props.height} onClick={props.onClick} />)
  if (props.type === 'bar') return (<Bar getElementsAtEvent={props.onClick} data={chartData} options={chartOptions} width={props.width} height={props.height} onClick={props.onClick} />)
  return (null)
}

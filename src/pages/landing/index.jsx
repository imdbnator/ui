import React from 'react'
import {Link} from 'react-router-dom'
import Typed from 'typed.js'
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal.js'
import Load from 'components/load'

const debug = process.env.NODE_ENV !== "production"

export default class Landing extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      stats: {
        collections: 0,
        movies: 0
      }
    }
  }
  render () {
    const style = {
      background: 'url(assets/images/background.png)',
      backgroundSize: '100% auto'
    }
    return (
      <reactdiv>
        <div class="ui inverted borderless no-margin menu">
          <div class="left menu">
            <Link to='/' class="header item">
              IMDBnator
            </Link>
            <div class="item">
              <div class="description">
              Simple, free online movie cataloging.
              </div>
            </div>
          </div>
        </div>
        <div class="background" style={{backgroundImage: `url(https://d23c7nf4jw8oo7.cloudfront.net/cdnized/bg_96580c311a9a.png)`}}></div>

        <div class='ui text container grid' style={{marginTop: '4rem', minHeight: '100vh'}}>
          <div class="row">
            <Load addClass='column'>
              <h1 class='ui center aligned inverted header'>
                Catalog movies on <span id='typed'>a Website.</span>
                <div class='sub header'>
                  All your movie data with format, ratings, trailer, genre, cast, plot & more in one place.
                </div>
              </h1>
            </Load>
          </div>
        </div>

        <div class="ui page stackable grid" id="features">
          <div class="row">
            <div class="center aligned column">
              <h1 class="ui header">
                IMDbnator
                <div class="sub header">
                  Your movie collection has never been this organized.
                </div>
              </h1>
            </div>
          </div>
          <div class="ui hidden divider"></div>
          <div class="row">
            <div class="seven wide center aligned column">
              <div class="ui image">
                <img src="https://semantic-ui.com/images/wireframe/square-image.png" />
              </div>
            </div>
            <div class="two wide column"></div>
            <div class="seven wide middle aligned column">
              <div class="ui inverted black segment">
                <h1 class="ui header">
                  Search, sort and filter
                </h1>
                <p>
                  View essential movie info like RT meter, IMDb rating, genre, cast, director, awards, runtime etc. alongside every movie.
                </p>
                <p>
                  So that the next time you watch a movie, you don't regret it.
                </p>
              </div>

            </div>
          </div>
          <div class="ui hidden divider"></div>
          <div class="row">
            <div class="seven wide middle aligned column">
              <div class="ui inverted black segment">
                <h1 class="ui header">
                  Watch Trailers instantly.
                </h1>
                <p>
                  We gather all trailers for collection and provide them to you for quick access.
                </p>
                <p>
                  So that the next time you watch a movie, you don't regret it.
                </p>
              </div>
            </div>
            <div class="two wide column"></div>
            <div class="seven wide center aligned column">
              <div class="ui image">
                <img src="https://i.ytimg.com/vi/0MfA3xOmwRM/mqdefault.jpg" />
              </div>
            </div>
          </div>
          <div class="ui hidden divider"></div>
          <div class="row">
            <div class="seven wide center aligned column">
              <div class="ui image">
                <img src="https://image.tmdb.org/t/p/w154/imekS7f1OuHyUP2LAiTEM0zBzUz.jpg" />
              </div>
            </div>
            <div class="two wide column"></div>
            <div class="seven wide middle aligned column">
              <div class="ui inverted black segment">
                <h1 class="ui header">
                  Beautiful HD Posters.
                </h1>
                <p>
                  Make your collection standout with <b>1080 HD</b> posters and backdrops of over 400K movies.
                </p>
                <p>
                  There is no better way to show off your collection.
                </p>
              </div>
            </div>
          </div>
          <div class="ui hidden divider"></div>
          {/*<div class="row">
            <div class="seven wide middle aligned column">
              <div class="ui inverted black segment">
                <h1 class="ui header">
                  Download data
                </h1>
                <p>
                  Get all the movie data of your collection for offline use. You can view the data as a .CSV file.
                </p>
              </div>
            </div>
            <div class="two wide column"></div>
            <div class="seven wide center aligned column">
              <div class="ui image">
                <img src="https://semantic-ui.com/images/wireframe/square-image.png" />
              </div>
            </div>
          </div>*/}
        </div>

        <div class="ui page grid" style={{paddingTop: '6em', paddingBottom:'6em'}}>
          <div class="row">
            <div class="center aligned column">
              <a class="ui huge labeled icon primary button" href="#">
                <i class="up arrow icon"></i>
                Catalog your Collection
              </a>
            </div>
          </div>
        </div>

        <div class="ui page stackable grid" style={{paddingBottom:'6em'}}>
          <div class="row">
            <div class="column">
              <div class="ui three inverted red stackable statistics">
                <div class="statistic">
                  <div class="value">
                    1.3M
                  </div>
                  <div class="label">
                    Titles Scanned
                  </div>
                </div>
                <div class="statistic">
                  <div class="value">
                    {50 + this.state.stats.collections}
                  </div>
                  <div class="label">
                    Collections today
                  </div>
                </div>
                <div class="statistic">
                  <div class="value">
                    {14204 + this.state.stats.movies}
                  </div>
                  <div class="label">
                    Titles Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ui hidden divider"></div>

        <footer>
        <div class="ui inverted vertical footer segment" style={{paddingTop: '3em'}}>
          <div class="ui three column container stackable grid">
            <div class="column">
              <h4 class="ui inverted header">Community</h4>
              <div class="ui inverted link list">

                <Modal trigger={<a class="item" href="javascript:void(0)">FAQ</a>}>
                  <div class="header">FAQ</div>
                  <div class="content">
                    <div class="ui very relaxed list">
                      <div class="item">
                        <div class="header">How do I get recommendations from my collection?</div>
                        <p>After you browse your collection, it takes less than 30 seconds to process the movie file names and identify the movie from it. Once cataloged, you can filter, sort and discover titles based on rating, year, language and more.</p>
                        <p>Further, when you view a title we also provide similar titles that exist in your collection.</p>
                      </div>
                      <div class="item">
                        <div class="header">How do I watch movies?</div>
                        <p>We dont't stream or index movies. This site helps discovering movies from your scattered collection. Typically, this can be used by someone who wishes to discover movies from his/her or friend's collection before watching your next film!</p>
                      </div>
                      <div class="item">
                        <div class="header">How can I edit my collection later on?</div>
                        <p>Once you've created a list, we store a cookie in your browser that recognizes that you own a collection. Further, you will be given a secret key with which you can modify your collection.</p>
                      </div>
                      <div class="item">
                        <div class="header">How do I correct incorrect movie matches?</div>
                        <p>If you've created a collection, you will have the ability to edit your collection at a later time by clicking the "Edit" tab that is found in the top right corner of your collection.</p>
                      </div>
                      <div class="item">
                        <div class="header">When will there be support for TV Series & Episodes?</div>
                        <p>As of now, we only have the ability to detect movies from your file. The TV Series and Episode detection is one of the immediate features that we are working on. However, the development of this feature will only continue based on user feedback.</p>
                      </div>
                      <div class="item">
                        <div class="header">Movies from which countries do you support?</div>
                        <p>Our databases includes over 400K+ international titles including English, Dutch, French, Italian, Russian, Hindi, Persian and more. However, translations of original titles are not fully supported and might fetch movie with quite a few errors.</p>
                      </div>
                      <div class="item">
                        <div class="header">How do I create an account?</div>
                        <p>As of now, we do not support user registrations. We wish to add it some time in the near future when we have established a good pool of visitors with steady usage.</p>
                      </div>
                      <div class="item">
                        <div class="header">When will you release an offline app?</div>
                        <p>We’d love to create them but currently don’t have the resources to do so. We plan to build one as IMDbnator grows. Until then just use IMDbnator through your mobile web browser! It’s not perfect but it works well!</p>
                      </div>
                    </div>
                  </div>
                </Modal>
                <Modal trigger={<a class="item" href="javascript:void(0)" target="_blank">Report an Issue</a>}>
                  <div class="header">Report an Issue</div>
                  <div class="content">
                    <div class="description">
                      <p>Use the form below or send us an email at <a href="mailto:imdbnator@gmail.com">imdbnator@gmail.com</a>. We will get back to you within 24 hours!</p>
                      <p>
                      <iframe src="http://kontactr.com/xuser/212841" width="368px" height="600px" frameBorder="0"></iframe>
                      </p>
                    </div>
                  </div>
                </Modal>
                <Modal trigger={<a class="item" href="javascript:void(0)" target="_blank">Usage Documentation</a>}>
                  <div class="header">Documentation</div>
                  <div class="content">
                    <div class="description">
                      Please come back later. The documentation is under construction.
                    </div>
                  </div>
                </Modal>
                <a class="item" href="https://github.com/saikrishnadeep/imdbnator">Contribute</a>
              </div>
            </div>
            <div class="column">
              <h4 class="ui inverted header">Links</h4>
              <div class="ui inverted link list">
                <Modal trigger={<a class="item" href="javascript:void(0)">About</a>}>
                  <div class="header">About</div>
                  <div class="content">
                    <div class="ui header">Why IMDBnator?</div>
                    <p>IMDBnator is a simple tool to catalog and discover movies in your collection for free. It was a simple idea of a friend who wanted to make a script that would catalog out all the movies on his computer. So that he could choose which movie to watch based on his taste out of 500+ movie collection on our college LAN Network. It took very little time to create a prototype version and viola... the first version was released on 2015.
                    </p>
                    <p>To test the application in real life, we chose genres and actors (I love Biography and Brad Pitt!) that we most loved and watched 3 movies back to back. To our surprise, we enjoyed them all! It was clearly evident how useful this aoo would be. It enabled us simply to discover movies of our tastes instead of scrambling across the whole collection.</p>
                    <p>The latest version which incorporates lots of new features was released on 27th September as a final beta release.</p>
                    <div class="ui header">Who are we?</div>
                    <p>This website was coded by <a href="http://www.cmi.ac.in/~saikrishnac/" target="_blank">Sai</a> (Frontend, Backend) and <a href="https://github.com/paramjit" target="_blank">Paramjit</a> (Data, Backend). We are (were) undergraduates pursuing Physics & Mathematics at Chennai Mathematical Institute, India.</p>
                    <p>You can contact us at <a href="mailto:imdbnator@gmail.com">imdbnator@gmail.com</a> to share an idea or suggestion and we will get back to you as soon as possible :)</p>
                  </div>
                </Modal>
                <Modal trigger={<a class="item" href="javascript:void(0)">Privacy</a>}>
                  <div class="header">Privacy</div>
                  <div class="content">
                    <div class="ui bulleted list">
                      <div class="item">We do not store any information about the user and their IP address.</div>
                      <div class="item">We store the collection and the ID assigned to it in our database. Nothing more.</div>
                      <div class="item">We use <a href="https://www.w3schools.com/html/html5_webstorage.asp" target="_blank">localStorage</a> on your browser if you created a collection to load your collection faster. If you wish, you can easily clear it by following instructions for your browser.</div>
                      <div class="item">This website is open sourced.</div>
                    </div>
                  </div>
                </Modal>
                <Modal trigger={<a class="item" href="javascript:void(0)" target="_blank">Contact Us</a>}>
                  <div class="header">Contact</div>
                  <div class="content">
                    <div class="description">
                      <p>Use the form below or send us an email at <a href="mailto:imdbnator@gmail.com">imdbnator@gmail.com</a>. We will get back to you within 24 hours!</p>
                      <p>
                      <iframe src="http://kontactr.com/xuser/212841" width="368px" height="600px" frameBorder="0"></iframe>
                      </p>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
            <div class="column">
              <a href="https://github.com/saikrishnadeep/imdbnator">
                <h4 class="ui inverted teal header">
                  <i class="grey github icon"></i>
                  Help Preserve This Project
                </h4>
              </a>
              <p> Please support by sharing us for continued development of this website or you could give us your valuable feedback!              </p>
              <a href="https://www.facebook.com/sharer/sharer.php?u=http%3A//imdbnator.com" target="_blank" class="ui facebook button">
                <i class="facebook icon"></i>
                Facebook
              </a>
              <a href="https://twitter.com/home?status=Check%20out%20this%20amazing%20website%20that%20helps%20cataloging%20movie%20collections!%20%3A)" target="_blank" class="ui twitter button">
                <i class="twitter icon"></i>
                Twitter
              </a>
              <a href="http://vk.com/share.php?url=http://imdbnator.com" target="_blank" class="ui vk button">
                <i class="vk icon"></i>
                VK
              </a>
            </div>
            <div class="eight wide column">
              <div class="ui inverted horizontal link list">
                <div class="item"><i class="copyright icon"></i> <a href="/">IMDbnator.com</a></div>
                <div class="item">Made with <i class="red heart icon"></i> for the internet by <a href="http://www.cmi.ac.in/~saikrishnac/" target="_blank">SKD</a> and <a href="https://github.com/paramjit" target="_blank">Yolo</a>.</div>
              </div>
            </div>
          </div>
        </div>
        </footer>

      </reactdiv>
    )
  }
  componentDidMount () {
    const $elem = document.getElementById('typed')
    var typed = new Typed($elem, {
      strings: ['your HDD.^500', 'a Website.^500', 'your Computer.^500'],
      typeSpeed: 100
    })

    fetch(`//${process.env.API_HOST}/collection?date=0`, {
      method: 'get',
    })
    .then(function (response) {
      if (response.status !== 200) throw new Error(`API server ${response.status} status error.`)
      return response.json()
    })
    .then(data => {
      if (!data.success) throw new Error(data.message)
      debug && console.log('Stats (INFO):', data)
      this.setState({stats: data.stats})
    })
    .catch((err) => {
      debug && console.log(err.message)
    })
  }
}

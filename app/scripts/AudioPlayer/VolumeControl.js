var React = require('react')
var {PropTypes} = React;

var RefluxActions = require('../RefluxActions')

export default class VolumeControl extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      volume: localStorage.getItem('volume') || props.defaultVolume,
      isMuted: false
    }

    this._mouseDownGrabber = this._mouseDownGrabber.bind(this)
    this._mouseMove = this._mouseMove.bind(this)
    this._mouseUp = this._mouseUp.bind(this)
    this._toggleMute = this._toggleMute.bind(this)
  }

  componentDidMount() {
    RefluxActions.mute.listen(this._toggleMute)
  }

  componentWillUnmount() {
    RefluxActions.mute.unlisten(this._toggleMute)
  }

  _mouseDownGrabber(event) {
    document.addEventListener('mousemove', this._mouseMove)
    document.addEventListener('mouseup', this._mouseUp)
    document.body.classList.add('nohighlight')
    this._setVolume(event.pageX)
  }

  _mouseMove(event) {
    event.preventDefault()
    this._setVolume(event.pageX)
  }

  _toggleMute() {
    if (this.state.isMuted) {
      this._directSetVolume(localStorage.getItem('previousVolume'))
    } else {
      localStorage.setItem('previousVolume', this.state.volume)
      this._directSetVolume(0)
    }

    this.setState({
      isMuted: !this.state.isMuted
    })
  }

  _directSetVolume(volume)
  {
    if (volume < 0) { volume = 0 }
    if (volume > 1) { volume = 1 }
    RefluxActions.changeVolume(Math.pow(volume, 2))
    this.setState({
      volume: volume
    })
    localStorage.setItem('volume', volume)
  }

  _setVolume(mouseX) {
    var container = this.refs.container.getBoundingClientRect()
    var volume = (mouseX - container.left) / container.width
    if (volume < 0) { volume = 0 }
    if (volume > 1) { volume = 1 }

    this._directSetVolume(volume)
  }

  _mouseUp() {
    document.removeEventListener('mousemove', this._mouseMove)
    document.removeEventListener('mouseup', this._mouseUp)
    document.body.classList.remove('nohighlight')
  }
  render() {
    return (
      <div id='volume-container'
        ref="container"
        onMouseDown={this._mouseDownGrabber}
        >
        <div
          style={{
            width: this.state.volume * 100 + '%'
          }}
          id='volume-bar'
          ref='volumeBar'>
          <div id='volume-grabber'></div>
        </div>
      </div>
    )
  }
}
VolumeControl.defaultProps = {
  volume: 1,
}
VolumeControl.propTypes = {
  volume: PropTypes.number,
}

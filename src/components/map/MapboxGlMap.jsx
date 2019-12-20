import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import MapboxGl from 'mapbox-gl'
import MapboxInspect from 'mapbox-gl-inspect'
import FeatureLayerPopup from './FeatureLayerPopup'
import FeaturePropertyPopup from './FeaturePropertyPopup'
import tokens from '../../config/tokens.json'
import colors from 'mapbox-gl-inspect/lib/colors'
import Color from 'color'
import ZoomControl from '../../libs/zoomcontrol'
import { colorHighlightedLayer } from '../../libs/highlight'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../../mapboxgl.css'
import '../../libs/mapbox-rtl'


const IS_SUPPORTED = MapboxGl.supported();

function renderPopup(popup, mountNode) {
  ReactDOM.render(popup, mountNode);
  var content = mountNode.innerHTML;
  return content;
}

function buildInspectStyle(originalMapStyle, coloredLayers, highlightedLayer) {
  const backgroundLayer = {
    "id": "background",
    "type": "background",
    "paint": {
      "background-color": '#1c1f24',
    }
  }

  const layer = colorHighlightedLayer(highlightedLayer)
  if(layer) {
    coloredLayers.push(layer)
  }

  const sources = {}
  Object.keys(originalMapStyle.sources).forEach(sourceId => {
    const source = originalMapStyle.sources[sourceId]
    if(source.type !== 'raster' && source.type !== 'raster-dem') {
      sources[sourceId] = source
    }
  })

  const inspectStyle = {
    ...originalMapStyle,
    sources: sources,
    layers: [backgroundLayer].concat(coloredLayers)
  }
  return inspectStyle
}

export default class MapboxGlMap extends React.Component {
  static propTypes = {
    onDataChange: PropTypes.func,
    onLayerSelect: PropTypes.func.isRequired,
    mapStyle: PropTypes.object.isRequired,
    inspectModeEnabled: PropTypes.bool.isRequired,
    highlightedLayer: PropTypes.object,
    options: PropTypes.object,
  }

  static defaultProps = {
    onMapLoaded: () => {},
    onDataChange: () => {},
    onLayerSelect: () => {},
    mapboxAccessToken: tokens.mapbox,
    options: {},
  }

  constructor(props) {
    super(props)
    MapboxGl.accessToken = tokens.mapbox
    this.state = {
      map: null,
      inspect: null,
    }
  }

  updateMapFromProps(props) {
    if(!IS_SUPPORTED) return;

    if(!this.state.map) return
    const metadata = props.mapStyle.metadata || {}
    MapboxGl.accessToken = metadata['maputnik:mapbox_access_token'] || tokens.mapbox

    //Mapbox GL now does diffing natively so we don't need to calculate
    //the necessary operations ourselves!
    this.state.map.setStyle(props.mapStyle, {diff: true})
  }

  componentDidUpdate(prevProps) {
    if(!IS_SUPPORTED) return;

    const map = this.state.map;

    this.updateMapFromProps(this.props);

    if(this.props.inspectModeEnabled !== prevProps.inspectModeEnabled) {
      // HACK: Fix for <https://github.com/maputnik/editor/issues/576>, while we wait for a proper fix.
      // eslint-disable-next-line
      this.state.inspect._popupBlocked = false;
      this.state.inspect.toggleInspector()
    }
    if(this.props.inspectModeEnabled) {
      this.state.inspect.render()
    }

    if (map) {
      map.showTileBoundaries = this.props.options.showTileBoundaries;
      map.showCollisionBoxes = this.props.options.showCollisionBoxes;
      map.showOverdrawInspector = this.props.options.showOverdrawInspector;
    }
  }

  componentDidMount() {
    if(!IS_SUPPORTED) return;

    const mapOpts = {
      ...this.props.options,
      container: this.container,
      style: this.props.mapStyle,
      hash: true,
    }

    const map = new MapboxGl.Map(mapOpts);

    map.showTileBoundaries = mapOpts.showTileBoundaries;
    map.showCollisionBoxes = mapOpts.showCollisionBoxes;
    map.showOverdrawInspector = mapOpts.showOverdrawInspector;

    const zoom = new ZoomControl;
    map.addControl(zoom, 'top-right');

    const nav = new MapboxGl.NavigationControl({visualizePitch:true});
    map.addControl(nav, 'top-right');

    const tmpNode = document.createElement('div');

    const inspect = new MapboxInspect({
      popup: new MapboxGl.Popup({
        closeOnClick: false
      }),
      showMapPopup: true,
      showMapPopupOnHover: false,
      showInspectMapPopupOnHover: true,
      showInspectButton: false,
      blockHoverPopupOnClick: true,
      assignLayerColor: (layerId, alpha) => {
        return Color(colors.brightColor(layerId, alpha)).desaturate(0.5).string()
      },
      buildInspectStyle: (originalMapStyle, coloredLayers) => buildInspectStyle(originalMapStyle, coloredLayers, this.props.highlightedLayer),
      renderPopup: features => {
        if(this.props.inspectModeEnabled) {
          return renderPopup(<FeaturePropertyPopup features={features} />, tmpNode);
        } else {
          return renderPopup(<FeatureLayerPopup features={features} onLayerSelect={this.props.onLayerSelect} zoom={this.state.zoom} />, tmpNode);
        }
      }
    })
    map.addControl(inspect)

    map.on("style.load", () => {
      this.setState({
        map,
        inspect,
        zoom: map.getZoom()
      });
      if(this.props.inspectModeEnabled) {
        inspect.toggleInspector();
      }
    })

    map.on("data", e => {
      if(e.dataType !== 'tile') return
      this.props.onDataChange({
        map: this.state.map
      })
    })

    map.on("error", e => {
      console.log("ERROR", e);
    })

    map.on("zoom", e => {
      this.setState({
        zoom: map.getZoom()
      });
    })
  }

  render() {
    if(IS_SUPPORTED) {
      return <div
        className="maputnik-map__map"
        ref={x => this.container = x}
      ></div>
    }
    else {
      return <div
        className="maputnik-map maputnik-map--error"
      >
        <div className="maputnik-map__error-message">
          Error: Cannot load MapboxGL, WebGL is either unsupported or disabled
        </div>
      </div>
    }
  }
}

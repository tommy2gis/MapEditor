import React from 'react'
import PropTypes from 'prop-types'
import LoadingModal from './LoadingModal'
import Modal from './Modal'
import Button from '../Button'
import FileReaderInput from 'react-file-reader-input'
import UrlInput from '../inputs/UrlInput'

import {MdFileUpload} from 'react-icons/md'
import {MdAddCircleOutline} from 'react-icons/md'

import style from '../../libs/style.js'
import publicStyles from '../../config/styles.json'

class PublicStyle extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
  }

  render() {
    return <div className="maputnik-public-style">
      <Button
        className="maputnik-public-style-button"
        aria-label={this.props.title}
        onClick={() => this.props.onSelect(this.props.url)}
      >
        <header className="maputnik-public-style-header">
          <h4>{this.props.title}</h4>
          <span className="maputnik-space" />
          <MdAddCircleOutline />
        </header>
        <div
          className="maputnik-public-style-thumbnail"
          style={{
            backgroundImage: `url(${this.props.thumbnailUrl})`
          }}
        ></div>
      </Button>
    </div>
  }
}

class OpenModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onOpenToggle: PropTypes.func.isRequired,
    onStyleOpen: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      styleUrl: ""
    };
  }

  clearError() {
    this.setState({
      error: null
    })
  }

  onCancelActiveRequest(e) {
    // Else the click propagates to the underlying modal
    if(e) e.stopPropagation();

    if(this.state.activeRequest) {
      this.state.activeRequest.abort();
      this.setState({
        activeRequest: null,
        activeRequestUrl: null
      });
    }
  }

  onStyleSelect = (styleUrl) => {
    this.clearError();

    let canceled;

    const activeRequest = fetch(styleUrl, {
      mode: 'cors',
      credentials: "same-origin"
    })
    .then(function(response) {
      return response.json();
    })
    .then((body) => {
      if(canceled) {
        return;
      }

      this.setState({
        activeRequest: null,
        activeRequestUrl: null
      });

      const mapStyle = style.ensureStyleValidity(body)
      console.log('Loaded style ', mapStyle.id)
      this.props.onStyleOpen(mapStyle)
      this.onOpenToggle()
    })
    .catch((err) => {
      this.setState({
        error: `Failed to load: '${styleUrl}'`,
        activeRequest: null,
        activeRequestUrl: null
      });
      console.error(err);
      console.warn('Could not open the style URL', styleUrl)
    })

    this.setState({
      activeRequest: {
        abort: function() {
          canceled = true;
        }
      },
      activeRequestUrl: styleUrl
    })
  }

  onOpenUrl = (url) => {
    this.onStyleSelect(this.state.styleUrl);
  }

  onUpload = (_, files) => {
    const [e, file] = files[0];
    const reader = new FileReader();

    this.clearError();

    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      let mapStyle;
      try {
        mapStyle = JSON.parse(e.target.result)
      }
      catch(err) {
        this.setState({
          error: err.toString()
        });
        return;
      }
      mapStyle = style.ensureStyleValidity(mapStyle)
      this.props.onStyleOpen(mapStyle);
      this.onOpenToggle();
    }
    reader.onerror = e => console.log(e.target);
  }

  onOpenToggle() {
    this.setState({
      styleUrl: ""
    });
    this.clearError();
    this.props.onOpenToggle();
  }

  onChangeUrl = (url) => {
    this.setState({
      styleUrl: url,
    });
  }

  render() {
    const styleOptions = publicStyles.map(style => {
      return <PublicStyle
        key={style.id}
        url={style.url}
        title={style.title}
        thumbnailUrl={style.thumbnail}
        onSelect={this.onStyleSelect}
      />
    })

    let errorElement;
    if(this.state.error) {
      errorElement = (
        <div className="maputnik-modal-error">
          {this.state.error}
          <a href="#" onClick={() => this.clearError()} className="maputnik-modal-error-close">×</a>
        </div>
      );
    }

    return  (
      <div>
        <Modal
          data-wd-key="open-modal"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={'打开样式'}
        >
          {errorElement}
          <section className="maputnik-modal-section">
            <h2>上传样式文件</h2>
            <p>从本地上传一个JSON样式文件.</p>
            <FileReaderInput onChange={this.onUpload} tabIndex="-1">
              <Button className="maputnik-upload-button"><MdFileUpload /> 上传</Button>
            </FileReaderInput>
          </section>

          <section className="maputnik-modal-section">
            <h2>从URL加载样式</h2>
            <p>
              
            </p>
            <UrlInput
              data-wd-key="open-modal.url.input"
              type="text"
              className="maputnik-input"
              default="Enter URL..."
              value={this.state.styleUrl}
              onInput={this.onChangeUrl}
            />
            <div>
              <Button
                data-wd-key="open-modal.url.button"
                className="maputnik-big-button"
                onClick={this.onOpenUrl}
                disabled={this.state.styleUrl.length < 1}
              >打开URL地址</Button>
            </div>
          </section>

          <section className="maputnik-modal-section maputnik-modal-section--shrink">
            <h2>样式集浏览</h2>
            <p>
              选择一个在线样式
            </p>
            <div className="maputnik-style-gallery-container">
            {styleOptions}
            </div>
          </section>
        </Modal>

        <LoadingModal
          isOpen={!!this.state.activeRequest}
          title={'加载样式'}
          onCancel={(e) => this.onCancelActiveRequest(e)}
          message={this.state.activeRequestUrl+":加载中"}
        />
      </div>
    )
  }
}

export default OpenModal

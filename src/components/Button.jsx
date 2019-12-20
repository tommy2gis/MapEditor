import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class Button extends React.Component {
  static propTypes = {
    "data-wd-key": PropTypes.string,
    "aria-label": PropTypes.string,
    onClick: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    children: PropTypes.node,
    disabled: PropTypes.bool,
  }

  render() {
    return <button
      onClick={this.props.onClick}
      disabled={this.props.disabled}
      aria-label={this.props["aria-label"]}
      className={classnames("maputnik-button", this.props.className)}
      data-wd-key={this.props["data-wd-key"]}
      style={this.props.style}>
      {this.props.children}
    </button>
  }
}

export default Button

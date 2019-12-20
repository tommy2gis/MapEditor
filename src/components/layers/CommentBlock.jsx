import React from 'react'
import PropTypes from 'prop-types'

import InputBlock from '../inputs/InputBlock'
import StringInput from '../inputs/StringInput'

class MetadataBlock extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    return <InputBlock
      label={"备注"}
      doc={"填写备注信息"}
      data-wd-key="layer-comment"
    >
      <StringInput
        multi={true}
        value={this.props.value}
        onChange={this.props.onChange}
        default="备注..."
      />
    </InputBlock>
  }
}

export default MetadataBlock

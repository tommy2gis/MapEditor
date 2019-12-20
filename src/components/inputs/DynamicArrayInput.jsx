import React from 'react'
import PropTypes from 'prop-types'
import StringInput from './StringInput'
import NumberInput from './NumberInput'
import Button from '../Button'
import {MdDelete} from 'react-icons/md'
import DocLabel from '../fields/DocLabel'
import EnumInput from '../inputs/SelectInput'
import capitalize from 'lodash.capitalize'


class DynamicArrayInput extends React.Component {
  static propTypes = {
    value: PropTypes.array,
    type: PropTypes.string,
    default: PropTypes.array,
    onChange: PropTypes.func,
    style: PropTypes.object,
    fieldSpec: PropTypes.object,
  }

  changeValue(idx, newValue) {
    console.log(idx, newValue)
    const values = this.values.slice(0)
    values[idx] = newValue
    this.props.onChange(values)
  }

  get values() {
    return this.props.value || this.props.default || []
  }

  addValue = () => {
    const values = this.values.slice(0)
    if (this.props.type === 'number') {
      values.push(0)
    }
    else if (this.props.type === 'enum') {
      const {fieldSpec} = this.props;
      const defaultValue = Object.keys(fieldSpec.values)[0];
      values.push(defaultValue);
    } else {
      values.push("")
    }

    this.props.onChange(values)
  }

  deleteValue(valueIdx) {
    const values = this.values.slice(0)
    values.splice(valueIdx, 1)

    this.props.onChange(values)
  }

  render() {
    const inputs = this.values.map((v, i) => {
      const deleteValueBtn= <DeleteValueButton onClick={this.deleteValue.bind(this, i)} />
      let input;
      if (this.props.type === 'number') {
        input = <NumberInput
          value={v}
          onChange={this.changeValue.bind(this, i)}
        />
      }
      else if (this.props.type === 'enum') {
        const options = Object.keys(this.props.fieldSpec.values).map(v => [v, capitalize(v)]);

        input = <EnumInput
          options={options}
          value={v}
          onChange={this.changeValue.bind(this, i)}
        />
      }
      else {
        input = <StringInput
          value={v}
          onChange={this.changeValue.bind(this, i)}
        />
      }

      return <div
        style={this.props.style}
        key={i}
        className="maputnik-array-block"
        >
        <div className="maputnik-array-block-action">
          {deleteValueBtn}
        </div>
        <div className="maputnik-array-block-content">
          {input}
        </div>
      </div>
    })

    return <div className="maputnik-array">
      {inputs}
      <Button
        className="maputnik-array-add-value"
        onClick={this.addValue}
      >
        Add value
      </Button>
    </div>
  }
}

class DeleteValueButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
  }

  render() {
    return <Button
      className="maputnik-delete-stop"
      onClick={this.props.onClick}
    >
      <DocLabel
        label={<MdDelete />}
        doc={"Remove array entry."}
      />
    </Button>
  }
}

export default DynamicArrayInput

import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import {MdContentCopy, MdVisibility, MdVisibilityOff, MdDelete} from 'react-icons/md'

import LayerIcon from '../icons/LayerIcon'
import {SortableElement, SortableHandle} from 'react-sortable-hoc'


const DraggableLabel = SortableHandle((props) => {
  return <div className="maputnik-layer-list-item-handle">
    <LayerIcon
      className="layer-handle__icon"
      type={props.layerType}
    />
    <span className="maputnik-layer-list-item-id">{props.layerId}</span>
  </div>
});

class IconAction extends React.Component {
  static propTypes = {
    action: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    wdKey: PropTypes.string,
    classBlockName: PropTypes.string,
    classBlockModifier: PropTypes.string,
  }

  renderIcon() {
    switch(this.props.action.value) {
      case 'duplicate': return <MdContentCopy />
      case 'show': return <MdVisibility />
      case 'hide': return <MdVisibilityOff />
      case 'delete': return <MdDelete />
    }
  }

  render() {
    const {classBlockName, classBlockModifier} = this.props;

    let classAdditions = '';
    if (classBlockName) {
      classAdditions = `maputnik-layer-list-icon-action__${classBlockName}`;

      if (classBlockModifier) {
        classAdditions += ` maputnik-layer-list-icon-action__${classBlockName}--${classBlockModifier}`;
      }
    }

    return <button
      tabIndex="-1"
      title={this.props.action.title}
      className={`maputnik-layer-list-icon-action ${classAdditions}`}
      data-wd-key={this.props.wdKey}
      onClick={this.props.onClick}
    >
      {this.renderIcon()}
    </button>
  }
}

class LayerListItem extends React.Component {
  static propTypes = {
    layerId: PropTypes.string.isRequired,
    layerType: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    visibility: PropTypes.string,
    className: PropTypes.string,

    onLayerSelect: PropTypes.func.isRequired,
    onLayerCopy: PropTypes.func,
    onLayerDestroy: PropTypes.func,
    onLayerVisibilityToggle: PropTypes.func,
  }

  static defaultProps = {
    isSelected: false,
    visibility: 'visible',
    onLayerCopy: () => {},
    onLayerDestroy: () => {},
    onLayerVisibilityToggle: () => {},
  }

  static childContextTypes = {
    reactIconBase: PropTypes.object
  }

  getChildContext() {
    return {
      reactIconBase: { size: 14 }
    }
  }

  render() {
    const visibilityAction = this.props.visibility === 'visible' ? {value:'show',title:'显示'} : {value:'hide',title:'隐藏'};

    return <li
      key={this.props.layerId}
      onClick={e => this.props.onLayerSelect(this.props.layerId)}
      data-wd-key={"layer-list-item:"+this.props.layerId}
      className={classnames({
        "maputnik-layer-list-item": true,
        "maputnik-layer-list-item-selected": this.props.isSelected,
        [this.props.className]: true,
      })}>
        <DraggableLabel {...this.props} />
        <span style={{flexGrow: 1}} />
        <IconAction
          wdKey={"layer-list-item:"+this.props.layerId+":delete"}
          action={{value:'delete',title:'删除'}}
          classBlockName="delete"
          onClick={e => this.props.onLayerDestroy(this.props.layerId)}
        />
        <IconAction
          wdKey={"layer-list-item:"+this.props.layerId+":copy"}
          action={{value:'duplicate',title:'复制'}}
          classBlockName="duplicate"
          onClick={e => this.props.onLayerCopy(this.props.layerId)}
        />
        <IconAction
          wdKey={"layer-list-item:"+this.props.layerId+":toggle-visibility"}
          action={visibilityAction}
          classBlockName="visibility"
          classBlockModifier={visibilityAction.value}
          onClick={e => this.props.onLayerVisibilityToggle(this.props.layerId)}
        />
    </li>
  }
}

const LayerListItemSortable = SortableElement((props) => <LayerListItem {...props} />);

export default LayerListItemSortable;

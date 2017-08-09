import React from 'react'
import { Circle } from 'react-progressbar.js'
import { Glyphicon } from 'react-bootstrap'
import * as Style from './Style'

class Group extends React.Component {
  render() {
    let { contextId } = this.props.contextIdReducer
    let style = this.props.active ? Style.menuItem.heading.current : Style.menuItem.heading.normal
    let expandedGlyph = <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} />
    let collapsedGlyph = <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} />
    return (
      <div>
        <div style={style} onClick={this.props.openGroup} >
          {this.props.active ? expandedGlyph : collapsedGlyph}
          <Circle
            progress={this.props.progress}
            options={{ strokeWidth: 15, color: "var(--accent-color-light)", trailColor: "var(--reverse-color)", trailWidth: 15 }}
            initialAnimate={false}
            containerStyle={{ width: '20px', height: '20px', marginRight: '10px', float: 'left' }}
          />
          {this.props.groupIndex.name}
        </div>
        {this.props.active ? this.props.getGroupItems(this) : null}
      </div>
    );
  }

}

module.exports = Group;

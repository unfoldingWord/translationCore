import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components

class Container extends Component {

  componentWillMount() {
  }

  render() {
    let {contextId} = this.props.contextIdReducer;
    let html = <div></div>;
    if (contextId) {
      let {tool, groupId, reference} = contextId;
      html = (
        <div>
          <p>contextId.tool: {tool}</p>
          <p>contextId.groupId: {groupId}</p>
          <p>contextId.reference: {reference.bookId} {reference.chapter}:{reference.verse}</p>
        </div>
      );
    }

    return (
      <div>
        <div>Hello World.</div>
        {html}
      </div>
    );
  }
}

Container.propTypes = {
  currentToolViews: PropTypes.object.isRequired,
  resourcesReducer: PropTypes.object.isRequired,
  contextIdReducer: PropTypes.object.isRequired
}

export default Container;

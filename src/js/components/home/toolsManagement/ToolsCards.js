import React, { Component } from 'react';

// components
import ToolCard from './ToolCard';

class ToolsCards extends Component {
  render() {
    return (
      <div>
        <ToolCard {...this.props} />
      </div>
    );
  }
}

export default ToolsCards;

import React from 'react';
import {Button} from 'react-bootstrap';

class Projects extends React.Component {
  render() {
    return (
      <div style={{height: '400px', borderBottom: "1px solid var(--border-color)", overflowY: 'auto'}}>
        <div style={{marginBottom: '15px'}}>
          <span style={{fontSize: '20px'}}>Your Door43 Projects</span>
        </div>
        {this.props.onlineProjects}
      </div>
    );
  }
}

module.exports = Projects;

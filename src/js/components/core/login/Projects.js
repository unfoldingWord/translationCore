import React from 'react';
import {Button} from 'react-bootstrap';

class Projects extends React.Component {
  render() {
    return (
      <div style={{height: '419px', overflowY: 'auto'}}>
        <div style={{marginBottom: '15px'}}>
          <span style={{fontSize: '20px'}}>Your Door43 Projects</span>
          <Button bsStyle='primary' style={{display: this.props.showBack}} onClick={this.props.back} className={'pull-right'} bsSize='sm'>Back</Button>
          <Button bsStyle='warning' className={'pull-right'} onClick={this.props.refresh} bsSize='sm'>Refresh</Button>
        </div>
        {this.props.onlineProjects}
      </div>
    );
  }
}

module.exports = Projects;

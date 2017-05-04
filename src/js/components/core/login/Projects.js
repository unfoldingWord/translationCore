import React from 'react';
import {Button} from 'react-bootstrap';

class Projects extends React.Component {
  render() {
    return (
      <div style={{height: '400px', borderBottom: "1px solid var(--border-color)"}}>
        <div style={{height: "50px", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid var(--border-color)"}}>
          <span style={{fontSize: '20px', margin: "0 40px"}}>Your Door43 Projects</span>
           <Button bsStyle="second"
                    onClick={() => this.props.actions.updateRepos()}>
                Refresh
            </Button>
        </div>
        <div style={{height: "350px", overflowY: "auto"}}>
            {this.props.onlineProjects}
        </div>
      </div>
    );
  }
}

module.exports = Projects;

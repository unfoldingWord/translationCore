import React from 'react';
import PropTypes from 'prop-types';

class Projects extends React.Component {
  render() {
    return (
    <div style={{height: '400px', borderBottom: "1px solid var(--border-color)"}}>
        <div style={{height: "50px", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid var(--border-color)"}}>
            <span style={{fontSize: '20px', margin: "0 30px"}}>Your Door43 Projects</span>
            <button className="btn-second"
                    onClick={() => this.props.actions.updateRepos()}>
                Refresh
            </button>
        </div>
        <div style={{height: "350px", overflowY: "auto"}}>
            {this.props.onlineProjects}
        </div>
    </div>
    );
  }
}

Projects.propTypes = {
    onlineProjects: PropTypes.any,
    actions: PropTypes.arrayOf(PropTypes.func)
};

module.exports = Projects;

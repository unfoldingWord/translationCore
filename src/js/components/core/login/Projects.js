import React from 'react';
import {Button} from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {CircularProgress} from 'material-ui';

class Projects extends React.Component {
  render() {
    let {showLoadingCircle} = this.props;
    return (
        <MuiThemeProvider>
            <div style={{height: '400px', borderBottom: "1px solid var(--border-color)"}}>
                <div style={{height: "50px", display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid var(--border-color)"}}>
                    <span style={{fontSize: '20px', margin: "0 10px"}}>Your Door43 Projects</span>
                    <div style={{width: "60px", display: "flex", justifyContent: "center"}}>
                        {showLoadingCircle ?
                            (<CircularProgress size={30} thickness={4} color={"var(--accent-color-dark)"} />) : ""
                        }
                    </div>
                    <Button bsStyle="second"
                            onClick={() => this.props.actions.updateRepos()}>
                        Refresh
                    </Button>
                </div>
                <div style={{height: "350px", overflowY: "auto"}}>
                    {this.props.onlineProjects}
                </div>
            </div>
        </MuiThemeProvider>
    );
  }
}

module.exports = Projects;

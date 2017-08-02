import { connect } from 'react-redux'
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
//actions
import ProjectValidationActions from '../actions/ProjectValidationActions';

class ProjectValidationContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }


    handleOpen() {
        this.onClick()
    };

    handleClose() {
        this.onClick()
    };

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onTouchTap={this.handleClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.handleClose}
            />,
        ];


        const customContentStyle = {
            opacity: "1"
        };

        const { showProjectValidationStepper } = this.props.projectValidationReducer;
        return (
            <div>
                {showProjectValidationStepper ?
                    <MuiThemeProvider>
                        <Dialog
                            title="Project Validation Stepper"
                            actions={actions}
                            modal={true}
                            style={{ padding: "0px", zIndex: 2501 }}
                            contentStyle={customContentStyle}
                            open={showProjectValidationStepper}
                        >
                        </Dialog>
                    </MuiThemeProvider> :
                    null
                }
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        projectValidationReducer: state.projectValidationReducer
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        actions: {
            showStepper: (val) => {
                dispatch(ProjectValidationActions.showStepper(val));
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectValidationContainer)
import { connect } from 'react-redux'
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
//actions
import * as ProjectValidationActions from '../actions/ProjectValidationActions';
//components
import Stepper from '../components/projectValidation/Stepper';

class ProjectValidationContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }


    handleOpen() {
        this.props.actions.showStepper(false);
    };

    handleClose() {
        this.props.actions.showStepper(false);
    };

    render() {
        const actions = [
            <RaisedButton
                buttonStyle={{ backgroundColor: 'var(--accent-color-dark)' }}
                style={{ margin: '0px 30px' }}
                label="Previous"
                primary={true}
                onTouchTap={this.handleClose}
            />,
            <RaisedButton
                buttonStyle={{ backgroundColor: 'var(--accent-color-dark)' }}
                style={{ margin: '0px 30px' }}
                label="Next"
                primary={true}
                onTouchTap={this.handleClose}
            />,
        ];


        const customContentStyle = {
            opacity: "1",
            width: '90%',
            maxWidth: 'none',
            height: '100%',
            maxHeight: 'none',
            padding: 0,
            top: -30
        };

        const { showProjectValidationStepper } = this.props.projectValidationReducer;
        return (
            <MuiThemeProvider>
                <Dialog
                    actions={actions}
                    modal={true}
                    style={{ padding: "0px", zIndex: 2501 }}
                    contentStyle={customContentStyle}
                    bodyStyle={{ padding: 0, minHeight: '80vh' }}
                    open={showProjectValidationStepper}>
                    <div>
                        <Stepper />
                    </div>
                </Dialog>
            </MuiThemeProvider>
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
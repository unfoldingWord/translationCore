import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Glyphicon} from 'react-bootstrap';
import { Card } from 'material-ui/Card';
import {
  Step,
  Stepper,
  StepLabel
} from 'material-ui/Stepper';
//helpers
import * as bodyUIHelpers from '../../../helpers/bodyUIHelpers';
import Menu from '../../Menu';
import MenuItem from '../../Menu/MenuItem';

class StepperComponent extends Component {
  constructor(props) {
    super(props);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.handleChangeLocale = this.handleChangeLocale.bind(this);
    this.handleUpdateApp = this.handleUpdateApp.bind(this);
    this.state = {
      menuAnchor: null
    };
  }

  componentDidMount() {
    const { stepIndex } = this.props.homeScreenReducer.stepper;
    if (stepIndex === 0) this.props.actions.goToStep(0);
  }

  /**
   * Opens the app actions menu
   * @param event
   */
  openMenu(event) {
    this.setState({
      menuAnchor: event.currentTarget
    });
  }

  /**
   * Closes the app actions menu
   */
  closeMenu() {
    this.setState({
      menuAnchor: null
    });
  }

  /**
   * Handles menu clicks to change app locale settings
   */
  handleChangeLocale() {
    this.closeMenu();
    // TODO: change the locale
  }

  /**
   * Handles menu clicks to check for app updates
   */
  handleUpdateApp() {
    this.closeMenu();
    // TODO: check for app updates
  }

  render() {
    const { stepIndex, stepIndexAvailable, stepperLabels } = this.props.homeScreenReducer.stepper;
    const {menuAnchor} = this.state;
    const menuIsOpen = Boolean(menuAnchor);

    //icons
    let [ homeColor, userColor, projectColor, toolColor ] = bodyUIHelpers.getIconColorFromIndex(stepIndex, stepIndexAvailable);
    const homeIcon = <Glyphicon glyph={"home"} style={{color: homeColor, fontSize: "25px"}}/>; // step 0
    const userIcon = <Glyphicon glyph={"user"} style={{color: userColor, fontSize: "25px"}}/>; // step 1
    const projectIcon = <Glyphicon glyph={"folder-open"} style={{color: projectColor, fontSize: "25px"}}/>; // step 2
    const toolIcon = <Glyphicon glyph={"wrench"} style={{color: toolColor, fontSize: "25px"}}/>; // step 3

    const styles = {
      container: {
        display: 'flex',
        flexDirection: 'row',
        padding: '5px 0'
      },
      stepper: {
        flexGrow: 1,
        padding: '0 50px',
        borderRight: 'solid 1px #ccc'
      },
      menu: {
        padding: '0 50px',
        margin: 'auto 0'
      },
      step: {
        maxWidth:150,
        whiteSpace:'nowrap',
        textOverflow:'ellipsis',
        overflow:'hidden'
      }
    };

    return (
      <MuiThemeProvider>
        <Card>
          <div style={styles.container}>
            <Stepper activeStep={stepIndex} style={styles.stepper}>
              <Step disabled={!stepIndexAvailable[0]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(0)} icon={homeIcon}>
                  <span style={{...styles.step, color: homeColor}}>{` ${stepperLabels[0]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[1]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(1)} icon={userIcon}>
                  <span style={{...styles.step, color: userColor}}>{` ${stepperLabels[1]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[2]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(2)} icon={projectIcon}>
                  <span style={{...styles.step, color: projectColor}}>{` ${stepperLabels[2]} `}</span>
                </StepLabel>
              </Step>
              <Step disabled={!stepIndexAvailable[3]} style={{cursor:'pointer'}}>
                <StepLabel onClick={()=>this.props.actions.goToStep(3)} icon={toolIcon}>
                  <span style={{...styles.step, color: toolColor}}>{` ${stepperLabels[3]} `}</span>
                </StepLabel>
              </Step>
            </Stepper>
            <div style={styles.menu}>
              <button className="btn-prime" onClick={this.openMenu}>
                Actions
              </button>
              <Menu onClose={this.closeMenu}
                    anchorEl={menuAnchor}
                    open={menuIsOpen}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                    style={{cursor: 'pointer'}}>
                <MenuItem icon='export' onClick={this.handleUpdateApp}>
                  App Updates
                </MenuItem>
                <MenuItem icon='export' onClick={this.handleChangeLocale}>
                  Change Locale
                </MenuItem>
              </Menu>
            </div>
          </div>
        </Card>
      </MuiThemeProvider>
    );
  }
}

StepperComponent.propTypes = {
    homeScreenReducer: PropTypes.any.isRequired,
    actions: PropTypes.shape({
        goToStep: PropTypes.func.isRequired
    })
};

export default StepperComponent;

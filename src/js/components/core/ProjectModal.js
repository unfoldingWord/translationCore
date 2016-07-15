const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const Checkbox = require('react-bootstrap/lib/Checkbox.js');
const CoreStore = require('../../stores/CoreStore.js');
const project = require('./CreateNewProject');
const manifest = require(window.__base + 'test_files/Import From TS/manifest');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./CheckDataGrabber');

const ProjectModal = React.createClass({
  getInitialState: function() {
    return {
      projectname:"",
      showModal: false,
      headerTitle:"",
      modalTitle:"Create Project",
      controlLabelTitle:"",
      placeHolderText:"",
      doneText:"Create",
      currentText:"Create",
      FetchDataArray:[]      //FetchDataArray of checkmodules
    };
  },
  componentWillMount: function() {
    CoreStore.addChangeListener(this.showCreateProject);      //action to show create project modal
    CoreStore.addChangeListener(this.changeCreateProjectText);
    CheckDataGrabber.addListner();      //action to change text in project modal
  },

  showCreateProject: function() {
    this.setState({showModal: CoreStore.getShowProjectModal()});
  },
  close: function() {
    this.setState({
      showModal: false,
      currentText:""
    });
  },

  onClick: function () {
    var tempFetchDataArray= [];      //tempFetchDataArray to push checkmodule paths onto
    if (this.state.currentText == "Check") {
      for (var el of this.state.FetchDataArray) {
        var newFetchDataArray = this.makePathForChecks(el);
        tempFetchDataArray[el] = newFetchDataArray;
      }
      if (Object.keys(tempFetchDataArray).length > 0) {
      CoreActions.getFetchData(tempFetchDataArray)
    }
      this.close();
    }
    else {
      this.setState({
        modalTitle:"Select Check"
      });
      CoreActions.changeCreateProjectText("Check");
    }

  },

  changeCreateProjectText: function() {
    this.setState({
      currentText: CoreStore.getCreateProjectText()
    });
  },

  isModule: function(filepath, file){
    try {
      var stats = fs.lstatSync(filepath);
      if (stats.isDirectory()) {
        if (file.indexOf("module") > -1) {
          return true;
        }
      }
      else {
        return false;
      }
    }
    catch (e) {
      console.log(e);
      return false;
    }
  },
  getCurrentText: function() {
    if (this.state.currentText == "Check")
    {
      var currentChecks = [];
      try {
        var file = fs.readdirSync(window.__base + 'src/js/components/modules');
        for (var el of file) {
          if (this.isModule((window.__base + 'src/js/components/modules/' + el), el)) {
            currentChecks.push(el);
          }
        }
      } catch (e) {
        console.log(e);
      }
      return <SelectCheckType ref="CheckMenu" checks={currentChecks} FetchDataArray={this.state.FetchDataArray}/>
    }
    else {
      return <CreateProjectForm controlLabelTitle={"Name"} placeHolderText={"Enter name of project"}projectname={this.state.projectname}/>
    }
  },

  makePathForChecks: function(check) {
    var path = window.__base + 'src/js/components/modules/' + check;
    return path;
  },

  render: function() {
    return (
      <div>
      <Modal show={this.state.showModal} onHide={this.close}>
      <Modal.Header>
      <Modal.Title>{this.state.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {this.getCurrentText()}
      </Modal.Body>
      <Modal.Footer>
      <Button type="button" onClick={this.onClick}>{this.state.doneText}</Button>
      </Modal.Footer>
      </Modal>
      </div>
    )}
  });

  const CreateProjectForm = React.createClass({
    getInitialState: function() {
      return {
        projectname:this.props.projectname
      }
    },
    handleKeyPress: function(e) {
      if (e.charCode == 13) {
        project.createProject(manifest, this.state.projectname);
      }
    },
    handleChange: function(e) {
      this.setState({
        projectname:e.target.value
      });
    },
    render: function() {
      return (
        <div>
        <FormGroup>
        <ControlLabel>{this.props.controlLabelTitle}</ControlLabel>
        <FormControl type="text" placeholder={this.props.placeHolderText} onKeyPress={this.handleKeyPress}  onChange={this.handleChange}/>
        </FormGroup>
        </div>
      )}
    });

    const SelectCheckType = React.createClass({
      getInitialState: function(){
        return {
          FetchDataArray:this.props.FetchDataArray,
          projectname:this.props.projectname
        };
      },
      onClick_: function(e) {
        try {
          if (e.target.control.checked === false) {
            if (this.state.FetchDataArray.indexOf(e.target.control.id) == -1)
            {
              this.state.FetchDataArray.push(e.target.control.id);
            }

          }
          else {
            var el = this.state.FetchDataArray.indexOf(e.target.control.id);
            this.state.FetchDataArray.splice(el, 1);

          }
        } catch (e) {
        }
      },
      render: function() {
        var checkButtonComponents = this.props.checks.map(function(checks) {
          return (
            <div>
            <Checkbox id={checks} ref={checks}>
            {checks}
            </Checkbox>
            </div>
          )
        });
        return (
          <FormGroup onClick={this.onClick_}>
          {checkButtonComponents}
          </FormGroup>
        )
      }
    });

    module.exports = ProjectModal;

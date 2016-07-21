const fs = require(window.__base + 'node_modules/fs-extra');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Checkbox = require('react-bootstrap/lib/Checkbox.js');
const CoreStore = require('../../stores/CoreStore.js');
const project = require('./CreateNewProject');
const manifest = require(window.__base + 'test_files/Import From TS/manifest');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./CheckDataGrabber');
const FileModule = require('./FileModule');
const {dialog} = window.electron.remote;
const ENTER = 13;
const TargetLanguage = require('./UploadModal');

const ProjectModal = React.createClass({
  getInitialState: function() {
    return {
      projectname:"",
      showModal: false,
      modalTitle:"Create Project",
      controlLabelTitle:"Name",
      placeHolderText:"Enter name of project",
      doneText:"Create",
      modalValue:"Languages",
      FetchDataArray:[]      //FetchDataArray of checkmodules
    };
  },
  componentWillMount: function() {
    CoreStore.addChangeListener(this.showCreateProject);      //action to show create project modal
    CheckDataGrabber.addListner();      //action to change text in project modal
  },
  showCreateProject: function() {
    var modal = CoreStore.getShowProjectModal()
    if (modal === "Create") {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle:"Create Project",
        doneText:"Choose Modules"
      });
    } else if(modal === "Check") {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle:"Select Modules To Load",
        doneText:"Finished"
      });
    } else if (modal === 'Languages') {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle: '',
        doneText: 'Create'
      });
    }
  },
  close: function() {
    CoreActions.showCreateProject("");
    this.setState({
      showModal: false
    });
  },
  setProjectName: function (e) {
    this.setState({
      projectname: e.target.value
    });
    if (e.charCode == ENTER) {
      project.createProject(manifest, this.state.projectname);
    }
  },
  selectedModule: function(element) {
    var elementIndex = this.state.FetchDataArray.indexOf(element);
    if ( elementIndex == -1){
      this.state.FetchDataArray.push(element);
    } else {
      this.state.FetchDataArray.splice(elementIndex, 1);
    }
  },
  onClick: function () {
    var tempFetchDataArray = [];      //tempFetchDataArray to push checkmodule paths onto
    if (this.state.modalValue == "Check") {
      for (var element in this.state.FetchDataArray) {
        var pathOfCheck = this.makePathForChecks(this.state.FetchDataArray[element]);
        tempFetchDataArray.push([this.state.FetchDataArray[element], pathOfCheck]);
      }
      if (tempFetchDataArray.length > 0) {
        CoreActions.getFetchData(tempFetchDataArray);
      }
      this.close();
    }
    else if (this.state.modalValue == "Create") {
      CoreActions.showCreateProject("Check");
    } else if (this.state.modalValue === 'Languages') {
      CoreActions.showCreateProject("Create");
    }
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
  getModule: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        this.addMoreModules(filename);
      }
    });
  },
  addMoreModules: function(filename) {
    try {
      FileModule.readFile(file, readFile);
      console.log(readFile);
    } catch (error) {
      dialog.showErrorBox('Import Error', 'Check Selected Module.');
      console.log(error);
    }
    var filename = this.getModule();
    var newModule = filename[0].split('/').pop();
    this.changeModalBody("Check", newModule);
  },
  changeModalBody: function(modalBody, currentChecks = []) {
    if (modalBody == "Check") {
      try {
        var file = fs.readdirSync(window.__base + 'src/js/components/modules');
        for (var element of file) {
          if (this.isModule((window.__base + 'src/js/components/modules/' + element), element)) {
            currentChecks.push(element);
          }
        }
      } catch (e) {
        console.log(e);
      }
      return (<SelectCheckType ref={this.state.modalValue} checks={currentChecks} modalTitle={this.state.modalTitle}
        controlLabelTitle={this.state.controlLabelTitle} placeHolderText={this.state.placeHolderText} FetchDataArray={this.state.FetchDataArray}
        onClick={this.selectedModule} addMoreModules={this.getModule}/>)
      } else if (modalBody == "Create") {
        return (<CreateProjectForm modalTitle={this.state.modalTitle} ref={this.state.modalValue} controlLabelTitle={this.state.controlLabelTitle}
          placeHolderText={this.state.placeHolderText} setProjectName={this.setProjectName}/>)
      } else if (modalBody === 'Languages') {
        return (<TargetLanguage />);
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
          {this.changeModalBody(this.state.modalValue)}
          <Modal.Footer>
          <Button type="button" onClick={this.onClick}>{this.state.doneText}</Button>
          </Modal.Footer>
          </Modal>
          </div>
        )}
      });

      const CreateProjectForm = React.createClass({
        render: function() {
          return (
            <div>
            <Modal.Header>
            <Modal.Title>{this.props.modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <FormGroup>
            <ControlLabel>{this.props.controlLabelTitle}</ControlLabel>
            <FormControl type="text" placeholder={this.props.placeHolderText} onKeyPress={this.setProjectName}  setProjectName={this.props.setProjectName}/>
            </FormGroup>
            </Modal.Body>
            </div>
          )}
        });

        const SelectCheckType = React.createClass({
          addMoreModules: function() {
            this.props.addMoreModules();
          },
          handleClick_: function(e) {
            try {
              this.props.onClick(e.target.control.id);
            } catch (e) {
            }
            //checks which modules user selects, removes if selects twice
          },
          render: function() {
            var checkButtonComponents = this.props.checks.map(function(checks) {
              return (
                <div>
                <Checkbox id={checks} key={checks}>
                {checks}
                </Checkbox>
                </div>
              )
            });
            return (
              <div>
              <Modal.Header>
              <Modal.Title>
              {this.props.modalTitle}
              </Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <FormGroup onClick={this.handleClick_}>
              {checkButtonComponents}
              <ButtonToolbar>
              <Button bsSize="xsmall" onClick={this.addMoreModules}>Add More...</Button>
              </ButtonToolbar>
              </FormGroup>
              </Modal.Body>
              </div>
            )
          }
        });

        module.exports = ProjectModal;

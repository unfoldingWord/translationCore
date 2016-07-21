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
const CheckStore = require('../.././stores/CheckStore');
const project = require('./CreateNewProject');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./CheckDataGrabber');
const FileModule = require('./FileModule');
const {dialog} = window.electron.remote;
const Loader = require('./Loader');
const ENTER = 13;

const ProjectModal = React.createClass({
  getInitialState: function() {
    return {
      projectname:"",
      showModal: false,
      modalTitle:"Create Project",
      controlLabelTitle:"Name",
      placeHolderText:"Enter name of project",
      doneText:"Create",
      modalValue:"Create",
      loadedChecks:[],
      FetchDataArray:[]    //FetchDataArray of checkmodules
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
        doneText:"Next"
      });
    } else if(modal === "Check") {
      this.setState({
        showModal: true,
        modalValue: modal,
        modalTitle:"Select Modules To Load In Project"
      });
    }
    else if (modal == "Languages") {
      this.setState({
        modalValue: modal,
        modalTitle:"Select Book"
      })
    }
  },
  close: function() {
    //CheckStore.getNameSpaces();
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
    }
  },
  beautifyString: function(check) {
    const stringRegex = new RegExp("[^a-zA-Z0-9\s]", "g");
    let regRes;
    try {
      check = check.replace(stringRegex, " ");
    }
    catch (e) {
    }
    completeWord = [];
    check = check.split(" ");
    for (var word of check) {
      word = word.charAt(0).toUpperCase() + word.slice(1) + " ";
      completeWord.push(word);
    }
    return completeWord;
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
    }
    else if (this.state.modalValue == "Languages") {
      CoreActions.showCreateProject("Languages");
    }
  },
  isModule: function(filepath, file){
    try {
      var stats = fs.lstatSync(filepath);
      if (stats.isDirectory()) {
      }
      else {
        return false;
      }
      try {
        fs.accessSync(filepath + '/FetchData.js');
        return true;
      } catch (e) {
        console.log(e);
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
      if (filename != undefined) {
        this.addMoreModules(filename);
      }

    }.bind(this));
  },
  addMoreModules: function(filepath) {
    var tempArray = this.state.loadedChecks;
    var newModule = filepath[0].split('/').pop();
    var elementIndex = tempArray.indexOf(newModule);
    if (elementIndex == -1){
      if (this.isModule(filepath[0], newModule)) {
        tempArray.push(newModule);
        this.setState({
          loadedChecks:tempArray
        });
      } else {
        alert("Module Not Valid");
      }
    };
  },
  changeModalBody: function(modalBody) {
    var fileModules = [];
    var allModules = [];
    if (modalBody == "Check") {
      try {
        var file = fs.readdirSync(window.__base + '/modules');
        for (var element of file) {
          if (this.isModule((window.__base + '/modules/' + element), element)) {
            fileModules.push(element);
          }
        }
        allModules = this.state.loadedChecks.concat(fileModules);
      } catch (e) {
        console.log(e);
      }
      return (<SelectCheckType ref={this.state.modalValue} checks={allModules} modalTitle={this.state.modalTitle}
        controlLabelTitle={this.state.controlLabelTitle} placeHolderText={this.state.placeHolderText} FetchDataArray={this.state.FetchDataArray}
        onClick={this.selectedModule} addMoreModules={this.getModule} beautifyString={this.beautifyString}/>)
      }
      else if (modalBody == "Create") {
        return (<CreateProjectForm modalTitle={this.state.modalTitle} ref={this.state.modalValue} controlLabelTitle={this.state.controlLabelTitle}
          placeHolderText={this.state.placeHolderText} setProjectName={this.setProjectName}/>)
        }
        else if (modalBody == "Languages") {
          return(
            <LanguagesForm />
          )
        }
      },
      makePathForChecks: function(check) {
        var path = window.__base + 'modules/' + check;
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
            <FormControl type="text" placeholder={this.props.placeHolderText} onKeyPress={this.setProjectName} setProjectName={this.props.setProjectName}/>
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
            var i = 0;
            var checkButtonComponents = this.props.checks.map((checks) => {
              return (
                <div>
                <Checkbox id={checks} key={i++}>
                {this.props.beautifyString(checks)}
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
              <Button bsSize="xsmall" onClick={this.addMoreModules}>Add Modules</Button>
              </ButtonToolbar>
              </FormGroup>
              </Modal.Body>
              </div>
            )
          }
        });

        module.exports = ProjectModal;

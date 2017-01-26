const React = require('react');
const { connect  } = require('react-redux');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const api = window.ModuleApi;
const RecentProjects = require('../components/core/RecentProjects');
const DragDrop = require('../components/core/DragDrop');
const OnlineInput = require('../components/core/OnlineInput');
const Projects = require('../components/core/login/Projects');
const { Tabs, Tab } = require('react-bootstrap/lib');
const dragDropActions = require('../actions/DragDropActions.js');

class LoadModalContainer extends React.Component {
    render() {
      var projects = <Projects {...this.props.profileProjectsProps} updateRepos={() =>{}} makeList={() =>{}}/>
      var loadOnline = (
        <div style={{padding: '10% 0'}}>
          <center>
            <Button onClick={this.props.showD43} style={{width: '60%', fontWeight: 'bold', fontSize: '20px'}} bsStyle='primary' bsSize='large'>
              <img src="images/D43.svg" width="90" style={{marginRight: '25px', padding: '10px'}}/>
              Browse Door43 Projects
            </Button>
            <div style={{width: '60%', height: '20px', borderBottom: '2px solid white', textAlign: 'center', margin: '20px 0'}}>
              <span style={{fontSize: '20px', backgroundColor: '#333', fontWeight: 'bold', padding: '0 40px'}}>
                or
              </span>
            </div>
            <OnlineInput onChange={this.props.handleOnlineChange} load={()=> {this.props.onClick(this.props.show)}}/>
          </center>
          </div>
        );
        var onlineView = (this.props.showOnline) ? loadOnline: projects;
        return (
          <div>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
                  bsStyle="pills"
                  style={{borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%"}}>
              <Tab eventKey={1} title="My Projects" style={{backgroundColor: "#333333"}}>
                <RecentProjects.Component {...this.props} />
              </Tab>
              <Tab eventKey={2} title="Import Local Project" style={{backgroundColor: "#333333"}}>
                <DragDrop {...this.props}/>
              </Tab>
              <Tab eventKey={3} title="Import Online Project" style={{backgroundColor: "#333333"}}>
                {onlineView}
              </Tab>
            </Tabs>
          </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.dragDropReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dragDropOnClick: (open, properties) => {
            dispatch(dragDropActions.onClick(open, properties));
        },
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(LoadModalContainer);

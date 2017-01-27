const React = require('react');
const { connect  } = require('react-redux');
const importOnlineActions = require('../actions/ImportOnlineActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Projects = require('../components/core/login/Projects');
const OnlineInput = require('../components/core/OnlineInput');


class ImportOnlineContainer extends React.Component {
    componentWillMount() {
    }
    render() {
        return (
            <div>
                {this.props.showOnlineButton ?
                    (<div style={{ padding: '10% 0' }}>
                        <center>
                            <Button onClick={() => this.props.changeImportOnlineView(false)} style={{ width: '60%', fontWeight: 'bold', fontSize: '20px' }} bsStyle='primary' bsSize='large'>
                                <img src="images/D43.svg" width="90" style={{ marginRight: '25px', padding: '10px' }} />
                                Browse Door43 Projects
            </Button>
                            <div style={{ width: '60%', height: '20px', borderBottom: '2px solid white', textAlign: 'center', margin: '20px 0' }}>
                                <span style={{ fontSize: '20px', backgroundColor: '#333', fontWeight: 'bold', padding: '0 40px' }}>
                                    or
              </span>
                            </div>
                            <OnlineInput onChange={this.props.handleOnlineChange} load={() => { this.props.onClick(this.props.show) } } />
                        </center>
                    </div>)
                    :
                    <Projects updateRepos={() => { } } makeList={() => { } } />}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.importOnlineReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        changeShowOnlineView: (val) => {
            dispatch(importOnlineActions.changeShowOnlineView(val))
        },
        handleOnlineChange: (e) => {
            this.setState(merge({}, this.state, {
                projectModalProps: {
                    link: e.target.value,
                }
            }));
        },
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ImportOnlineContainer);

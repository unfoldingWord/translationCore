// const React = require('react');

// const Col = require('react-bootstrap/lib/Col.js');
// const Well = require('react-bootstrap/lib/Well.js');

const api = window.ModuleApi;
const Col = api.ReactBootstrap.Col;
const Well = api.ReactBootstrap.Well;

const React = api.React;

const style = require('./Style');

const Book = require('./Book');

class Pane extends React.Component {
    constructor() {
        super();
    }
    render() {
        return (
            <Col md={4} sm={4} xs={4} lg={4} style={this.props.last ? {} : {borderRight: '1px solid #1f273b'}}>
                <div style={style.pane.content}>
                    <Book input={this.props.content} />
                </div>
            </Col>
        );
    }
}

module.exports = Pane;

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
            <Col md={3} sm={3} xs={12} lg={3}>
                <h3 style={style.pane.header}>{this.props.title}</h3>
                <Well style={style.pane.content}>
                    <Book input={this.props.content} />
                </Well>
            </Col>
        );
    }
}

module.exports = Pane;

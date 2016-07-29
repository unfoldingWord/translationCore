const api = window.ModuleApi;

const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

class View extends React.Component {
   constructor() {
    super();
   }

  render() {
    var html = api.getDataFromCheckStore('ExampleTool', 'resourceHtml');
    return (
      <Well style={{width:'100%', height:'400px', overflowX: 'hidden', overflowY: 'scroll'}}>
        <div dangerouslySetInnerHTML={createMarkup(html)} style={{width: '100%'}} />
      </Well>
    );
  }
}

function createMarkup(html) {
  return {__html: html};
};

module.exports = {
    name: "ExampleTool",
    view: View
}

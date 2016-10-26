const api = window.ModuleApi;
const React = api.React;
const SideNavBar = require('./SideNavBar');
const Chevron = require('./Chevron');
const style = require("./Style");


class SideBarContainer extends React.Component{
  constructor(){
    super();
    this.state ={
      SideNavBar: false,
      direction: false,
    }
    //this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
  }

  componentWillMount() {
  //CoreStore.addChangeListener(this.updateOnlineStatus);
  }

  componentWillUnmount() {
  //  CoreStore.removeChangeListener(this.updateOnlineStatus);
  }

  changeView(){
    this.setState({SideNavBar: !this.state.SideNavBar});
    this.setState({direction: !this.state.direction});

  }

  render(){
    let sideBarContent = <Chevron direction={this.state.direction}/>;
    if(this.state.SideNavBar){
      sideBarContent = <div><Chevron direction={this.state.direction}/><br /><SideNavBar /></div>;
    }
    return(
      <div style={style.sideBarcontainer}>
        <img src="images/TC_Icon_logo.png" onClick={this.changeView.bind(this)} style={style.logo}/>
        {sideBarContent}
      </div>
    );
  }

}

module.exports = SideBarContainer;

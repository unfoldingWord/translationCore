const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Style = require('style-it/dist/style-it-standalone.js');

class Chevron extends React.Component{
  render() {
    let chevronShape = "";
    let magenta = `
      .chevron {
        top: 0px;
        position: relative;
        text-align: center;
        width: 120px;
        color: #FFF;
        z-index: 100;
        display: block;
        box-sizing: border-box;
        cursor: pointer;
      }
      .chevron:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 80px;
        width: 50%;
        transform: skew(0deg, 18deg);
        background-color: #c3105a;
        border-top: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }
      .chevron:after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 80px;
        width: 50%;
        transform: skew(0deg, -18deg);
        background-color: #c3105a;
        border-top: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }

      .chevron .chevron-inner{
        position: relative;
        z-index: 2;
        padding: 20px 10px 5px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
        font-size: 12px;
      }
    `;
    let blue = `
      .chevron {
        top: 0px;
        position: relative;
        text-align: center;
        width: 120px;
        color: #FFF;
        z-index: 100;
        margin-bottom: 30px;
        display: block;
        box-sizing: border-box;
        cursor: pointer;
      }
      .chevron:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 60px;
        width: 50%;
        transform: skew(0deg, 18deg);
        background-color: #0277BD;
        border-top: 2px solid white;
        border-bottom: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }
      .chevron:after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 60px;
        width: 50%;
        transform: skew(0deg, -18deg);
        background-color: #0277BD;
        border-top: 2px solid white;
        border-bottom: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }

      .chevron .chevron-inner{
        position: relative;
        z-index: 2;
        padding: 20px 10px 5px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
        font-size: 12px;
      }
    `;
    let content;
    if (this.props.color === "magenta") {
      chevronShape = magenta;
    }else if (this.props.color === "blue") {
      chevronShape = blue;
    }else {
      console.error("The Chevron Module requires a color prop");
    }
    let glyphiconType = this.props.glyphicon ? this.props.glyphicon : "";
    let text = this.props.textValue ? <span>{this.props.textValue}</span> : <span>{""}</span>;
    if(this.props.imagePath){
      content = <img src={this.props.imagePath} style={{width: "45px"}} />
    }else{
      content = <div><Glyphicon glyph={glyphiconType}
                                style={{color: "#FFF", fontSize: "25px"}}/>
                                {text}
                </div>
    }
    return (
      <Style>
        {chevronShape}
        <div className="chevron" onClick={this.props.handleClick}>
          <div className="chevron-inner">
            <div className="chevron-content">
              {content}
            </div>
          </div>
        </div>

      </Style>
    );
  }
}

module.exports = Chevron;

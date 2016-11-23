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
        margin-bottom: 50px;
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
        background-color: #4BC7ED;
        border-top: 2px solid white;
        border-bottom: 2px solid white;
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
        background-color: #4BC7ED;
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
    if (this.props.color === "magenta") {
      chevronShape = magenta;
    }else if (this.props.color === "blue") {
      chevronShape = blue;
    }else {
      console.error("The Chevron Module requires a color prop");
    }
    let text = <span>{""}</span>;
    let glyphiconType = "";
    if(this.props.textValue){
      text = <span>{this.props.textValue}</span>;
    }
    if(this.props.glyphicon){
      glyphiconType = this.props.glyphicon;
    }
    return (
      <Style>
        {chevronShape}
        <div className="chevron" onClick={this.props.handleClick}>
          <div className="chevron-inner">
            <div className="chevron-content">
              <Glyphicon glyph={glyphiconType}
                         style={{color: "#FFF", fontSize: "25px"}}/><br />
              {text}
            </div>
          </div>
        </div>

      </Style>
    );
  }
}

module.exports = Chevron;

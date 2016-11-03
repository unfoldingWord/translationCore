const api = window.ModuleApi;
const React = api.React;
const Style = require('style-it/dist/style-it-standalone.js');

class Chevron extends React.Component{
  render() {
    let chevronShape = "";
    let up = `
      .chevron {
        top: 10px;
        position: relative;
        text-align: center;
        width: 120px;
        color: #fff;
        z-index: 100;
      }
      .chevron:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 50px;
        width: 50%;
        transform: skew(0deg, -18deg);
        background-color: #fff;
        border-bottom: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }
      .chevron:after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 50px;
        width: 50%;
        transform: skew(0deg, 18deg);
        background-color: #fff;
        border-bottom: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }

      .chevron .chevron-inner{
        position: relative;
        z-index: 2;
        padding: 30px 20px 20px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
        font-size: 18px;
      }
    `;

    let down = `
      .chevron {
        top: 0px;
        position: relative;
        text-align: center;
        width: 120px;
        color: #fff;
        z-index: 100;
      }
      .chevron:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 50px;
        width: 50%;
        transform: skew(0deg, 18deg);
        background-color: #fff;
        border-top: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }
      .chevron:after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        height: 50px;
        width: 50%;
        transform: skew(0deg, -18deg);
        background-color: #fff;
        border-top: 2px solid white;
        box-shadow: 0 18px 18px -18px rgba(0, 0, 0, 0.8) inset, 0 -18px 18px -18px rgba(0, 0, 0, 0.8) inset;
      }

      .chevron .chevron-inner{
        position: relative;
        z-index: 2;
        padding: 30px 20px 20px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
        font-size: 18px;
      }
    `;
    if(this.props.direction){
      chevronShape = up;
    }else{
      chevronShape = down;
    }
    return (
      <Style>
        {chevronShape}
        <div className="chevron">
          <div className="chevron-inner">
            <div className="chevron-content">
            </div>
          </div>
        </div>

      </Style>
    );
  }
}

module.exports = Chevron;

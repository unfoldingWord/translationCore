const React = require('react');

class SvgLogo extends React.Component {

  render() {
    let { color, height } = this.props;
     return(
       <svg viewBox="0 0 826.51 920.77" height={height ? height : '100%'}><defs></defs>
         <title>tC_White_icon</title>
         <g id="Layer_2" data-name="Layer 2">
           <g id="Translation_Core" data-name="Translation Core">
             <path fill={color} d="M414.53,235.51c-126.3,0-228.68,102.38-228.68,228.68S288.23,692.86,414.53,692.86,643.21,590.48,643.21,464.18,540.83,235.51,414.53,235.51Zm0,305.07a76.39,76.39,0,1,1,76.39-76.39A76.39,76.39,0,0,1,414.53,540.57Z"/>
             <path fill={color} d="M412.4,151A309.68,309.68,0,0,1,660.35,274.76l126.88-73.71L462.33,13.38a99.82,99.82,0,0,0-99.85,0L36.86,201.47l127.5,73.42A309.69,309.69,0,0,1,412.4,151Z"/>
             <path fill={color} d="M107.81,465.17c0-42.36,7.35-82.73,22.37-119.52L0,270.55V647a99.8,99.8,0,0,0,50,86.51L375.48,920.77l-.08-148.21C223.93,752.15,107.81,622.31,107.81,465.17Z"/>
             <path fill={color} d="M701,342.77c16.36,37.31,26.17,78.37,26.17,121.49,0,159-119,290.07-273,308.07l1.4,146.49L776.88,732a99.8,99.8,0,0,0,49.63-86.28V270.86Z"/>
           </g>
         </g>
       </svg>
     )
   }
 }

module.exports = SvgLogo;

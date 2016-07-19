// const React = require('react');
// const Well = require('react-bootstrap/lib/Well.js');

// const CheckStore = require('../../stores/CheckStore');
// const MenuItem = require('./MenuItem');

// class NavigationMenu extends React.Component {
//   constructor() {
//     super();
//     this.retrieveChecks = this.retrieveChecks.bind(this);
//     this.state = {
//       groups: CheckStore.getAllChecks()
//     };
//   }

//   render() {
//     var menuList = this.state.groups.map(function(group, groupIndex) {
//       var groupHeader = (
//         <div>{group.group}</div>
//       );
//       var checkMenuItems = group.checks.map(function(check, checkIndex) {
//         return (
//           <div key={checkIndex}>
//             <MenuItem
//               check={check}
//               groupIndex={groupIndex}
//               checkIndex={checkIndex}
//               isCurrentCheck={checkIndex == CheckStore.getCheckIndex()}
//             />
//           </div>
//         );
//       });
//       return (
//         <div key={groupIndex}>
//           {groupHeader}
//           {checkMenuItems}
//         </div>
//       );
//     });
//     return (
//       <div>
//         <Well>
//           {menuList}
//         </Well>
//       </div>
//     )
//   }
// }

// module.exports = NavigationMenu;

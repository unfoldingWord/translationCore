
const React = require('react');
const FS = require(window.__base + '/node_modules/fs-extra');

const ULBFetcher = require('./UnlockedLiteralBibleFetcher.js');

var TestComponent = React.createClass({
	ULBFetcher: new ULBFetcher(),

	componentWillMount: function() {
		this.ULBFetcher.getULBFile(
			// function(ulbFile) { //assign callback
			// 	// FS.outputFile('../ULB-en.zip', ulbFile, 
			// 	// 	function(err) {
			// 	// 		if (err) {
			// 	// 			console.error('Error writing file');
			// 	// 		}
			// 	// 		console.log('Done');
			// 	// 	});

			// 	var wstream = FS.writeFile('../ulbFile.zip', ulbFile,
			// 		function(error) {
			// 			if (error) {
			// 				console.error('FS failed');
			// 				console.error(error);
			// 			}
			// 			console.log('Done');
			// 		});
			// }, 
			// function() { //error callback
			// 	console.error('Failed');
			// }
		);	
	},

	render: function() {
		return (<div></div>);
	}
});

module.exports = TestComponent;
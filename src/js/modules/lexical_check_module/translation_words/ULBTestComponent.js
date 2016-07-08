
const React = require('react');
const FS = require(window.__base + '/node_modules/fs-extra');

const ULBFetcher = require('./UnlockedLiteralBibleFetcher');

var TestComponent = React.createClass({
	ULBFetcher: new ULBFetcher(),

	componentWillMount: function() {
		var _this = this;
		this.ULBFetcher.getULBFile(
			function(ulbFile) { //assign callback
				var file = _this.ULBFetcher.getBookUSFM('exo');
				console.log(file);
			}, 
			function() { //error callback
				console.error('Failed');
			}
		);	
	},

	render: function() {

		return (<div></div>);
	}
});

module.exports = TestComponent;
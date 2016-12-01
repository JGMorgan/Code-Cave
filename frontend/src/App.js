var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');

var App = React.createClass({
    getInitialState: function() {
        return {
            code: "// Code",
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
        });
    },
    render: function() {
        var options = {
            lineNumbers: true,
        };
        return <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
    }
});

ReactDOM.render(<App />, document.getElementById('root'));

var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/go/go');
require('codemirror/theme/solarized.css')
require('./index.css')

var App = React.createClass({
    getInitialState: function() {
        return {
            code: "// Code",
            stdout: "",
            stderr: ""
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
            stdout: this.state.stdout,
            stderr: this.state.stderr
        });
    },
    updateStdOut: function(newOut) {
        this.setState({
            code: this.state.code,
            stdout: newOut,
            stderr: this.state.stderr
        });
    },
    updateStdErr: function(newErr) {
        this.setState({
            code: this.state.code,
            stdout: this.state.stdout,
            stderr: newErr
        });
    },
    runCode: function() {
        var self = this;
        fetch('http://localhost:8000/run/GoLang', {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Language: "Go",
                Content: this.state.code
            })
        }).then((response) => {
            return response.json();
        }).then(function(data) {
            console.log(data);
            self.updateStdOut(data.Output)
            self.updateStdErr(data.Error)
        });
    },
    render: function() {
        var options = {
            lineNumbers: true,
            theme: 'solarized dark',
            mode: 'go'
        };
        return (
            <div className="flex-container">
                <div className="flex-item">
                    <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
                </div>
                <div className="tiny-flex"></div>
                <div className="flex-item" style={{backgroundColor: "#002b36"}}>
                    <button onClick={this.runCode}> Run </button>
                    <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stdout}</pre>
                    <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stderr}</pre>
                </div>
            </div>
        );
    }
});

ReactDOM.render(<App />, document.getElementById('app'));

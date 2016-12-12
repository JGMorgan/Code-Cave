var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');
var Draggable = require('react-draggable');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/go/go');
require('codemirror/theme/solarized.css')
require('./index.css')

var App = React.createClass({
    getInitialState: function() {
        return {
            code: "// Code",
            stdout: "",
            stderr: "",
            leftFlex: .5,
            rightFlex: .5
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
            stdout: this.state.stdout,
            stderr: this.state.stderr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex
        });
    },
    updateStdOut: function(newOut) {
        this.setState({
            code: this.state.code,
            stdout: newOut,
            stderr: this.state.stderr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex
        });
    },
    updateStdErr: function(newErr) {
        this.setState({
            code: this.state.code,
            stdout: this.state.stdout,
            stderr: newErr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex
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
    clear: function() {
        this.setState({
            code: this.state.code,
            stdout: "",
            stderr: "",
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex
        });
    },
    handleDrag: function(e, position) {
        this.setState({
            code: this.state.code,
            stdout: "",
            stderr: "",
            leftFlex: (position.x + window.innerWidth/2) / window.innerWidth,
            rightFlex: 1 - (position.x + window.innerWidth/2) / window.innerWidth
        });
        console.log(position.x);
        console.log(window.innerWidth);
        console.log((position.x + window.innerWidth/2) / window.innerWidth);
    },
    render: function() {
        var options = {
            lineNumbers: true,
            theme: 'solarized dark',
            mode: 'go'
        };
        return (
            <div ref="parentDiv">
                <div>
                    <button onClick={this.runCode} className="run-button"> Run &#9658; </button>
                    <button onClick={this.clear} className="run-button"> Clear </button>
                    <select className="lang-select">
                        <option value="Go">Go</option>
                    </select>
                </div>
                <div className="flex-container">
                    <div className="flex-item" style={{flex: this.state.leftFlex.toString()}}>
                        <CodeMirror value={this.state.code} onChange={this.updateCode} options={options} />
                    </div>
                    <Draggable
                     axis="x"
                     handle=".handle"
                     bounds="body"
                     defaultPosition={{x: 0, y: 0}}
                     position={null}
                     onStart={this.handleStart}
                     onDrag={this.handleDrag}
                     onStop={this.handleStop}>
                        <div className="handle">
                            <div className="tiny-flex" style={{cursor: 'col-resize'}}></div>
                        </div>
                    </Draggable>
                    <div className="flex-item" style={{backgroundColor: "#002b36", flex: this.state.rightFlex.toString()}}>
                        <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stdout}</pre>
                        <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stderr}</pre>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(<App />, document.getElementById('app'));

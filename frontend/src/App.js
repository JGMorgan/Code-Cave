var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');
var Draggable = require('react-draggable');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/go/go');
require('codemirror/mode/python/python');
require('codemirror/theme/solarized.css')
require('./index.css')

var App = React.createClass({
    getInitialState: function() {
        return {
            code: "// Code",
            stdout: "",
            stderr: "",
            leftFlex: .5,
            rightFlex: .5,
            language: "go"
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
            stdout: this.state.stdout,
            stderr: this.state.stderr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex,
            language: this.state.language
        });
    },
    updateStdOut: function(newOut) {
        this.setState({
            code: this.state.code,
            stdout: newOut,
            stderr: this.state.stderr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex,
            language: this.state.language
        });
    },
    updateStdErr: function(newErr) {
        this.setState({
            code: this.state.code,
            stdout: this.state.stdout,
            stderr: newErr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex,
            language: this.state.language
        });
    },
    runCode: function() {
        var self = this;
        var runButton = document.getElementById("run");
        runButton.firstChild.data = "Stop ◼";
        runButton.className += "running";

        fetch(`http://localhost:8000/run/${this.state.language}`, {
            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Language: this.state.language,
                Content: this.state.code
            })
        }).then((response) => {
            runButton.firstChild.data = "Run ►";
            runButton.className = runButton.className.replace(/\brunning\b/,'');
            return response.json();
        }).then(function(data) {
            console.log(data);
            self.updateStdOut(data.Output)
            self.updateStdErr(data.Error)
            runButton.firstChild.data = "Run ►";
            runButton.className = runButton.className.replace(/\brunning\b/,'');
        }).catch(function(){
            runButton.firstChild.data = "Run ►";
            runButton.className = runButton.className.replace(/\brunning\b/,'');
        });


    },
    clear: function() {
        this.setState({
            code: this.state.code,
            stdout: "",
            stderr: "",
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex,
            language: this.state.language
        });
    },
    handleDrag: function(e, position) {
        console.log(e);
        this.setState({
            code: this.state.code,
            stdout: "",
            stderr: "",
            leftFlex: .5 + position.x / window.innerWidth,
            rightFlex: 1 - (.5 + position.x / window.innerWidth),
            language: this.state.language
        });
        console.log("X: " + position.x);
        console.log("inner width: " + window.innerWidth);
        console.log("Left flex: " + this.state.leftFlex);
    },
    handleLangChange: function(event) {
        this.setState({
            code: this.state.code,
            stdout: this.state.stdout,
            stderr: this.state.stderr,
            leftFlex: this.state.leftFlex,
            rightFlex: this.state.rightFlex,
            language: event.target.value
        });
    },
    render: function() {
        var options = {
            scrollbarStyle: 'null',
            lineNumbers: true,
            theme: 'solarized dark',
            mode: this.state.language,
        };

        var ws = new WebSocket('ws://localhost:8000/share');

        ws.onopen = () => {
            ws.send(JSON.stringify({
                room_number: 1234,
                client_name: "Erlich Bachman"
            }));
        };

        ws.onmessage = (e) => {
            this.setState({
                code: e.data.Content,
                stdout: this.state.stdout,
                stderr: this.state.stderr,
                leftFlex: this.state.leftFlex,
                rightFlex: this.state.rightFlex,
                language: e.data.Language
            });
            console.log(e.data);
        };

        ws.onerror = (e) => {
            console.log(e.message);
        };

        ws.onclose = (e) => {
            console.log(e.code, e.reason);
        };

        return (
            <div ref="parentDiv">
                <div className="top-menu">
                    <div className="flex-item" style={{flex: this.state.leftFlex.toString()}}>
                        <button id="run" onClick={this.runCode} className="menu-item run-button "> Run &#9658; </button>
                        <select className="lang-select" onChange={(event) => {this.handleLangChange(event);
                            ws.send(JSON.stringify({
                                Language: this.state.language,
                                Content: this.state.code
                            }));}}>
                                <option value="go">Go</option>
                                <option value="python">Python</option>
                        </select>
                    </div>
                    <div className="flex-item" style={{flex: this.state.rightFlex.toString()}}>
                        <button onClick={this.clear} className="menu-item"> Clear </button>
                    </div>
                </div>
                <div className="flex-container">
                    <div className="flex-item code-container" style={{flex: this.state.leftFlex.toString()}}>
                        <CodeMirror value={this.state.code}
                        onChange={(event) => {this.updateCode(event);
                            ws.send(JSON.stringify({
                                Language: this.state.language,
                                Content: this.state.code
                            }));}}
                        options={options} />
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
                    <div className="flex-item code-container" style={{backgroundColor: "#002b36", flex: this.state.rightFlex.toString()}}>
                        <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stdout}</pre>
                        <pre style={{color: "#FFFFFF", fontFamily: 'Courier New'}}>{this.state.stderr}</pre>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(<App />, document.getElementById('app'));

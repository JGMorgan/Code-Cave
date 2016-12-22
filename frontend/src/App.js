var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');
var Draggable = require('react-draggable');

require('codemirror/lib/codemirror.css');
require('codemirror/mode/go/go');
require('codemirror/mode/python/python');
require("codemirror/theme/3024-day.css")
require("codemirror/theme/3024-night.css")
require("codemirror/theme/abcdef.css")
require("codemirror/theme/ambiance.css")
require("codemirror/theme/base16-dark.css")
require("codemirror/theme/bespin.css")
require("codemirror/theme/base16-light.css")
require("codemirror/theme/blackboard.css")
require("codemirror/theme/cobalt.css")
require("codemirror/theme/colorforth.css")
require("codemirror/theme/dracula.css")
require("codemirror/theme/duotone-dark.css")
require("codemirror/theme/duotone-light.css")
require("codemirror/theme/eclipse.css")
require("codemirror/theme/elegant.css")
require("codemirror/theme/erlang-dark.css")
require("codemirror/theme/hopscotch.css")
require("codemirror/theme/icecoder.css")
require("codemirror/theme/isotope.css")
require("codemirror/theme/lesser-dark.css")
require("codemirror/theme/liquibyte.css")
require("codemirror/theme/material.css")
require("codemirror/theme/mbo.css")
require("codemirror/theme/mdn-like.css")
require("codemirror/theme/midnight.css")
require("codemirror/theme/monokai.css")
require("codemirror/theme/neat.css")
require("codemirror/theme/neo.css")
require("codemirror/theme/night.css")
require("codemirror/theme/panda-syntax.css")
require("codemirror/theme/paraiso-dark.css")
require("codemirror/theme/paraiso-light.css")
require("codemirror/theme/pastel-on-dark.css")
require("codemirror/theme/railscasts.css")
require("codemirror/theme/rubyblue.css")
require("codemirror/theme/seti.css")
require("codemirror/theme/solarized.css")
require("codemirror/theme/the-matrix.css")
require("codemirror/theme/tomorrow-night-bright.css")
require("codemirror/theme/tomorrow-night-eighties.css")
require("codemirror/theme/ttcn.css")
require("codemirror/theme/twilight.css")
require("codemirror/theme/vibrant-ink.css")
require("codemirror/theme/xq-dark.css")
require("codemirror/theme/xq-light.css")
require("codemirror/theme/yeti.css")
require("codemirror/theme/zenburn.css")
require('./index.css')

var ws = null;

var App = React.createClass({
    getInitialState: function() {
        return {
            code: "// Code",
            stdout: "",
            stderr: "",
            leftFlex: .5,
            rightFlex: .5,
            language: "go",
            options : {
                scrollbarStyle: 'null',
                lineNumbers: true,
                theme: 'solarized dark',
                mode: "go",
            }
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
        });
    },
    updateStdOut: function(newOut) {
        this.setState({
            stdout: newOut,
        });
    },
    updateStdErr: function(newErr) {
        this.setState({
            stderr: newErr,
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
            stdout: "",
            stderr: "",
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
            language: event.target.value
        });
    },
    sendCode: function() {
        ws.send(JSON.stringify({
            Language: this.state.language,
            Content: this.state.code
        }));
    },

    handleThemeChange: function(event) {
        this.setState({
            options: {
                scrollbarStyle: 'null',
                lineNumbers: true,
                theme: event.target.value,
                mode: this.state.language,
            }
        });
    },
    componentDidMount: function() {
        var self = this;
        ws = new WebSocket('ws://localhost:8000/share');

        ws.onopen = () => {
            ws.send(JSON.stringify({
                Room_number: 1234,
                Client_name: "Erlich Bachman"
            }));
        };

        ws.onmessage = (e) => {
            self.setState({
                code: e.data.Content,
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

    },
    render: function() {

        return (
            <div ref="parentDiv">
                <div className="top-menu">
                    <div className="flex-item" style={{flex: this.state.leftFlex.toString()}}>
                        <button id="run" onClick={this.runCode} className="menu-item run-button "> Run &#9658; </button>
                        <select className="lang-select" onChange={(event) => {this.handleLangChange(event);this.sendCode()}}>
                            <option value="go">Go</option>
                            <option value="python">Python</option>
                        </select>
                        <select className="lang-select" onChange={(event) => {this.handleThemeChange(event)}}>
                            <option>3024-day</option>
                            <option>3024-night</option>
                            <option>abcdef</option>
                            <option>ambiance</option>
                            <option>base16-dark</option>
                            <option>base16-light</option>
                            <option>bespin</option>
                            <option selected="">default</option><option>blackboard</option>
                            <option>cobalt</option>
                            <option>colorforth</option>
                            <option>dracula</option>
                            <option>duotone-dark</option>
                            <option>duotone-light</option>
                            <option>eclipse</option>
                            <option>elegant</option>
                            <option>erlang-dark</option>
                            <option>hopscotch</option>
                            <option>icecoder</option>
                            <option>isotope</option>
                            <option>lesser-dark</option>
                            <option>liquibyte</option>
                            <option>material</option>
                            <option>mbo</option>
                            <option>mdn-like</option>
                            <option>midnight</option>
                            <option>monokai</option>
                            <option>neat</option>
                            <option>neo</option>
                            <option>night</option>
                            <option>panda-syntax</option>
                            <option>paraiso-dark</option>
                            <option>paraiso-light</option>
                            <option>pastel-on-dark</option>
                            <option>railscasts</option>
                            <option>rubyblue</option>
                            <option>seti</option>
                            <option selected="selected">solarized dark</option>
                            <option>solarized light</option>
                            <option>the-matrix</option>
                            <option>tomorrow-night-bright</option>
                            <option>tomorrow-night-eighties</option>
                            <option>ttcn</option>
                            <option>twilight</option>
                            <option>vibrant-ink</option>
                            <option>xq-dark</option>
                            <option>xq-light</option>
                            <option>yeti</option>
                            <option>zenburn</option>
                        </select>
                    </div>
                    <div className="flex-item" style={{flex: this.state.rightFlex.toString()}}>
                        <button onClick={this.clear} className="menu-item"> Clear </button>
                    </div>
                </div>
                <div className="flex-container">
                    <div className="flex-item code-container" style={{flex: this.state.leftFlex.toString()}}>
                        <CodeMirror value={this.state.code}
                        onChange={(event) => {this.updateCode(event);this.sendCode()}}
                        options={this.state.options} />
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

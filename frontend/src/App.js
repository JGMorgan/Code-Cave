var React = require('react');
var ReactDOM = require('react-dom');
var CodeMirror = require('react-codemirror');
var Draggable = require('react-draggable');
import Settings  from './Settings';
var ClipboardButton = require('react-clipboard.js');


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
            roomNumber: 0,
            language: "go",
            options : {
                scrollbarStyle: 'null',
                lineNumbers: true,
                theme: 'solarized dark',
                mode: "go",
            },
            background: '#002b36',
            font: '#ffffff',
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode,
        }, () => {this.sendCode()});
    },
    updateStdOut: function(newOut) {
        this.setState({
            stdout: this.state.stdout + newOut,
        });
    },
    updateStdErr: function(newErr) {
        this.setState({
            stderr: newErr,
        });
    },
    runCode: function() {
        var self = this;
        console.log("running "+JSON.stringify(this.state));
        var runButton = document.getElementById("run");
        runButton.firstChild.data = "Stop ◼";
        runButton.className += " running";
        fetch(`http://localhost:8000/run/${self.state.language}`, {

            method: 'POST',
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Language: self.state.language,
                Content: self.state.code
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
        this.setState({
            leftFlex: .5 + position.x / window.innerWidth,
            rightFlex: 1 - (.5 + position.x / window.innerWidth),
        });
    },
    handleLangChange: function(event) {
        var _this = this;
        var lang = event.target.value
        console.log(lang);
        this.setState({
            options: {
                scrollbarStyle: 'null',
                lineNumbers: true,
                theme: _this.state.options.theme,
                mode: lang,
            }
        });
        this.setState({
            language: lang
        }, () => {this.sendCode()});

    },
    sendCode: function() {
        ws.send(JSON.stringify({
            Language: this.state.language,
            Content: this.state.code
        }));
    },
    handleBGChange: function(color){
        this.setState({
            background: color.target.value
        })
    },
    handleColorChange: function(color){
        this.setState({
            font: color.target.value
        })
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
    showSettings: function(){
        var sett = document.getElementById('settings-modal');
        sett.hidden= !sett.hidden;
    },
    successfulCopy: function(){
        var cpy = document.getElementById('copy-button');
        cpy.className += " green";
        cpy.firstChild.data = "Share✅"
        setTimeout(function(){
                   cpy.className = cpy.className.replace(/\bgreen\b/,'');
                   cpy.firstChild.data = "Share"

               }, 1000);

    },
    componentDidMount: function() {
        var self = this;
        ws = new WebSocket('ws://localhost:8000/share');

        ws.onopen = () => {
            var hashIndex = document.location.href.indexOf('#');
            var roomNum = 0;
            if (hashIndex !== -1) {
                roomNum = parseInt(document.location.href.substring(hashIndex + 1), 10);
            }
            ws.send(JSON.stringify({
                Room_number: roomNum,
                Client_name: "Erlich Bachman"
            }));
        };

        ws.onmessage = (e) => {
            var message = JSON.parse(e.data);
            console.log(message);
            if ('Room_number' in message) {
                self.setState({
                    roomNumber: message.Room_number
                });
            }else{
                self.setState({
                    code: message.Content,
                    language: message.Language
                }, ()=> {
                    console.log(this.state);
                    var ls = document.getElementById('lang-select')
                    ls.value = self.state.language
                });
            }
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
                        <select id="lang-select" defaultValue={this.state.language} className="lang-select" onChange={(event) => {this.handleLangChange(event)}}>
                            <option value="go">Go</option>
                            <option value="python">Python</option>
                            <option value="haskell">Haskell</option>
                        </select>
                        <button className="menu-item" onClick={this.showSettings}>⚙</button>
                    </div>
                    <div className="flex-item" style={{flex: this.state.rightFlex.toString()}}>
                        <button onClick={this.clear} className="menu-item"> Clear </button>
                        <ClipboardButton button-id="copy-button" onSuccess={this.successfulCopy} className="menu-item" data-clipboard-text={document.location.href.includes('#') ? document.location.href : document.location.href+'#'+this.state.roomNumber}>
                            Share
                          </ClipboardButton>
                    </div>
                </div>
                <div className="flex-container">
                    <div className="flex-item code-container" style={{flex: this.state.leftFlex.toString()}}>
                        <CodeMirror value={this.state.code}
                        onChange={(event) => {this.updateCode(event)}}
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
                    <div id="console" className="flex-item code-container" style={{backgroundColor: this.state.background, flex: this.state.rightFlex.toString()}}>
                        <pre style={{color: this.state.font, fontFamily: 'Courier New'}}>{this.state.stdout}</pre>
                        <pre style={{color: this.state.font, fontFamily: 'Courier New'}}>{this.state.stderr}</pre>
                    </div>
                </div>
                <Settings
                    handleThemeChange={this.handleThemeChange}
                    showSettings={this.showSettings}
                    handleColorChange={this.handleColorChange}
                    handleBGChange={this.handleBGChange}
                    font={this.state.font}
                    bg={this.state.background}
                    theme={this.state.options.theme}/>
            </div>
        );
    }
});

ReactDOM.render(<App />, document.getElementById('app'));

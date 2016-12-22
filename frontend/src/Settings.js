var React = require('react');

var Settings = React.createClass({

    render: function(){

        return(
            <div id="settings-modal" hidden>
                <div className="row">
                    <h2>Console Background: </h2>
                    <input
                    type="color"
                    value={this.props.bg}
                    onChange={this.props.handleBGChange}/>
                </div>
                <div className="row">
                    <h2>Console font:</h2>
                    <input
                    type="color"
                    value={this.props.font}
                    onChange={this.props.handleColorChange}/>
                </div>
                <div className="row">
                    <h2>Theme:</h2>
                    <select defaultValue={this.props.theme} className="lang-select" onChange={(event) => {this.props.handleThemeChange(event)}}>
                        <option>3024-day</option>
                        <option>3024-night</option>
                        <option>abcdef</option>
                        <option>ambiance</option>
                        <option>base16-dark</option>
                        <option>base16-light</option>
                        <option>bespin</option>
                        <option >default</option>
                        <option>blackboard</option>
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
                        <option defaultValue>solarized dark</option>
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
                <div className=" setting-ok">
                    <button className="menu-item" onClick={this.props.showSettings}>OK</button>
                </div>
            </div>
        );
    }
});

export default Settings

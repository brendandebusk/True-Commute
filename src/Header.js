import "./App.css";
import React from "react";
import Logo from "./Logo.js";
import LearnMore from "./LearnMore.js";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAbout: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if (this.state.showAbout) {
      this.setState({
        showAbout: false,
      });
    } else {
      this.setState({
        showAbout: true,
      });
    }
  }

  render() {
    return (
      <div
        id="nav"
        className={this.state.showAbout ? "nav nav-showAbout" : "nav"}
      >
        <div className="app" id="header-app">
          <div className="header">
            <div className="logo">
              <Logo />
            </div>
            <div>
              TrueCommute 
              {/* <span className="header-span">Beta</span> */}
            </div>
          </div>
        </div>
        <div className="small-logo-container">
          <div className="small-logo">TrueCommute</div>
          <div id="spacer"></div>
          <button className="learnMoreButton" onClick={this.handleClick}>
            {this.state.showAbout ? "X" : "?"}
          </button>
        </div>
        <div
          className={
            this.state.showAbout ? "small-copy small-copy-hidden" : "small-copy"
          }
        >
          Weather aware commute predictions.
        </div>
        <div
          className={
            this.state.showAbout
              ? "small-about"
              : "small-about small-about-hidden"
          }
        >
         <LearnMore />
        </div>
      </div>
    );
  }
}

export default Header;

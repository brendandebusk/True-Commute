import React from "react";
import cx from 'classnames';
import "./App.css";

class ArrivalToggleButton extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      leftActive: true,
    };

    this.toggleState = this.toggleState.bind(this);
  }

  toggleState() {
    if (this.state.leftActive) {
        this.setState({ leftActive: false });
        this.props.parentCallback(true);
    } else {
        this.setState({ leftActive: true });
        this.props.parentCallback(false);
    }
  }

  render() {
    return (
      <div>
        <div className={cx('toggle toggle-left', { 'toggle-off': !this.state.leftActive })} onClick={this.toggleState}>
          Depart at
        </div>
        <div className={cx('toggle toggle-right', { 'toggle-off': this.state.leftActive })} onClick={this.toggleState}>
          Arrive by
        </div>
      </div>
    );
  }
}

export default ArrivalToggleButton;

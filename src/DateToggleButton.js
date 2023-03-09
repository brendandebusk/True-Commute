import React from 'react';
import cx from 'classnames';
import './App.css';

class DateToggleButton extends React.Component {

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
              Today
            </div>
            <div className={cx('toggle toggle-right', { 'toggle-off': this.state.leftActive })} onClick={this.toggleState}>
              Tomorrow
            </div>
          </div>
        );
      }
}

export default DateToggleButton;
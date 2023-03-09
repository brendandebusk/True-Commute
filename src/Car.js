import React from 'react';
import './animation.css';

class Car extends React.Component {

    // constructor(props) {
    //     super(props);
    // }

    render() {
        
        const styles = {
            height: `${this.props.circleDiam}px`,
            width: `${this.props.circleDiam}px`,
            left: `${this.props.posX}px`,
            top: `${this.props.posY}px`,
        };

        return (
            <div className="circle" style={styles}>
            </div>
        );
    }

}

export default Car
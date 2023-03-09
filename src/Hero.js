import React from 'react';
import './App.css';
import AnimationController from './AnimationController.js';

class Hero extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            displayLearn: false
        }
    }

    render() {
        return (
            <div>
                <AnimationController />
            </div>
        );
    }
}

export default Hero
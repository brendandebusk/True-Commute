import React from 'react';
import Car from './Car.js';
import './animation.css';

//animation controls + references
let speedX = 1.5;
const curveRadius = 90;
const circleDiam = 20;

const offsetWidth = 900;
const offsetHeight = 600;

const maxPosition = offsetWidth + 400;

class Track extends React.Component {
    constructor(props) {
        super(props);
        const orientation = this.setOrientation();
        const trackX = this.setTrackX(orientation, offsetWidth);
        const trackY = this.setTrackY(orientation, offsetHeight);
        const carStartX = this.setCarStartX(orientation, offsetWidth, circleDiam);
        const carStartY = this.setCarStartY(orientation, offsetHeight, circleDiam);
        const delay = this.setDelay();

        this.state = {
            orientation: orientation,
            trackX: trackX,
            trackY: trackY,
            carStartX: carStartX,
            carStartY: carStartY,
            delay: delay,
            carX: carStartX,
            carY: carStartY,
            circleDiam: circleDiam,
            counter: 0
        }

        this.getRandomInt = this.getRandomInt.bind(this);
        this.setOrientation = this.setOrientation.bind(this);
        this.setTrackX = this.setTrackX.bind(this);
        this.setTrackY = this.setTrackY.bind(this);
        this.setCarStartX = this.setCarStartX.bind(this);
        this.setCarStartY = this.setCarStartY.bind(this);
        this.animate = this.animate.bind(this);
        this.setDelay = this.setDelay.bind(this);

        setTimeout(() => {
            window.requestAnimationFrame(() => this.animate());
        }, delay);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setOrientation() {
        return this.getRandomInt(0, 1);
    }

    setTrackX(orientation, offsetWidth) {
        let x;
        if (orientation === 0) {
            x = this.getRandomInt(0.9*offsetWidth,1.2*offsetWidth);
        } else
            if (orientation === 1) {
                x = this.getRandomInt(0.9*offsetWidth,1.2*offsetWidth);
            };

        return x;
    }

    setTrackY(orientation, offsetHeight) {
        let y;
        if (orientation === 1) {
            y = this.getRandomInt(curveRadius/2, curveRadius*2);
        } else if (orientation === 0) {
            y = this.getRandomInt(-5*curveRadius,-3.5*curveRadius);
        };

        return y;
    }

    setCarStartX(orientation, offsetWidth, circleDiam) {
        let startX;
        if (orientation === 0) {
            startX = -1 * (circleDiam/2);
        } else if (orientation === 1) {
            startX = offsetWidth - (circleDiam/2);
        };

        return startX; 
    }

    setCarStartY(orientation, offsetHeight, circleDiam) {
        let startY;
        if (orientation === 0) {
            startY = -1*(circleDiam/2);
        } else if (orientation === 1) {
            startY = -1*(circleDiam/2);
        };

        return startY;
    }

    setDelay() {
        return this.getRandomInt(0, 3000);
    }

    animate() {
        let counterHolder = this.state.counter;
        this.setState({counter: counterHolder + speedX})
        if (this.state.counter < maxPosition) {
            let posXHolder;
            let posYHolder;
            if (this.state.orientation === 1) {
                if (this.state.counter < (offsetWidth - curveRadius)) {
                    posXHolder = this.state.carStartX - this.state.counter;
                } else if (this.state.counter > (offsetWidth - curveRadius) && this.state.counter < offsetWidth) {
                    const anglePos = 180 - (offsetWidth - this.state.counter);
                    const radianPos = anglePos * (Math.PI / 180);
                    posXHolder = this.state.carStartX - offsetWidth + curveRadius + (curveRadius * Math.cos(radianPos));
                    posYHolder = this.state.carStartY + curveRadius + (-1 * curveRadius * Math.sin(radianPos));
                } else if (this.state.counter > offsetWidth) {
                    posYHolder = this.state.carStartY + curveRadius - offsetWidth + this.state.counter;
                }
            } 
            else {
                if (this.state.counter < (offsetHeight - curveRadius)) {
                    posYHolder = this.state.carStartY + this.state.counter;
                } else if (this.state.counter > (offsetHeight - curveRadius) && this.state.counter < offsetHeight) {
                    const anglePos = (270 - (offsetHeight - this.state.counter)) + 1;
                    const radianPos = anglePos * (Math.PI / 180);
                    posYHolder = this.state.carStartY + offsetHeight - curveRadius + (-1*(curveRadius * Math.sin(radianPos)));
                    posXHolder = this.state.carStartX + curveRadius + (curveRadius * Math.cos(radianPos));
                } else if (this.state.counter > offsetHeight) {
                    posXHolder = this.state.carStartX + this.state.counter + curveRadius - offsetHeight;
                }
            }
            this.setState({
                carX: posXHolder,
                carY: posYHolder
            })
            window.requestAnimationFrame(() => this.animate());
        }

        // checks if at max position then calls back to parent with index
        if (this.state.counter >= maxPosition) {
            this.props.parentCallback(this.props.index);
        }
    };

    // componentDidMount() {

    // }

    render() {
        const styles = {
            left: `${this.state.trackX}px`,
            top: `${this.state.trackY}px`,
            height: `${offsetHeight}px`,
            width: `${offsetWidth}px`
        };

        return (
            <div className="track" style={styles}>
                <Car
                    posX={this.state.carX}
                    posY={this.state.carY}
                    circleDiam={this.state.circleDiam}
                />
            </div>
        );
    }

}

export default Track




//island of misfit functions


    // //shouldn't be needed?
    // componentWillUnmount() {
    //     counter = { x: 0, y: 0 };
    // }


        // static getDerivedStateFromProps(props, state) {

    //     return {
    //         offsetWidth: offsetWidthBackup,
    //         offsetHeight: offsetHeightBackup,
    //     }
    // }
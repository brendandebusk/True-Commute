import React from 'react';
import './animation.css';

///////////// GLOBAL FUNCTIONS ///////////

// random integer generator between two numbers
function getRandomInt(min, max) {
    // i was like, there's no way this doesn't exist in JS already
    // but low and behold the MDN thing only suggests this!
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//removes all elements from DOM
function globalResetCanvas(track, car) {
    document.getElementById(track).remove();
    document.getElementById(car).remove();
    // document.getElementById('trackId' + i).remove();
    // document.getElementById('circleId' + i).remove();
}

class Track {
    constructor(num) {
        this.orientation = this.setOrientation();
        this.trackX = this.setXPos();
        this.trackY = this.setYPos();
        this.trackElement = document.createElement('div');
        this.trackElement.className = 'track';
        this.trackElement.style.left = this.trackX + 'px';
        this.trackElement.style.top = this.trackY + 'px';
        this.trackElement.style.height = canvas.offsetHeight + 'px';
        this.trackElement.style.width = canvas.offsetWidth + 'px';
        this.trackElement.id = 'trackId' + num;
        this.curveX = this.setCurveX();
        this.curveY = this.setCurveY();
        this.carElement = document.createElement('div');
        this.carElementX = this.setCarStartX();
        this.carElementY = this.setCarStartY();
        this.carElement.style.left = this.carElementX + 'px';
        this.carElement.style.top = this.carElementY + 'px';
        this.carElement.className = 'circle';
        // can set this directly bc we use the element reference most of the time
        this.carElement.id = 'circleId' + num;
        this.carElement.style.height = circleDiam + 'px';
        this.carElement.style.width = circleDiam + 'px';
        this.carElement.style.animation = 'circleFrame' + num + ' 5s linear';
        this.carElement.style.transformOrigin = '0px 50px';
    }

    setOrientation() {
        return getRandomInt(0, 1);
    }

    setXPos() {
        let xValue = 0;
        if (this.orientation === 0) {
            xValue = getRandomInt((curveRadius * 2) - canvas.offsetWidth, canvas.offsetWidth - canvas.offsetWidth - (curveRadius * 2));
        } else if (this.orientation === 1) {
            xValue = getRandomInt((curveRadius * 2), canvas.offsetWidth - (curveRadius * 2));
        }
        return xValue;
    }

    setYPos() {
        let yValue = 0;
        if (this.orientation === 1) {
            yValue = getRandomInt((curveRadius * 2), canvas.offsetHeight - (curveRadius * 2));
        } else if (this.orientation === 0) {
            yValue = getRandomInt((curveRadius * 2) - canvas.offsetHeight, canvas.offsetHeight - canvas.offsetHeight - (curveRadius * 2));
        }
        return yValue;
    }

    setCurveX() {
        let curveXValue = 0;
        if (this.orientation === 0) {
            curveXValue = this.trackX + canvas.offsetWidth - curveRadius;
        } else if (this.orientation === 1) {
            curveXValue = this.trackX - (circleDiam / 2) + curveRadius;
        }
        return curveXValue;
    }

    setCurveY() {
        let curveYValue = 0;
        if (this.orientation === 1) {
            curveYValue = this.trackY - (circleDiam / 2) + curveRadius;
        } else if (this.orientation === 0) {
            curveYValue = this.trackY + canvas.offsetHeight - curveRadius;
        }
        return curveYValue;
    }

    setCarStartX() {
        let carStartXValue = 0;
        if (this.orientation === 0) {
            carStartXValue = this.trackX - (circleDiam / 2);
        } else if (this.orientation === 1) {
            carStartXValue = this.trackX + canvas.offsetWidth - (circleDiam / 2);
        }
        return carStartXValue;
    }

    setCarStartY() {
        let carStartYValue = 0;
        if (this.orientation === 0) {
            carStartYValue = this.trackY + canvas.offsetHeight - (circleDiam / 2) + 1;
        } else if (this.orientation === 1) {
            carStartYValue = this.trackY - (circleDiam / 2);
        }
        return carStartYValue;
    }

}

class TrackModelCollection {
    constructor() {
        this.items = [];

        // if something always has to happen at object creation and only needs to happen once
        // it is a good candidate to move to the constructor. this comes w/ added benefit of having
        // a known good state to start from.
        for (let i = 0; i < trackQuant; i++) {
            this.items.push(new Track(i));
        }

        // add tracks to canvas
        // uses modern for syntax to allow us to access array items directly
        for (const item of this.items) {
            canvas.append(item.trackElement);
            canvas.append(item.carElement);
            // modern callback function syntax
            // you should prefer it because it's `this` semantics make
            // more sense (don't worry about that yet)
            setTimeout(() => {
                item.trackElement.style.opacity = '1';
            }, 500);
        }
    }

    // used to fade out tracks, starts globalResetCanvas (to remove elements from DOM),
    // starts resetArray (erase the array of objects), then re-initialize the elements
    fadeTracks() {
        if (this.items.length > 0) {
            for (const item of this.items) {
                item.trackElement.style.opacity = '0';
                item.trackElement.addEventListener('webkitTransitionEnd', () => {
                    globalResetCanvas(item.trackElement.id, item.carElement.id);
                }, false);
            }
            this.resetArray();
            setTimeout(() => {
                init();
            }, 1000)
        } else {
            console.log('Nothing to fade');
        }
    }

    // erases the array of objects
    resetArray() {
        this.items.splice(0, this.items.length);
        console.log('array reset');
    }
}

// reusable version of individual step functions (including comments for how i refactored them
// prior to making it reusable)
// don't use async keyword on a function if it's not going to await anything
function animate(step, isFinal = false) {
    const counter = counters[step];
    counter.x = counter.x + speedX;
    // reverse nesting if inside if has to happen for either one
    if (counter.x < maxPosition) {
        // best practice to delay work until you know you'll need the result
        const { offsetWidth } = canvas;
        const { carElement, carElementX, carElementY, orientation } = trackCollection.items[step];
        if (orientation === 1) {
            // RIGHT TO LEFT //
            if (counter.x < (offsetWidth - curveRadius)) {
                carElement.style.left = carElementX - counter.x + 'px';
            } else if (counter.x > (offsetWidth - curveRadius) && counter.x < offsetWidth) {
                const anglePos = 180 - (offsetWidth - counter.x);
                const radianPos = anglePos * (Math.PI / 180);
                carElement.style.left = carElementX - offsetWidth + curveRadius + (curveRadius * Math.cos(radianPos)) + 'px';
                carElement.style.top = carElementY + curveRadius + (-1 * curveRadius * Math.sin(radianPos)) + 'px';
            } else if (counter.x > offsetWidth) {
                counter.y = counter.y + speedX;
                carElement.style.top = carElementY + curveRadius + counter.y + 'px';
            }
        } else {
            // LEFT TO RIGHT //
            if (counter.x < (offsetWidth - curveRadius)) {
                carElement.style.left = carElementX + counter.x + 'px';
            } else if (counter.x > (offsetWidth - curveRadius) && counter.x < offsetWidth) {
                const anglePos = (360 - (offsetWidth - counter.x)) + 1;
                const radianPos = anglePos * (Math.PI / 180);
                carElement.style.left = carElementX + offsetWidth - curveRadius + (curveRadius * Math.cos(radianPos)) + 2 + 'px';
                carElement.style.top = carElementY - curveRadius + (-1 * curveRadius * Math.sin(radianPos)) + 'px';
            } else if (counter.x > offsetWidth) {
                counter.y = counter.y + speedX;
                carElement.style.top = carElementY - curveRadius - counter.y + 'px';
            }
        }

        window.requestAnimationFrame(() => animate(step, isFinal));
    }

    // with counters in an array you can just loop if all of them need to meet some condition
    if (isFinal && counters.every((counter) => counter.x === maxPosition)) {
        trackCollection.fadeTracks();
    }
}

//starts animation functions, resets counters to 0
function init() {

    //fills trackCollection with track/car objects
    trackCollection = new TrackModelCollection();
    console.log("objects created")

    // reset all counters in a loop
    counters.forEach((counter) => {
        counter.x = 0;
        counter.y = 0;
    });

    //shortest
    window.requestAnimationFrame(() => animate(0));
    // //middle
    setTimeout(() => {
        window.requestAnimationFrame(() => animate(1));
    }, 1000);
    // //longest
    setTimeout(() => {
        window.requestAnimationFrame(() => animate(2, true));
    }, 3000);
}

// declares array for collecting tracks
let trackCollection;

//Begin new React code

export class Animation extends React.Component {

    //when calling component, must pass [0, 1, 2]
    constructor(props) {
        super(props);
        this.state = {
            orientation: this.setOrientation(),
            trackX: this.setXPos(),
            trackY: this.setYPos(),
            trackElement: document.createElement('div'),
            trackElement.className: 'track',
            trackElement.style.left: this.trackX + 'px',
            trackElement.style.top: this.trackY + 'px',
            trackElement.style.height: canvas.offsetHeight + 'px',
            trackElement.style.width: canvas.offsetWidth + 'px',
            trackElement.id: 'trackId' + props,
            curveX: this.setCurveX(),
            curveY: this.setCurveY(),
            carElement: document.createElement('div'),
            carElementX: this.setCarStartX(),
            carElementY: this.setCarStartY(),
            carElement.style.left: this.carElementX + 'px',
            carElement.style.top: this.carElementY + 'px',
            carElement.className: 'circle',
            // can set this directly bc we use the element reference most of the time
            carElement.id: 'circleId' + props,
            carElement.style.height: circleDiam + 'px',
            carElement.style.width: circleDiam + 'px',
            carElement.style.animation: 'circleFrame' + props + ' 5s linear',
            carElement.style.transformOrigin: '0px 50px'
        };
    }

    // //defines track turn radius
    // const curveRadius = 90;
    // //defines number of tracks
    // const trackQuant = 3;
    // //define car size
    // const circleDiam = 20;

    // //animation controls + references
    // const refreshRate = 1000 / 60;
    // const maxPosition = 1890;
    // let speedX = 1;

    // // combine counters into an array of objects where they can be referenced by index
    // const counters = [
    //     { x: 0, y: 0 },
    //     { x: 0, y: 0 },
    //     { x: 0, y: 0 }
    // ];

    componentDidMount() {
        // start scripts
        init();
    }

    render() {
        return (
            <div>
                <div className="circle" id="circle0">
                </div>
                <div className="circle" id="circle1">
                </div>
                <div className="circle" id="circle2">
                </div>
                <div className="track" id="track0">
                </div>
                <div className="track" id="track1">
                </div>
                <div className="track" id="track2">
                </div>
            </div>
        );
    }
}
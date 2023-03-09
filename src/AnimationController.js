import React from "react";
import "./animation.css";
import Track from "./Track.js";
import LearnMore from "./LearnMore.js";

let animationSize = 2;

// used to track animation status, 0 = not completed, 1 = completed
let animationStatus = [...Array(animationSize)].map((i) => 0);

class AnimationController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracksMounted: true,
      tracksVisible: false,
      learnMoreVisible: false,
    };
    this.collectCompletion = this.collectCompletion.bind(this);
    this.resetAnimationStatus = this.resetAnimationStatus.bind(this);
    this.handleLearnMoreButton = this.handleLearnMoreButton.bind(this);
  }

  //logic to handle completion, log to tracker, then kickoff logic to
  //check if all are done before resetting
  collectCompletion = (index) => {
    // console.log(`AnimationController: completion of track ${index} logged`);
    animationStatus[index] = 1;
    // eslint-disable-next-line
    const result = animationStatus.every((element) => {
      if (element === 1) {
        return true;
      }
    });
    if (result) {
      // console.log('fading out tracks');
      this.setState({
        tracksVisible: false,
      });

      setTimeout(() => {
        // console.log('unmounting tracks');
        this.setState({
          tracksMounted: false,
        });
        this.resetAnimationStatus();
      }, 1000);
    }
  };

  //resets status tracker to all zeros, re-adds tracks to DOM
  resetAnimationStatus() {
    animationStatus.forEach((element, index) => {
      animationStatus[index] = 0;
    });

    setTimeout(() => {
      // console.log('re-mounting tracks');
      this.setState({
        tracksMounted: true,
      });
    }, 1000);

    setTimeout(() => {
      // console.log('fading tracks into view');
      this.setState({
        tracksVisible: true,
      });
    }, 1000);
  }

  handleLearnMoreButton() {
    if (this.state.learnMoreVisible) {
      this.setState({
        learnMoreVisible: false,
      });
    } else {
      this.setState({
        learnMoreVisible: true,
      });
    }
  }

  componentDidMount() {
    this.setState({
      tracksVisible: true,
    });
  }

  render() {
    return (
      <div className="animation-container">
        <div
          className={
            this.state.learnMoreVisible ? "learnMore" : "learnMore-off"
          }
        >
         <LearnMore />
          <br></br>
          <button
            className="learnMoreButton"
            onClick={this.handleLearnMoreButton}
          >
            Close
          </button>
        </div>
        <div
          className={
            this.state.learnMoreVisible ? "defaultHeader-off" : "defaultHeader"
          }
        >
          <div className="copy">
            <div className="copy-item">
              <span className="copy-highlight">
                Weather aware commute predictions.
              </span>
              <br></br>
              {/* <br></br>
                        Because sometimes the weather can be surprising. */}
            </div>
            <div className="copy-item">
              <button
                className="learnMoreButton"
                onClick={this.handleLearnMoreButton}
              >
                Learn more
              </button>
            </div>
          </div>
          <div className="fade"></div>
          <div
            className={
              this.state.tracksVisible ? "trackContainer" : "trackContainer-off"
            }
          >
            {this.state.tracksMounted && (
              <>
                {[...Array(animationSize)].map((_, index) => (
                  <Track
                    key={index}
                    index={index}
                    parentCallback={this.collectCompletion}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default AnimationController;

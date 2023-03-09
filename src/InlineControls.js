import React, { useState } from "react";
import cx from 'classnames';
import "./App.css";

import Close from './icons/close.png';
import Share from './icons/share.png';
import AppleMaps from './icons/applemaps.png';
import GoogleMaps from './icons/googlemaps.png';

const InlineControls = (props) => {
  const [show, setShow] = useState(false);

  const ChangeState = () => {
    setShow(!show);
  };

  return (
    <div>
      <div className="inline-button" onClick={ChangeState}>
        <img
          className="inline-button-image-main"
          alt="Show sharing options"
          src={show ? Close : Share}
        ></img>
      </div>
      <a href={props.google} target="_blank" rel="noreferrer">
        <div
          className={cx('inline-button', {'inline-button-item1-hidden': !show})}
        >
          <img
            className="inline-button-image-google"
            alt="Open in Google Maps"
            src={GoogleMaps}
          ></img>
        </div>
      </a>
      <a href={props.apple} target="_blank" rel="noreferrer">
        <div
          className={cx('inline-button', {'inline-button-item2-hidden': !show})}
        >
          <img
            className="inline-button-image-google"
            alt="Open in Apple Maps"
            src={AppleMaps}
          ></img>
        </div>
      </a>
    </div>
  );
};

export default InlineControls;
